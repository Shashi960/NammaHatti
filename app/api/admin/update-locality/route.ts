import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';
import { kycService } from '@/services/KYCService';
import { notificationService } from '@/services/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { partnerId, localityName, city, district, state, postalCode, latitude, longitude, radiusKm, reason } = body;

    if (!partnerId || !localityName || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'partnerId, localityName and valid coordinates are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const locality = await kycService.setPartnerLocality({
      partnerId,
      localityName,
      city: city || 'Local Area',
      district: district || '',
      state: state || '',
      postalCode: postalCode || '000000',
      latitude,
      longitude,
      radiusKm: radiusKm || 5, // Capped at 7km in service
      verifiedBy: session.email,
      reason: reason || 'Admin verified and updated residential locality',
    });

    // Audit log
    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: 'ADMIN_UPDATE_PARTNER_LOCALITY',
      targetType: 'TRAVELLER',
      targetId: partnerId,
      details: {
        localityName,
        city,
        latitude,
        longitude,
        radiusKm: locality.radiusKm,
        reason,
      },
    });

    // Notify partner
    await notificationService.notify({
      userId: partnerId,
      title: 'Locality Updated and Approved ✓',
      message: `Your residential locality has been updated to "${localityName}" (${locality.radiusKm} km radius) by administration.`,
      type: 'KYC_STATUS_UPDATED',
      entityType: 'KYC',
      entityId: partnerId,
    });

    return NextResponse.json({ success: true, locality });
  } catch (err: any) {
    console.error('Admin update locality error:', err);
    return NextResponse.json({ error: 'Failed to update partner locality' }, { status: 500 });
  }
}
