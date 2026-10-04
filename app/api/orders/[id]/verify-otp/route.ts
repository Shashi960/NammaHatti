import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { RoutePoolModel } from '@/models/RoutePool';
import { getCurrentSession } from '@/lib/session';
import { verifyOtpSchema } from '@/schemas/index';
import { notificationService } from '@/services/NotificationService';
import { kycService } from '@/services/KYCService';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    if (session.role !== 'TRAVELLER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only assigned travellers or admins can verify delivery OTP' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse({ orderId: params.id, ...body });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    // Verify traveller KYC verification status
    if (session.role === 'TRAVELLER') {
      const kycStatus = await kycService.getVerificationStatus(session.userId);
      if (!kycStatus.isVerified) {
        return NextResponse.json(
          { error: 'KYC verification is required before completing customer deliveries.' },
          { status: 403 }
        );
      }
    }

    const order = await OrderModel.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.role === 'TRAVELLER' && order.travellerId !== session.userId) {
      return NextResponse.json({ error: 'You are not the assigned traveller for this order' }, { status: 403 });
    }

    // Rate-limiting check: max 5 attempts
    if (order.otpAttempts >= 5) {
      return NextResponse.json(
        { error: 'Maximum OTP attempts reached. Order delivery is locked. Please contact support.' },
        { status: 429 }
      );
    }

    // Check OTP
    if (order.deliveryOtp.trim() !== parsed.data.otp.trim()) {
      order.otpAttempts += 1;
      await order.save();
      return NextResponse.json(
        {
          success: false,
          error: 'Incorrect delivery code',
          remainingAttempts: Math.max(0, 5 - order.otpAttempts),
        },
        { status: 400 }
      );
    }

    // OTP Verified! Complete delivery
    order.orderStatus = 'COMPLETED';
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'PAID';
    }

    order.statusHistory.push({
      status: 'DELIVERED',
      timestamp: new Date(),
      updatedBy: session.name,
      note: 'OTP successfully verified with customer',
    });
    order.statusHistory.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      updatedBy: session.name,
      note: 'Delivery confirmed and finalized',
    });

    await order.save();

    // Check if all orders in route pool are completed
    if (order.routePoolId) {
      const remainingInPool = await OrderModel.countDocuments({
        routePoolId: order.routePoolId,
        orderStatus: { $ne: 'COMPLETED' },
      });

      if (remainingInPool === 0) {
        await RoutePoolModel.findByIdAndUpdate(order.routePoolId, {
          status: 'COMPLETED',
          completedAt: new Date(),
        });
      }
    }

    // Notify Customer
    await notificationService.notify({
      userId: order.customerId,
      title: 'Package Delivered! ✓',
      message: `Your order #${order.orderNumber} from ${order.shopName} was successfully delivered. Thank you for supporting local businesses!`,
      type: 'ORDER_DELIVERED',
      entityType: 'ORDER',
      entityId: order._id.toString(),
    });

    // Notify Traveller of earnings
    await notificationService.notify({
      userId: session.userId,
      title: 'Earnings Credited! ✓',
      message: `Delivery confirmed for order #${order.orderNumber}. ₹${order.travellerEarnings} credited to your earnings wallet!`,
      type: 'EARNINGS_CREDITED',
      entityType: 'ORDER',
      entityId: order._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: '✓ Delivery Confirmed',
      order: {
        ...order.toObject(),
        _id: order._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Failed to verify delivery OTP' }, { status: 500 });
  }
}
