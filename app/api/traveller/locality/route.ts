import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PartnerLocalityModel } from '@/models/PartnerLocality';
import { getCurrentSession } from '@/lib/session';
import { kycService } from '@/services/KYCService';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const locality: any = await PartnerLocalityModel.findOne({ partnerId: session.userId }).lean();
    return NextResponse.json({ success: true, locality });
  } catch (err: any) {
    console.error('Get locality error:', err);
    return NextResponse.json({ error: 'Failed to retrieve locality' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'TRAVELLER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only travellers can update partner locality' }, { status: 403 });
    }

    const body = await req.json();
    const { localityName, city, district, state, postalCode, latitude, longitude, radiusKm, reason } = body;

    if (!localityName || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Locality name and valid latitude/longitude coordinates are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const locality = await kycService.setPartnerLocality({
      partnerId: session.userId,
      localityName,
      city: city || 'Local Area',
      district: district || '',
      state: state || '',
      postalCode: postalCode || '000000',
      latitude,
      longitude,
      radiusKm: radiusKm || 5, // Capped at 7 km inside service
      verifiedBy: session.name,
      reason: reason || 'Partner updated locality',
    });

    return NextResponse.json({ success: true, locality });
  } catch (err: any) {
    console.error('Update locality error:', err);
    return NextResponse.json({ error: 'Failed to update locality' }, { status: 500 });
  }
}
