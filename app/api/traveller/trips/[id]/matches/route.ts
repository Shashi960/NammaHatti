import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TravellerTripModel } from '@/models/TravellerTrip';
import { getCurrentSession } from '@/lib/session';
import { routeMatchingService } from '@/services/RouteMatchingService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    await connectDB();
    const trip: any = await TravellerTripModel.findById(params.id).lean();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.travellerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this trip' }, { status: 403 });
    }

    const { compatibleOrders, explanations } = await routeMatchingService.findCompatibleOrdersForTrip(
      trip as any,
      session.userId
    );

    return NextResponse.json({
      success: true,
      trip: { ...trip, _id: trip._id.toString() },
      compatibleOrders: compatibleOrders.map((o: any) => ({ ...o, _id: o._id.toString() })),
      explanations,
      count: compatibleOrders.length,
    });
  } catch (err: any) {
    console.error('Find route matches error:', err);
    return NextResponse.json({ error: 'Failed to find route matches' }, { status: 500 });
  }
}
