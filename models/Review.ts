import mongoose, { Schema, Document } from 'mongoose';
import { ReviewTargetType } from '@/types/review';

export interface IReview extends Document {
  orderId: string;
  authorId: string;
  authorName: string;
  authorRole: 'CUSTOMER' | 'TRAVELLER';
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: { type: String, required: true, index: true },
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['CUSTOMER', 'TRAVELLER'], required: true },
    targetType: { type: String, enum: ['SHOP', 'TRAVELLER', 'CUSTOMER'], required: true },
    targetId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

ReviewSchema.index({ targetId: 1, targetType: 1 });

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
