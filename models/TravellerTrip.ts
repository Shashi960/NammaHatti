import mongoose, { Schema, Document } from 'mongoose';
import { LocationSubSchema } from './LocationSchema';
import { Location } from '@/types/location';
import { TripStatus } from '@/types/traveller';

export interface ITravellerTrip extends Document {
  travellerId: string;
  travellerName: string;
  travellerPhone: string;
  origin: Location;
  destination: Location;
  travelDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  estimatedArrivalTime: string; // HH:MM
  maxPackageCapacity: number;
  currentPackageCount: number;
  maxWeightKg: number;
  currentWeightKg: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravellerTripSchema = new Schema<ITravellerTrip>(
  {
    travellerId: { type: String, required: true, index: true },
    travellerName: { type: String, required: true },
    travellerPhone: { type: String, default: '' },
    origin: { type: LocationSubSchema, required: true },
    destination: { type: LocationSubSchema, required: true },
    travelDate: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    estimatedArrivalTime: { type: String, required: true },
    maxPackageCapacity: { type: Number, default: 5 },
    currentPackageCount: { type: Number, default: 0 },
    maxWeightKg: { type: Number, default: 15 },
    currentWeightKg: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

TravellerTripSchema.index({ 'origin.geoJSON': '2dsphere' });
TravellerTripSchema.index({ 'destination.geoJSON': '2dsphere' });

export const TravellerTripModel =
  mongoose.models.TravellerTrip || mongoose.model<ITravellerTrip>('TravellerTrip', TravellerTripSchema);
