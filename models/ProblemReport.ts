import mongoose, { Schema, Document } from 'mongoose';
import { ReportCategory, ReportStatus } from '@/types/report';

export interface IProblemReport extends Document {
  reportNumber: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  orderId?: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemReportSchema = new Schema<IProblemReport>(
  {
    reportNumber: { type: String, required: true, unique: true, index: true },
    reporterId: { type: String, required: true, index: true },
    reporterName: { type: String, required: true },
    reporterRole: { type: String, required: true },
    orderId: { type: String, index: true },
    category: {
      type: String,
      enum: [
        'ORDER_NOT_RECEIVED',
        'WRONG_PRODUCT',
        'DAMAGED_ITEM',
        'SHOP_ISSUE',
        'TRAVELLER_ISSUE',
        'PAYMENT_ISSUE',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    resolutionNote: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const ProblemReportModel =
  mongoose.models.ProblemReport || mongoose.model<IProblemReport>('ProblemReport', ProblemReportSchema);
