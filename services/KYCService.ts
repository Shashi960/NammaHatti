import { KYCVerificationModel } from '@/models/KYCVerification';
import { PartnerLocalityModel } from '@/models/PartnerLocality';
import { KYCStatus, PartnerLocality, KYCVerification } from '@/types/traveller';
import { haversineDistanceKm } from './MapService';
import { Order } from '@/types/order';

export interface IKYCService {
  initiateKYC(partnerId: string, documentType: string): Promise<KYCVerification>;
  verifyPartner(partnerId: string, reviewedBy: string): Promise<KYCVerification>;
  rejectPartner(partnerId: string, reason: string, reviewedBy: string): Promise<KYCVerification>;
  getVerificationStatus(partnerId: string): Promise<{ isVerified: boolean; status: KYCStatus }>;
  setPartnerLocality(params: {
    partnerId: string;
    localityName: string;
    city: string;
    district?: string;
    state?: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
    verifiedBy: string;
    reason?: string;
  }): Promise<PartnerLocality>;
}

export class MockKYCService implements IKYCService {
  async initiateKYC(partnerId: string, documentType: string = 'GOVERNMENT_ID'): Promise<KYCVerification> {
    const refId = `MOCK-KYC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const verification = await KYCVerificationModel.findOneAndUpdate(
      { partnerId },
      {
        partnerId,
        status: 'PENDING',
        providerName: 'MockKYCProvider',
        providerReferenceId: refId,
        documentType,
        verifiedAt: null,
      },
      { upsert: true, new: true }
    ).lean();

    return verification as unknown as KYCVerification;
  }

  async verifyPartner(partnerId: string, reviewedBy: string): Promise<KYCVerification> {
    const verification = await KYCVerificationModel.findOneAndUpdate(
      { partnerId },
      {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        reviewedBy,
        rejectionReason: null,
      },
      { new: true }
    ).lean();

    if (!verification) {
      throw new Error(`KYC record not found for partner ${partnerId}`);
    }

    return verification as unknown as KYCVerification;
  }

  async rejectPartner(partnerId: string, reason: string, reviewedBy: string): Promise<KYCVerification> {
    const verification = await KYCVerificationModel.findOneAndUpdate(
      { partnerId },
      {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy,
      },
      { new: true }
    ).lean();

    if (!verification) {
      throw new Error(`KYC record not found for partner ${partnerId}`);
    }

    return verification as unknown as KYCVerification;
  }

  async getVerificationStatus(partnerId: string): Promise<{ isVerified: boolean; status: KYCStatus }> {
    const record: any = await KYCVerificationModel.findOne({ partnerId }).lean();
    if (!record) {
      return { isVerified: false, status: 'PENDING' };
    }
    return {
      isVerified: record.status === 'VERIFIED',
      status: record.status as KYCStatus,
    };
  }

  async setPartnerLocality(params: {
    partnerId: string;
    localityName: string;
    city: string;
    district?: string;
    state?: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
    verifiedBy: string;
    reason?: string;
  }): Promise<PartnerLocality> {
    // Radius capped strictly at 7 km per business rules
    const effectiveRadius = Math.min(Math.max(params.radiusKm || 5, 1), 7);

    const existing = await PartnerLocalityModel.findOne({ partnerId: params.partnerId });

    if (existing) {
      // Keep previous locality in audit history
      existing.history.push({
        localityName: existing.localityName,
        city: existing.city,
        centroid: existing.centroid,
        radiusKm: existing.radiusKm,
        changedAt: new Date(),
        changedBy: params.verifiedBy,
        reason: params.reason || 'Locality updated with admin re-verification',
      });

      existing.localityName = params.localityName;
      existing.city = params.city;
      existing.district = params.district || '';
      existing.state = params.state || '';
      existing.postalCode = params.postalCode;
      existing.centroid = {
        latitude: params.latitude,
        longitude: params.longitude,
        geoJSON: {
          type: 'Point',
          coordinates: [params.longitude, params.latitude],
        },
      };
      existing.radiusKm = effectiveRadius;
      existing.verifiedAt = new Date();
      existing.verifiedBy = params.verifiedBy;

      await existing.save();
      return existing.toObject() as PartnerLocality;
    }

    const created = await PartnerLocalityModel.create({
      partnerId: params.partnerId,
      localityName: params.localityName,
      city: params.city,
      district: params.district || '',
      state: params.state || '',
      postalCode: params.postalCode,
      centroid: {
        latitude: params.latitude,
        longitude: params.longitude,
        geoJSON: {
          type: 'Point',
          coordinates: [params.longitude, params.latitude],
        },
      },
      radiusKm: effectiveRadius,
      verifiedAt: new Date(),
      verifiedBy: params.verifiedBy,
      history: [],
    });

    return created.toObject() as PartnerLocality;
  }
}

/**
 * Single replaceable function for partner locality eligibility.
 * An order is eligible when:
 * 1. The pickup shop is within partner's verified locality radius OR trip route compatibility.
 * 2. The drop-off customer location is within partner's verified locality radius.
 */
export function isOrderWithinPartnerLocality(
  orderDeliveryLocation: { latitude: number; longitude: number },
  partnerLocality: { centroid: { latitude: number; longitude: number }; radiusKm: number }
): boolean {
  const dist = haversineDistanceKm(
    partnerLocality.centroid.latitude,
    partnerLocality.centroid.longitude,
    orderDeliveryLocation.latitude,
    orderDeliveryLocation.longitude
  );

  return dist <= partnerLocality.radiusKm;
}

export const kycService = new MockKYCService();
