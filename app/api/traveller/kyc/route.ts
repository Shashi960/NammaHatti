import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KYCVerificationModel } from '@/models/KYCVerification';
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
    const partnerId = session.userId;
    const kyc: any = await KYCVerificationModel.findOne({ partnerId }).lean();
    const locality: any = await PartnerLocalityModel.findOne({ partnerId }).lean();

    return NextResponse.json({
      success: true,
      kyc: kyc
        ? {
            status: kyc.status,
            providerName: kyc.providerName,
            providerReferenceId: kyc.providerReferenceId,
            verifiedAt: kyc.verifiedAt,
            documentType: kyc.documentType,
            rejectionReason: kyc.rejectionReason,
          }
        : { status: 'PENDING', isMissing: true },
      locality: locality
        ? {
            localityName: locality.localityName,
            city: locality.city,
            district: locality.district,
            state: locality.state,
            postalCode: locality.postalCode,
            centroid: locality.centroid,
            radiusKm: locality.radiusKm,
            verifiedAt: locality.verifiedAt,
          }
        : null,
    });
  } catch (err: any) {
    console.error('Get KYC error:', err);
    return NextResponse.json({ error: 'Failed to retrieve KYC status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'TRAVELLER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only travellers can initiate KYC verification' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const documentType = body.documentType || 'GOVERNMENT_ID';

    const kyc = await kycService.initiateKYC(session.userId, documentType);

    // If locality data was submitted along with KYC
    if (body.locality) {
      const { localityName, city, district, state, postalCode, latitude, longitude, radiusKm } = body.locality;
      if (latitude && longitude && localityName) {
        await kycService.setPartnerLocality({
          partnerId: session.userId,
          localityName,
          city: city || 'Local Area',
          district: district || '',
          state: state || '',
          postalCode: postalCode || '000000',
          latitude,
          longitude,
          radiusKm: radiusKm || 5,
          verifiedBy: 'system-initial',
          reason: 'Initial partner locality submission',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'KYC verification submitted successfully. Awaiting verification.',
      kyc,
    });
  } catch (err: any) {
    console.error('Initiate KYC error:', err);
    return NextResponse.json({ error: 'Failed to initiate KYC' }, { status: 500 });
  }
}
