import { z } from 'zod';

export const locationInputSchema = z.object({
  locationId: z.string().optional(),
  placeId: z.string().optional().default(''),
  formattedAddress: z.string().min(3, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().min(1, 'City/Locality is required'),
  district: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default('DemoCountry'),
  postalCode: z.string().optional().default('000000'),
  landmark: z.string().optional().default(''),
});

export const shopRegisterSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  address: z.string().min(3, 'Address is required'),
  landmark: z.string().optional().default(''),
  openingTime: z.string().default('08:00'),
  closingTime: z.string().default('21:00'),
  minOrderAmount: z.number().min(0).default(0),
  location: locationInputSchema,
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional().default(''),
  categoryId: z.string().min(1, 'Category is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  price: z.number().min(0.01, 'Price must be positive'),
  discountPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  unit: z.string().default('piece'),
  sku: z.string().optional().default(''),
  images: z.array(z.string()).default([]),
  weightKg: z.number().min(0.01).default(0.5),
  availability: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'UNAVAILABLE']).default('IN_STOCK'),
});

export const travellerTripSchema = z.object({
  origin: locationInputSchema,
  destination: locationInputSchema,
  travelDate: z.string().min(10, 'Date format YYYY-MM-DD required'),
  departureTime: z.string().min(4, 'Departure time required'),
  estimatedArrivalTime: z.string().min(4, 'Estimated arrival required'),
  maxPackageCapacity: z.number().int().min(1).max(20).default(5),
  maxWeightKg: z.number().min(1).max(50).default(15),
  notes: z.string().optional().default(''),
});

export const checkoutSchema = z.object({
  deliveryLocation: locationInputSchema,
  deliveryType: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  paymentMethod: z.enum(['COD', 'DEMO_ONLINE']).default('COD'),
  items: z.array(
    z.object({
      productId: z.string(),
      shopId: z.string(),
      shopName: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      unit: z.string().default('piece'),
      weightKg: z.number().default(0.5),
      imageUrl: z.string().optional(),
    })
  ).min(1, 'Cart cannot be empty'),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
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
  ]),
  note: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  orderId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const reportProblemSchema = z.object({
  orderId: z.string().optional(),
  category: z.enum([
    'ORDER_NOT_RECEIVED',
    'WRONG_PRODUCT',
    'DAMAGED_ITEM',
    'SHOP_ISSUE',
    'TRAVELLER_ISSUE',
    'PAYMENT_ISSUE',
    'OTHER',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  targetType: z.enum(['SHOP', 'TRAVELLER', 'CUSTOMER']),
  targetId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().default(''),
});
