import { BusinessRulesModel } from '@/models/BusinessRules';
import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from '@/types/businessRules';
import { DeliveryType } from '@/types/order';

export interface FeeCalculation {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  travellerEarnings: number;
  shopCommission: number;
  total: number;
  deliveryType: DeliveryType;
  rulesUsed: {
    baseDeliveryFee: number;
    platformCommissionPercent: number;
    travellerPayoutSharePercent: number;
  };
}

export interface IPricingService {
  getRules(): Promise<BusinessRulesConfig>;
  calculateFees(subtotal: number, deliveryType: DeliveryType, distanceKm?: number): Promise<FeeCalculation>;
}

export class PricingService implements IPricingService {
  async getRules(): Promise<BusinessRulesConfig> {
    try {
      const doc: any = await BusinessRulesModel.findOne().lean();
      if (doc) {
        return doc as unknown as BusinessRulesConfig;
      }
    } catch (err) {
      // In tests or if DB not yet connected
    }
    return DEFAULT_BUSINESS_RULES;
  }

  async calculateFees(
    subtotal: number,
    deliveryType: DeliveryType = 'STANDARD',
    distanceKm: number = 2.5
  ): Promise<FeeCalculation> {
    const rules = await this.getRules();

    let deliveryFee = deliveryType === 'EXPRESS' ? rules.expressDeliveryFee : rules.baseDeliveryFee;

    // Optional small distance factor for distances over 5km
    if (distanceKm > 5) {
      const extraKm = distanceKm - 5;
      deliveryFee += Math.round(extraKm * 5); // 5 per extra km
    }

    const platformFee = Math.round((subtotal * rules.platformCommissionPercent) / 100);
    const shopCommission = Math.round((subtotal * rules.shopCommissionPercent) / 100);
    const travellerEarnings = Math.round((deliveryFee * rules.travellerPayoutSharePercent) / 100);
    const total = subtotal + deliveryFee + platformFee;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      travellerEarnings,
      shopCommission,
      total,
      deliveryType,
      rulesUsed: {
        baseDeliveryFee: rules.baseDeliveryFee,
        platformCommissionPercent: rules.platformCommissionPercent,
        travellerPayoutSharePercent: rules.travellerPayoutSharePercent,
      },
    };
  }
}

export const pricingService = new PricingService();
