import { Location, GeoJSONPoint } from './location';

export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface LocalityCentroid {
  latitude: number;
  longitude: number;
  geoJSON: GeoJSONPoint;
}

export interface LocalityHistory {
  localityName: string;
  city: string;
  centroid: LocalityCentroid;
  radiusKm: number;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

export interface PartnerLocality {
  _id: string;
  partnerId: string;
  localityName: string;
  city: string;
  district?: string;
  state?: string;
  postalCode: string;
  centroid: LocalityCentroid;
  radiusKm: number; // default 5, capped at 7
  verifiedAt: Date;
  verifiedBy: string;
  history?: LocalityHistory[];
}

export interface KYCVerification {
  _id: string;
  partnerId: string;
  status: KYCStatus;
  providerName: string;
  providerReferenceId: string;
  documentType: string;
  verifiedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TripStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TravellerTrip {
  _id: string;
  travellerId: string;
  travellerName: string;
  travellerPhone: string;
  origin: Location;
  destination: Location;
  travelDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  estimatedArrivalTime: string; // HH:MM
  maxPackageCapacity: number;
  currentPackageCount: number;
  maxWeightKg: number;
  currentWeightKg: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
