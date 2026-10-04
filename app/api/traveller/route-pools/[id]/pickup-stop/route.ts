import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RoutePoolModel } from '@/models/RoutePool';
import { OrderModel } from '@/models/Order';
import { getCurrentSession } from '@/lib/session';
import { notificationService } from '@/services/NotificationService';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'TRAVELLER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only travellers can update pickup checklist' }, { status: 403 });
    }

    const body = await req.json();
    const { shopId } = body;
    if (!shopId) {
      return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
    }

    await connectDB();
    const pool = await RoutePoolModel.findById(params.id);
    if (!pool) {
      return NextResponse.json({ error: 'Route pool not found' }, { status: 404 });
    }

    if (pool.travellerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You are not assigned to this pool' }, { status: 403 });
    }

    const stop = pool.pickupStops.find((s: any) => s.shopId === shopId);
    if (!stop) {
      return NextResponse.json({ error: 'Pickup stop not found in this pool' }, { status: 404 });
    }

    stop.isPickedUp = true;
    stop.pickedUpAt = new Date();

    // Check if all stops in the pool are now picked up
    const allPickedUp = pool.pickupStops.every((s: any) => s.isPickedUp);
    if (allPickedUp) {
      pool.status = 'IN_PROGRESS';
    }

    await pool.save();

    // Update the orders at this shop to PICKED_UP
    await OrderModel.updateMany(
      { _id: { $in: stop.orderIds } },
      {
        $set: {
          isPickedUp: true,
          pickedUpAt: new Date(),
          orderStatus: 'PICKED_UP',
        },
        $push: {
          statusHistory: {
            status: 'PICKED_UP',
            timestamp: new Date(),
            updatedBy: session.name,
            note: `Picked up package from ${stop.shopName}`,
          },
        },
      }
    );

    // Notify customers of these orders
    const orders: any[] = await OrderModel.find({ _id: { $in: stop.orderIds } }).lean();
    for (const ord of orders) {
      await notificationService.notify({
        userId: ord.customerId,
        title: 'Order Picked Up! 📦',
        message: `Your package from ${stop.shopName} has been picked up by traveller ${session.name} and is in transit.`,
        type: 'ORDER_PICKED_UP',
        entityType: 'ORDER',
        entityId: ord._id.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Pickup confirmed from ${stop.shopName}`,
      routePool: {
        ...pool.toObject(),
        _id: pool._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Pickup stop error:', err);
    return NextResponse.json({ error: 'Failed to update pickup stop' }, { status: 500 });
  }
}
