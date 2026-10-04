export interface BusinessRulesConfig {
  _id?: string;
  baseDeliveryFee: number; // e.g. 35
  expressDeliveryFee: number; // e.g. 70
  platformCommissionPercent: number; // e.g. 5%
  shopCommissionPercent: number; // e.g. 5%
  travellerPayoutSharePercent: number; // e.g. 80% of delivery fee
  partnerDefaultRadiusKm: number; // default 5 km
  partnerMaxRadiusKm: number; // hard cap 7 km
  orderMatchRadiusKm: number; // 5 km match proximity
  maxPackageCapacity: number; // default 10 packages
  maxRouteDistanceKm: number; // 50 km
  updatedAt: Date;
  updatedBy: string;
}

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  baseDeliveryFee: 35,
  expressDeliveryFee: 70,
  platformCommissionPercent: 5,
  shopCommissionPercent: 5,
  travellerPayoutSharePercent: 80,
  partnerDefaultRadiusKm: 5,
  partnerMaxRadiusKm: 7,
  orderMatchRadiusKm: 5,
  maxPackageCapacity: 10,
  maxRouteDistanceKm: 50,
  updatedAt: new Date(),
  updatedBy: 'system',
};
