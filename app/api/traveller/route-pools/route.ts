import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RoutePoolModel } from '@/models/RoutePool';
import { TravellerTripModel } from '@/models/TravellerTrip';
import { OrderModel } from '@/models/Order';
import { getCurrentSession } from '@/lib/session';
import { routeMatchingService } from '@/services/RouteMatchingService';
import { kycService } from '@/services/KYCService';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const query: any = {};
    if (session.role === 'TRAVELLER') {
      // Traveller sees their accepted/active pools or open pools
      query.$or = [{ travellerId: session.userId }, { status: 'OPEN' }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const pools: any[] = await RoutePoolModel.find(query).sort({ createdAt: -1 }).lean();

    // Populate orders summary for each pool
    const enriched = await Promise.all(
      pools.map(async (p: any) => {
        const orders: any[] = await OrderModel.find({ _id: { $in: p.orderIds } })
          .select('orderNumber shopName customerName items deliveryLocation total travellerEarnings orderStatus')
          .lean();
        return {
          ...p,
          _id: p._id.toString(),
          orders: orders.map((o: any) => ({ ...o, _id: o._id.toString() })),
        };
      })
    );

    return NextResponse.json({ success: true, count: enriched.length, routePools: enriched });
  } catch (err: any) {
    console.error('Get route pools error:', err);
    return NextResponse.json({ error: 'Failed to retrieve route pools' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'TRAVELLER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only travellers can create route pools' }, { status: 403 });
    }

    await connectDB();

    // KYC Check: only verified partners can form or accept route pools
    const kyc = await kycService.getVerificationStatus(session.userId);
    if (!kyc.isVerified && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'KYC verification is required before accepting customer orders or forming route pools.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { tripId, orderIds } = body;

    if (!tripId || !orderIds || !Array.isArray(orderIds) || !orderIds.length) {
      return NextResponse.json({ error: 'tripId and non-empty orderIds array are required' }, { status: 400 });
    }

    const trip: any = await TravellerTripModel.findById(tripId).lean();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const pool = await routeMatchingService.createRoutePoolForTrip(trip as any, orderIds);

    return NextResponse.json({
      success: true,
      routePool: {
        ...pool,
        _id: pool._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Create route pool error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create route pool' }, { status: 500 });
  }
}
