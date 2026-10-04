import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { getCurrentSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const query: any = {};

    if (session.role === 'CUSTOMER') {
      query.customerId = session.userId;
    } else if (session.role === 'SHOP') {
      query.shopId = session.shopId;
    } else if (session.role === 'TRAVELLER') {
      query.travellerId = session.userId;
    }
    // Admin sees all

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders: any[] = await OrderModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    // Security: Only customer or admin gets to see the plain deliveryOtp
    const sanitized = orders.map((ord: any) => {
      const isCustomerOrAdmin = session.role === 'ADMIN' || ord.customerId === session.userId;
      return {
        ...ord,
        _id: ord._id.toString(),
        deliveryOtp: isCustomerOrAdmin ? ord.deliveryOtp : undefined,
      };
    });

    return NextResponse.json({ success: true, count: sanitized.length, orders: sanitized });
  } catch (err: any) {
    console.error('Get orders error:', err);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
