import mongoose, { Schema, Document } from 'mongoose';
import { KYCStatus } from '@/types/traveller';

export interface IKYCVerification extends Document {
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

const KYCVerificationSchema = new Schema<IKYCVerification>(
  {
    partnerId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    providerName: { type: String, default: 'MockKYCProvider' },
    providerReferenceId: { type: String, default: () => `KYC-REF-${Date.now()}` },
    documentType: { type: String, default: 'GOVERNMENT_ID' },
    verifiedAt: { type: Date },
    reviewedBy: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const KYCVerificationModel =
  mongoose.models.KYCVerification || mongoose.model<IKYCVerification>('KYCVerification', KYCVerificationSchema);
