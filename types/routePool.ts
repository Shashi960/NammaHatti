import { Location } from './location';
import { Order } from './order';

export type RoutePoolStatus = 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface PickupStop {
  shopId: string;
  shopName: string;
  shopAddress: string;
  location: Location;
  orderIds: string[];
  packageCount: number;
  isPickedUp: boolean;
  pickedUpAt?: Date;
}

export interface RoutePool {
  _id: string;
  poolCode: string; // e.g. POOL-9182
  travellerTripId?: string;
  travellerId?: string;
  travellerName?: string;
  origin: Location;
  destination: Location;
  orderIds: string[];
  orders?: Order[];
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
