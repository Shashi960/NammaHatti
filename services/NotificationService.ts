import { NotificationModel } from '@/models/Notification';
import { Notification, NotificationType } from '@/types/notification';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: 'ORDER' | 'TRIP' | 'ROUTE_POOL' | 'SHOP' | 'KYC';
  entityId?: string;
}

export interface INotificationService {
  notify(input: CreateNotificationInput): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
}

export class InAppNotificationService implements INotificationService {
  async notify(input: CreateNotificationInput): Promise<Notification> {
    const doc = await NotificationModel.create({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      isRead: false,
    });
    return doc.toObject() as Notification;
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    const docs: any[] = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs as unknown as Notification[];
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const res = await NotificationModel.updateOne({ _id: notificationId }, { isRead: true });
    return res.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const res = await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    return res.modifiedCount > 0;
  }
}

export const notificationService = new InAppNotificationService();
