import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KYCVerificationModel } from '@/models/KYCVerification';
import { AdminActionModel } from '@/models/AdminAction';
import { UserModel } from '@/models/User';
import { getCurrentSession } from '@/lib/session';
import { notificationService } from '@/services/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { partnerId, status, rejectionReason } = body;

    if (!partnerId || !['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Valid partnerId and status required' }, { status: 400 });
    }

    await connectDB();
    const kyc = await KYCVerificationModel.findOne({ partnerId });
    if (!kyc) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    const previousStatus = kyc.status;
    kyc.status = status;
    kyc.reviewedBy = session.email;
    if (status === 'VERIFIED') {
      kyc.verifiedAt = new Date();
      kyc.rejectionReason = undefined;
    } else if (status === 'REJECTED') {
      kyc.rejectionReason = rejectionReason || 'KYC documentation could not be verified.';
    }
    await kyc.save();

    // Audit log
    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: `TRAVELLER_KYC_${status}`,
      targetType: 'TRAVELLER',
      targetId: partnerId,
      details: {
        previousStatus,
        newStatus: status,
        rejectionReason,
      },
    });

    // Notify Traveller
    await notificationService.notify({
      userId: partnerId,
      title: `KYC Status: ${status === 'VERIFIED' ? 'Verified ✓' : status}`,
      message:
        status === 'VERIFIED'
          ? 'Congratulations! Your identity and locality have been verified. You can now accept customer delivery routes.'
          : `Your KYC verification was ${status.toLowerCase()}. ${rejectionReason || ''}`,
      type: 'KYC_STATUS_UPDATED',
      entityType: 'KYC',
      entityId: partnerId,
    });

    return NextResponse.json({
      success: true,
      kyc: kyc.toObject(),
    });
  } catch (err: any) {
    console.error('Verify traveller error:', err);
    return NextResponse.json({ error: 'Failed to verify traveller KYC' }, { status: 500 });
  }
}
