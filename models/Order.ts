import mongoose, { Schema, Document } from 'mongoose';
import { LocationSubSchema } from './LocationSchema';
import { Location } from '@/types/location';
import { OrderStatus, DeliveryType, PaymentStatus, PaymentMethod, OrderItem, StatusHistoryEntry } from '@/types/order';

export interface IOrder extends Document {
  orderNumber: string;
  checkoutSessionId?: string;
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
  deliveryOtp: string;
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

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'piece' },
    weightKg: { type: Number, default: 0.5 },
    subtotal: { type: Number, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    checkoutSessionId: { type: String, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true },
    shopLocation: { type: LocationSubSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    travellerEarnings: { type: Number, required: true },
    total: { type: Number, required: true },
    deliveryLocation: { type: LocationSubSchema, required: true },
    deliveryType: { type: String, enum: ['STANDARD', 'EXPRESS'], default: 'STANDARD' },
    routePoolId: { type: String, index: true },
    travellerTripId: { type: String, index: true },
    travellerId: { type: String, index: true },
    travellerName: { type: String },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'DEMO_ONLINE'],
      default: 'COD',
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING',
        'SHOP_CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'ROUTE_MATCHING',
        'TRAVELLER_ASSIGNED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'FAILED',
        'REFUNDED',
        'DISPUTED',
      ],
      default: 'PENDING',
      index: true,
    },
    deliveryOtp: { type: String, required: true }, // e.g. "482910"
    otpAttempts: { type: Number, default: 0 },
    isPickedUp: { type: Boolean, default: false },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    cancellationReason: { type: String },
    disputeReason: { type: String },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ 'shopLocation.geoJSON': '2dsphere' });
OrderSchema.index({ 'deliveryLocation.geoJSON': '2dsphere' });
OrderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
