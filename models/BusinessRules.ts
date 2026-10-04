import mongoose, { Schema, Document } from 'mongoose';
import { BusinessRulesConfig } from '@/types/businessRules';

export interface IBusinessRules extends Document, Omit<BusinessRulesConfig, '_id'> {}

const BusinessRulesSchema = new Schema<IBusinessRules>(
  {
    baseDeliveryFee: { type: Number, default: 35 },
    expressDeliveryFee: { type: Number, default: 70 },
    platformCommissionPercent: { type: Number, default: 5 },
    shopCommissionPercent: { type: Number, default: 5 },
    travellerPayoutSharePercent: { type: Number, default: 80 },
    partnerDefaultRadiusKm: { type: Number, default: 5 },
    partnerMaxRadiusKm: { type: Number, default: 7 },
    orderMatchRadiusKm: { type: Number, default: 5 },
    maxPackageCapacity: { type: Number, default: 10 },
    maxRouteDistanceKm: { type: Number, default: 50 },
    updatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export const BusinessRulesModel =
  mongoose.models.BusinessRules || mongoose.model<IBusinessRules>('BusinessRules', BusinessRulesSchema);
