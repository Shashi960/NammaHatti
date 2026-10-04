export type ReportCategory =
  | 'ORDER_NOT_RECEIVED'
  | 'WRONG_PRODUCT'
  | 'DAMAGED_ITEM'
  | 'SHOP_ISSUE'
  | 'TRAVELLER_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ProblemReport {
  _id: string;
  reportNumber: string; // REP-XXXX
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
