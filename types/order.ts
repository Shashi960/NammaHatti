import { Location } from './location';

export type OrderStatus =
  | 'PENDING'
  | 'SHOP_CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ROUTE_MATCHING'
  | 'TRAVELLER_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED';

export type DeliveryType = 'STANDARD' | 'EXPRESS';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'DEMO_ONLINE';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  weightKg: number;
  subtotal: number;
  imageUrl?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string; // e.g. ORD-2026-9281
  checkoutSessionId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  shopLocation: Location;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  travellerEarnings: number;
  total: number;
  deliveryLocation: Location;
  deliveryType: DeliveryType;
  routePoolId?: string;
  travellerTripId?: string;
  travellerId?: string;
  travellerName?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  deliveryOtp: string; // 6-digit code shown to customer
  otpAttempts: number;
  isPickedUp: boolean;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancellationReason?: string;
  disputeReason?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  shopId: string;
  shopName: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  weightKg: number;
  imageUrl?: string;
}

export interface CheckoutSession {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  deliveryLocation: Location;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  orderIds: string[];
  totalAmount: number;
  createdAt: Date;
}
