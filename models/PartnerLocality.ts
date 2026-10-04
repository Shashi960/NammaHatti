import mongoose, { Schema, Document } from 'mongoose';
import { LocalityCentroid, LocalityHistory } from '@/types/traveller';

export interface IPartnerLocality extends Document {
  partnerId: string;
  localityName: string;
  city: string;
  district?: string;
  state?: string;
  postalCode: string;
  centroid: LocalityCentroid;
  radiusKm: number;
  verifiedAt: Date;
  verifiedBy: string;
  history: LocalityHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const LocalityHistorySchema = new Schema(
  {
    localityName: { type: String, required: true },
    city: { type: String, required: true },
    centroid: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      geoJSON: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    radiusKm: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, required: true },
    reason: { type: String },
  },
  { _id: false }
);

const PartnerLocalitySchema = new Schema<IPartnerLocality>(
  {
    partnerId: { type: String, required: true, unique: true, index: true },
    localityName: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '000000' },
    centroid: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      geoJSON: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    radiusKm: { type: Number, default: 5, min: 1, max: 7 }, // capped at 7 km
    verifiedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String, default: 'system' },
    history: { type: [LocalityHistorySchema], default: [] },
  },
  { timestamps: true }
);

PartnerLocalitySchema.index({ 'centroid.geoJSON': '2dsphere' });

export const PartnerLocalityModel =
  mongoose.models.PartnerLocality || mongoose.model<IPartnerLocality>('PartnerLocality', PartnerLocalitySchema);
