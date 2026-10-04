import { OrderStatus } from '@/types/order';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['SHOP_CONFIRMED', 'CANCELLED', 'FAILED'],
  SHOP_CONFIRMED: ['PREPARING', 'CANCELLED', 'FAILED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED', 'FAILED'],
  READY_FOR_PICKUP: ['ROUTE_MATCHING', 'TRAVELLER_ASSIGNED', 'CANCELLED'],
  ROUTE_MATCHING: ['TRAVELLER_ASSIGNED', 'CANCELLED'],
  TRAVELLER_ASSIGNED: ['PICKED_UP', 'ROUTE_MATCHING', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY', 'DISPUTED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'DISPUTED'],
  DELIVERED: ['COMPLETED', 'DISPUTED', 'REFUNDED'],
  COMPLETED: ['DISPUTED', 'REFUNDED'],
  CANCELLED: ['REFUNDED'],
  FAILED: ['REFUNDED'],
  REFUNDED: [],
  DISPUTED: ['RESOLVED', 'COMPLETED', 'REFUNDED', 'CANCELLED'] as any,
};

export function canTransitionOrder(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

export function validateOrderTransition(current: OrderStatus, next: OrderStatus): void {
  if (!canTransitionOrder(current, next)) {
    throw new Error(`Invalid order status transition from "${current}" to "${next}"`);
  }
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending Confirmation',
  SHOP_CONFIRMED: 'Confirmed by Shop',
  PREPARING: 'Preparing Order',
  READY_FOR_PICKUP: 'Ready for Pickup',
  ROUTE_MATCHING: 'Matching Route',
  TRAVELLER_ASSIGNED: 'Traveller Assigned',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Delivery Failed',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
};

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  SHOP_CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  PREPARING: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  READY_FOR_PICKUP: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  ROUTE_MATCHING: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  TRAVELLER_ASSIGNED: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  PICKED_UP: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  OUT_FOR_DELIVERY: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  REFUNDED: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  DISPUTED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
};
