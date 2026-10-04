import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { getCurrentSession } from '@/lib/session';
import { validateOrderTransition } from '@/lib/orderStateMachine';
import { notificationService } from '@/services/NotificationService';
import { OrderStatus } from '@/types/order';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const nextStatus = body.status as OrderStatus;
    const note = body.note || '';

    if (!nextStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await connectDB();
    const order = await OrderModel.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Role-based status transition permissions
    const isShopOwner = order.shopId === session.shopId;
    const isAssignedTraveller = order.travellerId === session.userId;
    const isCustomer = order.customerId === session.userId;
    const isAdmin = session.role === 'ADMIN';

    if (isShopOwner) {
      if (!['SHOP_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'].includes(nextStatus)) {
        return NextResponse.json(
          { error: `Shops can only update status to Confirmed, Preparing, Ready, or Cancelled` },
          { status: 403 }
        );
      }
    } else if (isAssignedTraveller) {
      if (!['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(nextStatus)) {
        return NextResponse.json(
          { error: `Travellers can only mark Picked Up or Out for Delivery directly. Delivery requires OTP verification.` },
          { status: 403 }
        );
      }
    } else if (isCustomer) {
      if (nextStatus !== 'CANCELLED' && nextStatus !== 'DISPUTED') {
        return NextResponse.json(
          { error: `Customers can only Cancel or Dispute orders` },
          { status: 403 }
        );
      }
      if (nextStatus === 'CANCELLED' && ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.orderStatus)) {
        return NextResponse.json(
          { error: `Order has already been picked up or delivered and cannot be cancelled` },
          { status: 400 }
        );
      }
    } else if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate state machine rule
    try {
      validateOrderTransition(order.orderStatus, nextStatus);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = nextStatus;

    if (nextStatus === 'PICKED_UP') {
      order.isPickedUp = true;
      order.pickedUpAt = new Date();
    }

    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      updatedBy: `${session.name} (${session.role})`,
      note,
    });

    await order.save();

    // Trigger Notifications
    if (nextStatus === 'READY_FOR_PICKUP') {
      // Notify customer
      await notificationService.notify({
        userId: order.customerId,
        title: 'Order Ready for Pickup',
        message: `Your order #${order.orderNumber} is packed and ready. Finding compatible travellers on this route!`,
        type: 'ORDER_READY',
        entityType: 'ORDER',
        entityId: order._id.toString(),
      });
    } else if (nextStatus === 'PICKED_UP') {
      await notificationService.notify({
        userId: order.customerId,
        title: 'Order Picked Up',
        message: `Your order #${order.orderNumber} was picked up from ${order.shopName} by ${session.name}.`,
        type: 'ORDER_PICKED_UP',
        entityType: 'ORDER',
        entityId: order._id.toString(),
      });
    } else if (nextStatus === 'OUT_FOR_DELIVERY') {
      await notificationService.notify({
        userId: order.customerId,
        title: 'Out for Delivery',
        message: `Your package #${order.orderNumber} is on its way to your destination! Keep your delivery OTP ready.`,
        type: 'OUT_FOR_DELIVERY',
        entityType: 'ORDER',
        entityId: order._id.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order.toObject(),
        _id: order._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Update order status error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
