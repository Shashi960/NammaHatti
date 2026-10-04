import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '@/types/notification';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: 'ORDER' | 'TRIP' | 'ROUTE_POOL' | 'SHOP' | 'KYC';
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
