export type ReviewTargetType = 'SHOP' | 'TRAVELLER' | 'CUSTOMER';

export interface Review {
  _id: string;
  orderId: string;
  authorId: string;
  authorName: string;
  authorRole: 'CUSTOMER' | 'TRAVELLER';
  targetType: ReviewTargetType;
  targetId: string; // shopId or travellerId or customerId
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
}
