import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TravellerTripModel } from '@/models/TravellerTrip';
import { travellerTripSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';
import { createLocation } from '@/types/location';
import { kycService } from '@/services/KYCService';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const query: any = {};
    if (session.role === 'TRAVELLER') {
      query.travellerId = session.userId;
    }

    const trips = await TravellerTripModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      trips: trips.map((t: any) => ({ ...t, _id: t._id.toString() })),
    });
  } catch (err: any) {
    console.error('Get trips error:', err);
    return NextResponse.json({ error: 'Failed to retrieve trips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    if (session.role !== 'TRAVELLER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only travellers can declare trips' }, { status: 403 });
    }

    await connectDB();

    // Check KYC status: Inform user if not verified
    const kyc = await kycService.getVerificationStatus(session.userId);

    const body = await req.json();
    const parsed = travellerTripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const origin = createLocation({
      formattedAddress: parsed.data.origin.formattedAddress,
      latitude: parsed.data.origin.latitude,
      longitude: parsed.data.origin.longitude,
      city: parsed.data.origin.city,
      district: parsed.data.origin.district,
      state: parsed.data.origin.state,
      country: parsed.data.origin.country,
      postalCode: parsed.data.origin.postalCode,
      landmark: parsed.data.origin.landmark,
    });

    const destination = createLocation({
      formattedAddress: parsed.data.destination.formattedAddress,
      latitude: parsed.data.destination.latitude,
      longitude: parsed.data.destination.longitude,
      city: parsed.data.destination.city,
      district: parsed.data.destination.district,
      state: parsed.data.destination.state,
      country: parsed.data.destination.country,
      postalCode: parsed.data.destination.postalCode,
      landmark: parsed.data.destination.landmark,
    });

    const trip = await TravellerTripModel.create({
      travellerId: session.userId,
      travellerName: session.name,
      travellerPhone: session.phone || '',
      origin,
      destination,
      travelDate: parsed.data.travelDate,
      departureTime: parsed.data.departureTime,
      estimatedArrivalTime: parsed.data.estimatedArrivalTime,
      maxPackageCapacity: parsed.data.maxPackageCapacity,
      currentPackageCount: 0,
      maxWeightKg: parsed.data.maxWeightKg,
      currentWeightKg: 0,
      status: 'PLANNED',
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      success: true,
      trip: {
        ...trip.toObject(),
        _id: trip._id.toString(),
      },
      isKycVerified: kyc.isVerified,
      warning: !kyc.isVerified
        ? 'KYC verification is required before accepting customer orders.'
        : undefined,
    });
  } catch (err: any) {
    console.error('Create trip error:', err);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
