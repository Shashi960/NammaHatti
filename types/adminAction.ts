export interface AdminActionLog {
  _id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}
