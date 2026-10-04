import mongoose, { Schema, Document } from 'mongoose';
import { LocationSubSchema } from './LocationSchema';
import { Location } from '@/types/location';
import { CartItem, DeliveryType, PaymentMethod } from '@/types/order';

export interface ICheckoutSession extends Document {
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

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    shopId: { type: String, required: true },
    shopName: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String },
    weight: { type: Number, default: 0.5 },
  },
  { _id: false }
);

const CheckoutSessionSchema = new Schema<ICheckoutSession>(
  {
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    items: { type: [CartItemSchema], required: true },
    deliveryLocation: { type: LocationSubSchema, required: true },
    deliveryType: { type: String, enum: ['STANDARD', 'EXPRESS'], default: 'STANDARD' },
    paymentMethod: { type: String, enum: ['COD', 'DEMO_ONLINE'], default: 'COD' },
    orderIds: { type: [String], default: [] },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CheckoutSessionModel =
  mongoose.models.CheckoutSession || mongoose.model<ICheckoutSession>('CheckoutSession', CheckoutSessionSchema);
