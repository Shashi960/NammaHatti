import { Location } from './location';

export type ShopVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface Shop {
  _id: string;
  ownerId: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  description: string;
  address: string;
  landmark?: string;
  openingTime: string; // e.g. "08:00"
  closingTime: string; // e.g. "21:00"
  images: string[];
  verificationStatus: ShopVerificationStatus;
  minOrderAmount: number; // 0 if no minimum
  location: Location;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
