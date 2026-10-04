import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { ShopModel } from '@/models/Shop';
import { ProductModel } from '@/models/Product';
import { CheckoutSessionModel } from '@/models/CheckoutSession';
import { checkoutSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';
import { pricingService } from '@/services/PricingService';
import { paymentService } from '@/services/PaymentService';
import { notificationService } from '@/services/NotificationService';
import { createLocation } from '@/types/location';
import { haversineDistanceKm } from '@/services/MapService';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to complete checkout' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const { deliveryLocation, deliveryType, paymentMethod, items } = parsed.data;

    // Group items by shopId
    const shopItemsMap = new Map<string, typeof items>();
    for (const item of items) {
      if (!shopItemsMap.has(item.shopId)) {
        shopItemsMap.set(item.shopId, []);
      }
      shopItemsMap.get(item.shopId)!.push(item);
    }

    const createdOrderIds: string[] = [];
    const createdOrders: any[] = [];
    let grandTotal = 0;

    const deliveryLocObj = createLocation({
      formattedAddress: deliveryLocation.formattedAddress,
      latitude: deliveryLocation.latitude,
      longitude: deliveryLocation.longitude,
      city: deliveryLocation.city,
      district: deliveryLocation.district,
      state: deliveryLocation.state,
      country: deliveryLocation.country,
      postalCode: deliveryLocation.postalCode,
      landmark: deliveryLocation.landmark,
    });

    for (const [shopId, shopItems] of shopItemsMap.entries()) {
      const shop = await ShopModel.findById(shopId);
      if (!shop) {
        return NextResponse.json({ error: `Shop not found for items` }, { status: 404 });
      }

      // Calculate subtotal
      const subtotal = shopItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

      // Verify minimum order amount if set
      if (shop.minOrderAmount && subtotal < shop.minOrderAmount) {
        return NextResponse.json(
          { error: `${shop.businessName} requires a minimum order of ₹${shop.minOrderAmount}` },
          { status: 400 }
        );
      }

      // Check stock and decrement
      for (const it of shopItems) {
        const prod = await ProductModel.findById(it.productId);
        if (!prod || prod.stock < it.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for product: ${it.name}` },
            { status: 400 }
          );
        }
        prod.stock -= it.quantity;
        if (prod.stock === 0) prod.availability = 'OUT_OF_STOCK';
        else if (prod.stock <= 3) prod.availability = 'LOW_STOCK';
        await prod.save();
      }

      // Calculate distance between shop and delivery location
      const distanceKm = haversineDistanceKm(
        shop.location.latitude,
        shop.location.longitude,
        deliveryLocObj.latitude,
        deliveryLocObj.longitude
      );

      // Calculate fees via dynamic PricingService
      const feeCalc = await pricingService.calculateFees(subtotal, deliveryType, distanceKm);

      // Process payment
      const paymentResult = await paymentService.processPayment({
        orderId: `temp-${Date.now()}`,
        amount: feeCalc.total,
        paymentMethod,
        customerName: session.name,
        customerEmail: session.email,
      });

      // Generate 6-digit OTP
      const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const orderDoc = await OrderModel.create({
        orderNumber,
        customerId: session.userId,
        customerName: session.name,
        customerPhone: session.phone || '',
        shopId: shop._id.toString(),
        shopName: shop.businessName,
        shopLocation: shop.location,
        items: shopItems.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          unit: it.unit,
          weightKg: it.weightKg || 0.5,
          subtotal: it.price * it.quantity,
          imageUrl: it.imageUrl,
        })),
        subtotal: feeCalc.subtotal,
        deliveryFee: feeCalc.deliveryFee,
        platformFee: feeCalc.platformFee,
        travellerEarnings: feeCalc.travellerEarnings,
        total: feeCalc.total,
        deliveryLocation: deliveryLocObj,
        deliveryType,
        paymentStatus: paymentResult.paymentStatus,
        paymentMethod,
        orderStatus: 'PENDING',
        deliveryOtp,
        otpAttempts: 0,
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            updatedBy: session.name,
            note: 'Order placed by customer',
          },
        ],
      });

      createdOrderIds.push(orderDoc._id.toString());
      createdOrders.push(orderDoc.toObject());
      grandTotal += feeCalc.total;

      // Notify Shop owner
      await notificationService.notify({
        userId: shop.ownerId,
        title: 'New Order Received',
        message: `Order #${orderNumber} for ₹${feeCalc.total} placed by ${session.name}. Please review and confirm.`,
        type: 'ORDER_PLACED',
        entityType: 'ORDER',
        entityId: orderDoc._id.toString(),
      });
    }

    // Create CheckoutSession
    const sessionDoc = await CheckoutSessionModel.create({
      customerId: session.userId,
      customerName: session.name,
      customerPhone: session.phone || '',
      items,
      deliveryLocation: deliveryLocObj,
      deliveryType,
      paymentMethod,
      orderIds: createdOrderIds,
      totalAmount: grandTotal,
    });

    // Update orders with session ID
    await OrderModel.updateMany(
      { _id: { $in: createdOrderIds } },
      { checkoutSessionId: sessionDoc._id.toString() }
    );

    // Notify Customer
    await notificationService.notify({
      userId: session.userId,
      title: 'Order Placed Successfully',
      message: `Your order comprising ${createdOrderIds.length} shop shipment(s) has been placed! Total: ₹${grandTotal}.`,
      type: 'ORDER_PLACED',
      entityType: 'ORDER',
      entityId: createdOrderIds[0],
    });

    return NextResponse.json({
      success: true,
      checkoutSessionId: sessionDoc._id.toString(),
      orders: createdOrders.map((o) => ({
        ...o,
        _id: o._id.toString(),
      })),
      totalAmount: grandTotal,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
