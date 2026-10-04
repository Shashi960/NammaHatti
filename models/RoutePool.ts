import mongoose, { Schema, Document } from 'mongoose';
import { LocationSubSchema } from './LocationSchema';
import { Location } from '@/types/location';
import { RoutePoolStatus, PickupStop } from '@/types/routePool';

export interface IRoutePool extends Document {
  poolCode: string;
  travellerTripId?: string;
  travellerId?: string;
  travellerName?: string;
  origin: Location;
  destination: Location;
  orderIds: string[];
  pickupStops: PickupStop[];
  packageCount: number;
  totalWeightKg: number;
  status: RoutePoolStatus;
  estimatedExtraTimeMinutes: number;
  estimatedEarnings: number;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PickupStopSchema = new Schema(
  {
    shopId: { type: String, required: true },
    shopName: { type: String, required: true },
    shopAddress: { type: String, required: true },
    location: { type: LocationSubSchema, required: true },
    orderIds: { type: [String], required: true },
    packageCount: { type: Number, required: true },
    isPickedUp: { type: Boolean, default: false },
    pickedUpAt: { type: Date },
  },
  { _id: false }
);

const RoutePoolSchema = new Schema<IRoutePool>(
  {
    poolCode: { type: String, required: true, unique: true, index: true },
    travellerTripId: { type: String, index: true },
    travellerId: { type: String, index: true },
    travellerName: { type: String },
    origin: { type: LocationSubSchema, required: true },
    destination: { type: LocationSubSchema, required: true },
    orderIds: { type: [String], default: [], index: true },
    pickupStops: { type: [PickupStopSchema], default: [] },
    packageCount: { type: Number, default: 0 },
    totalWeightKg: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
      index: true,
    },
    estimatedExtraTimeMinutes: { type: Number, default: 15 },
    estimatedEarnings: { type: Number, default: 0 },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

RoutePoolSchema.index({ 'origin.geoJSON': '2dsphere' });
RoutePoolSchema.index({ 'destination.geoJSON': '2dsphere' });

export const RoutePoolModel =
  mongoose.models.RoutePool || mongoose.model<IRoutePool>('RoutePool', RoutePoolSchema);
