import mongoose, { Schema, Document } from 'mongoose';
import { LocationSubSchema } from './LocationSchema';
import { ShopVerificationStatus } from '@/types/shop';
import { Location } from '@/types/location';

export interface IShop extends Document {
  ownerId: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  description: string;
  address: string;
  landmark?: string;
  openingTime: string;
  closingTime: string;
  images: string[];
  verificationStatus: ShopVerificationStatus;
  minOrderAmount: number;
  location: Location;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    ownerId: { type: String, required: true, index: true },
    businessName: { type: String, required: true, index: 'text' },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    openingTime: { type: String, default: '08:00' },
    closingTime: { type: String, default: '21:00' },
    images: { type: [String], default: [] },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    minOrderAmount: { type: Number, default: 0 },
    location: { type: LocationSubSchema, required: true },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ShopSchema.index({ 'location.geoJSON': '2dsphere' });
ShopSchema.index({ businessName: 'text', description: 'text' });

export const ShopModel = mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);
