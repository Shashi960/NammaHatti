import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getCurrentSession } from '@/lib/session';
import { routeMatchingService } from '@/services/RouteMatchingService';
import { notificationService } from '@/services/NotificationService';
import { OrderModel } from '@/models/Order';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'TRAVELLER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only travellers can accept route pools' }, { status: 403 });
    }

    await connectDB();

    const pool = await routeMatchingService.acceptRoutePool(
      params.id,
      session.userId,
      session.name
    );

    // Send notifications to each shop and customer in the pool
    const orders: any[] = await OrderModel.find({ _id: { $in: pool.orderIds } }).lean();
    for (const ord of orders) {
      await notificationService.notify({
        userId: ord.customerId,
        title: 'Traveller Assigned! 🚗',
        message: `${session.name} is travelling your way and has been assigned to pick up and deliver your order #${ord.orderNumber}.`,
        type: 'TRAVELLER_ASSIGNED',
        entityType: 'ORDER',
        entityId: ord._id.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Route pool successfully accepted!',
      routePool: {
        ...pool,
        _id: pool._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Accept route pool error:', err);
    return NextResponse.json({ error: err.message || 'Failed to accept route pool' }, { status: 500 });
  }
}
