export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_READY'
  | 'ROUTE_FOUND'
  | 'TRAVELLER_ASSIGNED'
  | 'ORDER_PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'EARNINGS_CREDITED'
  | 'KYC_STATUS_UPDATED'
  | 'SYSTEM_ALERT';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: 'ORDER' | 'TRIP' | 'ROUTE_POOL' | 'SHOP' | 'KYC';
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
}
