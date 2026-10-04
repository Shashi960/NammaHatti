import { OrderModel } from '@/models/Order';
import { RoutePoolModel } from '@/models/RoutePool';
import { PartnerLocalityModel } from '@/models/PartnerLocality';
import { KYCVerificationModel } from '@/models/KYCVerification';
import { BusinessRulesModel } from '@/models/BusinessRules';
import { Order } from '@/types/order';
import { TravellerTrip } from '@/types/traveller';
import { RoutePool, PickupStop } from '@/types/routePool';
import { haversineDistanceKm } from './MapService';
import { DEFAULT_BUSINESS_RULES } from '@/types/businessRules';

export interface RouteMatchExplanation {
  orderId: string;
  orderNumber: string;
  matched: boolean;
  reasons: string[];
  originDistanceKm?: number;
  destinationDistanceKm?: number;
  localityDistanceKm?: number;
}

export interface IRouteMatchingService {
  findCompatibleOrdersForTrip(
    trip: TravellerTrip,
    travellerId: string
  ): Promise<{ compatibleOrders: Order[]; explanations: RouteMatchExplanation[] }>;
  createRoutePoolForTrip(trip: TravellerTrip, orderIds: string[]): Promise<RoutePool>;
  acceptRoutePool(poolId: string, travellerId: string, travellerName: string): Promise<RoutePool>;
}

export class DeterministicRouteMatchingService implements IRouteMatchingService {
  /**
   * Deterministically evaluates order compatibility with a traveller's trip.
   */
  async findCompatibleOrdersForTrip(
    trip: TravellerTrip,
    travellerId: string
  ): Promise<{ compatibleOrders: Order[]; explanations: RouteMatchExplanation[] }> {
    // 1. Verify Partner KYC Status
    const kyc: any = await KYCVerificationModel.findOne({ partnerId: travellerId }).lean();
    if (!kyc || kyc.status !== 'VERIFIED') {
      return {
        compatibleOrders: [],
        explanations: [
          {
            orderId: '',
            orderNumber: '',
            matched: false,
            reasons: ['KYC verification is required before accepting customer orders.'],
          },
        ],
      };
    }

    // 2. Fetch Partner Locality
    const locality: any = await PartnerLocalityModel.findOne({ partnerId: travellerId }).lean();
    if (!locality) {
      return {
        compatibleOrders: [],
        explanations: [
          {
            orderId: '',
            orderNumber: '',
            matched: false,
            reasons: ['Verified residential locality is required before matching routes.'],
          },
        ],
      };
    }

    // 3. Get matching radius rules
    const rulesDoc: any = await BusinessRulesModel.findOne().lean();
    const matchRadiusKm = rulesDoc?.orderMatchRadiusKm || DEFAULT_BUSINESS_RULES.orderMatchRadiusKm;
    const partnerRadiusKm = Math.min(locality.radiusKm || 5, rulesDoc?.partnerMaxRadiusKm || 7);

    // 4. Query candidate orders: unassigned, ready or confirmed
    const candidateOrders: any[] = await OrderModel.find({
      orderStatus: { $in: ['READY_FOR_PICKUP', 'SHOP_CONFIRMED', 'PREPARING', 'ROUTE_MATCHING'] },
      travellerId: { $in: [null, undefined, ''] },
    }).lean();

    const compatibleOrders: Order[] = [];
    const explanations: RouteMatchExplanation[] = [];

    let currentPackages = trip.currentPackageCount || 0;
    let currentWeight = trip.currentWeightKg || 0;

    for (const order of candidateOrders) {
      const reasons: string[] = [];
      let isEligible = true;

      // Distance from trip origin to shop location
      const originDist = haversineDistanceKm(
        trip.origin.latitude,
        trip.origin.longitude,
        order.shopLocation.latitude,
        order.shopLocation.longitude
      );

      // Distance from trip destination to order delivery location
      const destDist = haversineDistanceKm(
        trip.destination.latitude,
        trip.destination.longitude,
        order.deliveryLocation.latitude,
        order.deliveryLocation.longitude
      );

      // Distance from partner's verified locality centroid to delivery location
      const localityDist = haversineDistanceKm(
        locality.centroid.latitude,
        locality.centroid.longitude,
        order.deliveryLocation.latitude,
        order.deliveryLocation.longitude
      );

      // Origin proximity check
      if (originDist > matchRadiusKm) {
        isEligible = false;
        reasons.push(
          `Pickup shop (${originDist.toFixed(1)} km) exceeds origin match radius of ${matchRadiusKm} km`
        );
      } else {
        reasons.push(`Pickup shop is nearby origin (${originDist.toFixed(1)} km <= ${matchRadiusKm} km)`);
      }

      // Destination proximity check
      if (destDist > matchRadiusKm) {
        isEligible = false;
        reasons.push(
          `Delivery location (${destDist.toFixed(1)} km) exceeds destination match radius of ${matchRadiusKm} km`
        );
      } else {
        reasons.push(
          `Delivery location is nearby destination (${destDist.toFixed(1)} km <= ${matchRadiusKm} km)`
        );
      }

      // Locality eligibility check
      if (localityDist > partnerRadiusKm) {
        isEligible = false;
        reasons.push(
          `Delivery location (${localityDist.toFixed(1)} km) is outside your verified locality radius of ${partnerRadiusKm} km`
        );
      } else {
        reasons.push(
          `Within verified locality radius (${localityDist.toFixed(1)} km <= ${partnerRadiusKm} km)`
        );
      }

      // Capacity check
      const orderPackageCount = order.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const orderWeight = order.items.reduce((sum: number, it: any) => sum + (it.weightKg || 0.5) * (it.quantity || 1), 0);

      if (currentPackages + orderPackageCount > trip.maxPackageCapacity) {
        isEligible = false;
        reasons.push(
          `Order requires ${orderPackageCount} package slots, exceeding remaining capacity of ${trip.maxPackageCapacity - currentPackages}`
        );
      }

      if (currentWeight + orderWeight > trip.maxWeightKg) {
        isEligible = false;
        reasons.push(
          `Order weight (${orderWeight.toFixed(1)} kg) exceeds remaining weight allowance of ${(trip.maxWeightKg - currentWeight).toFixed(1)} kg`
        );
      }

      explanations.push({
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        matched: isEligible,
        reasons,
        originDistanceKm: originDist,
        destinationDistanceKm: destDist,
        localityDistanceKm: localityDist,
      });

      if (isEligible) {
        compatibleOrders.push(order as unknown as Order);
        currentPackages += orderPackageCount;
        currentWeight += orderWeight;
      }
    }

    return { compatibleOrders, explanations };
  }

  /**
   * Constructs a RoutePool grouping compatible orders into optimized pickup stops.
   */
  async createRoutePoolForTrip(trip: TravellerTrip, orderIds: string[]): Promise<RoutePool> {
    const orders: any[] = await OrderModel.find({ _id: { $in: orderIds } }).lean();

    if (!orders.length) {
      throw new Error('Cannot create route pool without compatible orders');
    }

    // Group pickup stops by shopId
    const shopMap = new Map<string, { shopName: string; shopAddress: string; location: any; orderIds: string[]; packageCount: number }>();

    let totalWeightKg = 0;
    let totalEarnings = 0;
    let packageCount = 0;

    for (const ord of orders) {
      const sId = ord.shopId;
      const count = ord.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const weight = ord.items.reduce((sum: number, it: any) => sum + (it.weightKg || 0.5) * (it.quantity || 1), 0);

      packageCount += count;
      totalWeightKg += weight;
      totalEarnings += ord.travellerEarnings || 0;

      if (!shopMap.has(sId)) {
        shopMap.set(sId, {
          shopName: ord.shopName,
          shopAddress: ord.shopLocation.formattedAddress,
          location: ord.shopLocation,
          orderIds: [ord._id.toString()],
          packageCount: count,
        });
      } else {
        const existing = shopMap.get(sId)!;
        existing.orderIds.push(ord._id.toString());
        existing.packageCount += count;
      }
    }

    const pickupStops: PickupStop[] = Array.from(shopMap.entries()).map(([shopId, data]) => ({
      shopId,
      shopName: data.shopName,
      shopAddress: data.shopAddress,
      location: data.location,
      orderIds: data.orderIds,
      packageCount: data.packageCount,
      isPickedUp: false,
    }));

    // Estimate extra time: 8 minutes per pickup stop + 5 minutes travel detours
    const estimatedExtraTimeMinutes = pickupStops.length * 8 + 5;

    const poolCode = `POOL-${Date.now().toString().slice(-6)}`;

    const pool = await RoutePoolModel.create({
      poolCode,
      travellerTripId: trip._id ? trip._id.toString() : '',
      travellerId: trip.travellerId,
      travellerName: trip.travellerName,
      origin: trip.origin,
      destination: trip.destination,
      orderIds: orders.map((o: any) => o._id.toString()),
      pickupStops,
      packageCount,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      status: 'OPEN',
      estimatedExtraTimeMinutes,
      estimatedEarnings: totalEarnings,
    });

    return pool.toObject() as RoutePool;
  }

  /**
   * Accepts a route pool: locks orders, updates order statuses to TRAVELLER_ASSIGNED.
   */
  async acceptRoutePool(poolId: string, travellerId: string, travellerName: string): Promise<RoutePool> {
    const pool = await RoutePoolModel.findById(poolId);
    if (!pool) {
      throw new Error('Route pool not found');
    }

    if (pool.status !== 'OPEN') {
      throw new Error(`Route pool is already ${pool.status}`);
    }

    // Verify traveller KYC
    const kyc: any = await KYCVerificationModel.findOne({ partnerId: travellerId }).lean();
    if (!kyc || kyc.status !== 'VERIFIED') {
      throw new Error('KYC verification is required before accepting route pool');
    }

    pool.status = 'ACCEPTED';
    pool.travellerId = travellerId;
    pool.travellerName = travellerName;
    pool.acceptedAt = new Date();
    await pool.save();

    // Assign traveller and transition orders to TRAVELLER_ASSIGNED
    await OrderModel.updateMany(
      { _id: { $in: pool.orderIds } },
      {
        $set: {
          travellerId,
          travellerName,
          routePoolId: pool._id.toString(),
          orderStatus: 'TRAVELLER_ASSIGNED',
        },
        $push: {
          statusHistory: {
            status: 'TRAVELLER_ASSIGNED',
            timestamp: new Date(),
            updatedBy: travellerName,
            note: `Assigned to traveller for pooled delivery (Route Pool ${pool.poolCode})`,
          },
        },
      }
    );

    return pool.toObject() as RoutePool;
  }
}

export const routeMatchingService = new DeterministicRouteMatchingService();
