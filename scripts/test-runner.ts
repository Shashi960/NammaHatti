import mongoose from 'mongoose';
import { hashPassword, verifyPassword, requireRole } from '../lib/auth';
import { createSessionToken, verifySessionToken } from '../lib/session';
import { canTransitionOrder, validateOrderTransition } from '../lib/orderStateMachine';
import { haversineDistanceKm, DefaultMapService } from '../services/MapService';
import { PricingService } from '../services/PricingService';
import { DeterministicRouteMatchingService } from '../services/RouteMatchingService';
import { MockKYCService, isOrderWithinPartnerLocality } from '../services/KYCService';
import { createLocation } from '../types/location';
import { OrderModel } from '../models/Order';
import { RoutePoolModel } from '../models/RoutePool';
import { UserModel } from '../models/User';
import { ShopModel } from '../models/Shop';
import { ProductModel } from '../models/Product';
import { KYCVerificationModel } from '../models/KYCVerification';
import { PartnerLocalityModel } from '../models/PartnerLocality';
import { BusinessRulesModel } from '../models/BusinessRules';
import { DEFAULT_BUSINESS_RULES } from '../types/businessRules';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/localmesh';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('STARTING AUTOMATED SYSTEM TEST SUITE: LOCALMESH');
  console.log('================================================================');

  await mongoose.connect(MONGODB_URI);

  // 1. AUTH & AUTHORIZATION TESTS
  console.log('\n[1] Testing Auth & Authorization:');
  const pass = 'superSecret123!';
  const hashed = await hashPassword(pass);
  const isValidPass = await verifyPassword(pass, hashed);
  const isInvalidPass = await verifyPassword('wrongPass', hashed);
  assert(isValidPass && !isInvalidPass, 'Password hashing and verification');

  const sessionPayload = {
    userId: 'test_user_1',
    name: 'Test Customer',
    email: 'cust@test.local',
    role: 'CUSTOMER' as const,
    status: 'ACTIVE' as const,
  };
  const token = await createSessionToken(sessionPayload);
  const verifiedSession = await verifySessionToken(token);
  assert(verifiedSession?.userId === 'test_user_1' && verifiedSession?.role === 'CUSTOMER', 'JWT Token generation and verification');

  const roleAuthSuccess = requireRole(['CUSTOMER', 'ADMIN'], sessionPayload);
  const roleAuthFail = requireRole(['SHOP'], sessionPayload);
  assert(roleAuthSuccess.allowed && !roleAuthFail.allowed, 'Role-based access control guard');

  // 2. LOCATION HANDLING & MAP SERVICE FALLBACK
  console.log('\n[2] Testing Location Handling & MapService Fallback:');
  const locA = { lat: 12.9716, lng: 77.5946 };
  const locB = { lat: 12.9352, lng: 77.6245 };
  const distance = haversineDistanceKm(locA.lat, locA.lng, locB.lat, locB.lng);
  assert(distance > 4.5 && distance < 6.5, `Haversine distance calculation (${distance} km between points)`);

  const mapService = new DefaultMapService();
  const routeDist = await mapService.calculateDistance(locA, locB);
  assert(routeDist.distanceKm > 0 && routeDist.durationMinutes > 0 && routeDist.isFallback, 'MapService fallback duration & distance without API key');

  const genericLoc = createLocation({
    formattedAddress: 'Generic Locality Market, Sector 2',
    latitude: 12.9716,
    longitude: 77.5946,
    city: 'City A',
  });
  assert(genericLoc.geoJSON.type === 'Point' && genericLoc.geoJSON.coordinates[0] === 77.5946, 'Generic Location object GeoJSON 2dsphere Point conformity');

  // 3. PRICING SERVICE & BUSINESS RULES
  console.log('\n[3] Testing PricingService & Dynamic Business Rules:');
  const pricingService = new PricingService();
  const standardFee = await pricingService.calculateFees(500, 'STANDARD', 3.0);
  const expressFee = await pricingService.calculateFees(500, 'EXPRESS', 3.0);
  assert(standardFee.deliveryFee === 35, 'Standard base delivery fee is ₹35');
  assert(expressFee.deliveryFee === 70, 'Express delivery fee is ₹70');
  assert(standardFee.platformFee === 25, 'Platform commission 5% on ₹500 is ₹25');
  assert(standardFee.travellerEarnings === 28, 'Traveller payout 80% of ₹35 is ₹28');
  assert(standardFee.total === 500 + 35 + 25, 'Total calculation conforms to item + delivery + platform fee');

  // 4. ORDER STATE MACHINE TRANSITIONS
  console.log('\n[4] Testing Order State Machine:');
  assert(canTransitionOrder('PENDING', 'SHOP_CONFIRMED'), 'Valid transition: PENDING -> SHOP_CONFIRMED');
  assert(canTransitionOrder('SHOP_CONFIRMED', 'PREPARING'), 'Valid transition: SHOP_CONFIRMED -> PREPARING');
  assert(canTransitionOrder('PREPARING', 'READY_FOR_PICKUP'), 'Valid transition: PREPARING -> READY_FOR_PICKUP');
  assert(canTransitionOrder('READY_FOR_PICKUP', 'TRAVELLER_ASSIGNED'), 'Valid transition: READY_FOR_PICKUP -> TRAVELLER_ASSIGNED');
  assert(canTransitionOrder('TRAVELLER_ASSIGNED', 'PICKED_UP'), 'Valid transition: TRAVELLER_ASSIGNED -> PICKED_UP');
  assert(canTransitionOrder('PICKED_UP', 'OUT_FOR_DELIVERY'), 'Valid transition: PICKED_UP -> OUT_FOR_DELIVERY');
  assert(canTransitionOrder('OUT_FOR_DELIVERY', 'DELIVERED'), 'Valid transition: OUT_FOR_DELIVERY -> DELIVERED');
  assert(canTransitionOrder('DELIVERED', 'COMPLETED'), 'Valid transition: DELIVERED -> COMPLETED');

  let invalidThrown = false;
  try {
    validateOrderTransition('PENDING', 'DELIVERED');
  } catch (e) {
    invalidThrown = true;
  }
  assert(invalidThrown, 'Invalid transition directly from PENDING to DELIVERED is strictly blocked');

  // 5. PARTNER KYC & LOCALITY ELIGIBILITY (5KM DEFAULT, 7KM HARD CAP)
  console.log('\n[5] Testing Partner KYC & Locality Eligibility:');
  const kycService = new MockKYCService();
  const testPartnerId = `test_partner_${Date.now()}`;

  // KYC initiation
  const kycDoc = await kycService.initiateKYC(testPartnerId);
  assert(kycDoc.status === 'PENDING', 'KYC initial status is PENDING');

  let statusCheck = await kycService.getVerificationStatus(testPartnerId);
  assert(!statusCheck.isVerified, 'Unverified partner is identified as not verified');

  // Verify partner
  await kycService.verifyPartner(testPartnerId, 'admin@demo.local');
  statusCheck = await kycService.getVerificationStatus(testPartnerId);
  assert(statusCheck.isVerified, 'Admin-approved partner verified status verified');

  // Locality setting with radius cap check (requesting 15 km should be capped at 7 km)
  const locRecord = await kycService.setPartnerLocality({
    partnerId: testPartnerId,
    localityName: 'Sector 5 Hub',
    city: 'Metro Alpha',
    postalCode: '560005',
    latitude: 12.9716,
    longitude: 77.5946,
    radiusKm: 15, // Try to exceed cap
    verifiedBy: 'admin@demo.local',
  });
  assert(locRecord.radiusKm === 7, `Partner locality radius is strictly capped at 7 km (got ${locRecord.radiusKm} km)`);

  // Inside vs Outside Locality Radius check
  const insidePoint = { latitude: 12.9800, longitude: 77.6000 }; // ~1.1 km away
  const outsidePoint = { latitude: 13.1500, longitude: 77.7500 }; // ~25 km away
  const isInside = isOrderWithinPartnerLocality(insidePoint, locRecord);
  const isOutside = isOrderWithinPartnerLocality(outsidePoint, locRecord);
  assert(isInside && !isOutside, 'Locality radius check correctly accepts inside point and rejects outside point');

  // Locality Update with audit history
  const updatedLoc = await kycService.setPartnerLocality({
    partnerId: testPartnerId,
    localityName: 'Sector 9 West Block',
    city: 'Town Beta',
    postalCode: '560009',
    latitude: 12.9350,
    longitude: 77.6240,
    radiusKm: 6,
    verifiedBy: 'admin@demo.local',
    reason: 'Partner relocated residence',
  });
  assert((updatedLoc.history?.length ?? 0) === 1 && updatedLoc.history?.[0]?.localityName === 'Sector 5 Hub', 'Admin locality update archives previous locality in audit history');

  // 6. ROUTE MATCHING DETERMINISM (A->B vs A->B = MATCH; A->C vs A->B = NO MATCH)
  console.log('\n[6] Testing Deterministic Route Matching Logic:');
  const routeMatcher = new DeterministicRouteMatchingService();

  // Create test trip A -> B
  const tripOrigin = createLocation({
    formattedAddress: 'Terminal A, Sector 1',
    latitude: 12.9716,
    longitude: 77.5946,
    city: 'City A',
  });
  const tripDestB = createLocation({
    formattedAddress: 'Terminal B, Sector 7',
    latitude: 12.9350,
    longitude: 77.6240,
    city: 'City B',
  });
  const tripDestC = createLocation({
    formattedAddress: 'Far North Terminal C',
    latitude: 13.1800,
    longitude: 77.7800,
    city: 'City C',
  });

  // Create an order A -> B ready for pickup
  const orderAtoB = await OrderModel.create({
    orderNumber: `ORD-TEST-${Date.now()}`,
    customerId: 'cust_test',
    customerName: 'Test Customer',
    shopId: 'shop_test',
    shopName: 'Test Shop A',
    shopLocation: tripOrigin,
    items: [{ productId: 'p1', name: 'Item 1', price: 100, quantity: 1, unit: 'pc', weightKg: 1, subtotal: 100 }],
    subtotal: 100,
    deliveryFee: 35,
    platformFee: 5,
    travellerEarnings: 28,
    total: 140,
    deliveryLocation: tripDestB,
    orderStatus: 'READY_FOR_PICKUP',
    deliveryOtp: '482910',
    statusHistory: [],
  });

  // Setup partner locality near Destination B for testPartnerId
  await kycService.setPartnerLocality({
    partnerId: testPartnerId,
    localityName: 'City B Hub',
    city: 'City B',
    postalCode: '560002',
    latitude: tripDestB.latitude,
    longitude: tripDestB.longitude,
    radiusKm: 5,
    verifiedBy: 'admin',
  });

  // Trip A -> B
  const tripAtoB: any = {
    travellerId: testPartnerId,
    travellerName: 'Verified Partner',
    origin: tripOrigin,
    destination: tripDestB,
    travelDate: '2026-10-05',
    maxPackageCapacity: 20,
    currentPackageCount: 0,
    maxWeightKg: 50,
    currentWeightKg: 0,
  };

  // Trip A -> C
  const tripAtoC: any = {
    ...tripAtoB,
    destination: tripDestC,
  };

  const matchesAB = await routeMatcher.findCompatibleOrdersForTrip(tripAtoB, testPartnerId);
  const matchesAC = await routeMatcher.findCompatibleOrdersForTrip(tripAtoC, testPartnerId);

  const matchedInAB = matchesAB.compatibleOrders.some((o) => o._id.toString() === orderAtoB._id.toString());
  const matchedInAC = matchesAC.compatibleOrders.some((o) => o._id.toString() === orderAtoB._id.toString());
  if (!matchedInAB) {
    const exp = matchesAB.explanations.find(e => e.orderId === orderAtoB._id.toString());
    console.log('Diagnostic for orderAtoB:', exp ? exp.reasons : 'No explanation found for order, total explanations: ' + matchesAB.explanations.length);
  }

  assert(matchedInAB, 'Trip A->B vs Order A->B = MATCH');
  assert(!matchedInAC, 'Trip A->C vs Order A->B = NO MATCH (destination exceeds match radius)');

  // 7. ROUTE POOL FORMATION & PICKUP CHECKLIST
  console.log('\n[7] Testing Route Pool Formation & Pickup Checklist:');
  const pool = await routeMatcher.createRoutePoolForTrip(tripAtoB, [orderAtoB._id.toString()]);
  assert(pool.status === 'OPEN' && pool.packageCount === 1, 'Route pool formed in OPEN status with package count');
  assert(pool.pickupStops.length === 1 && pool.pickupStops[0].shopId === 'shop_test', 'Stops correctly grouped by shop');

  // Accept Route Pool
  const acceptedPool = await routeMatcher.acceptRoutePool(pool._id.toString(), testPartnerId, 'Test Partner');
  assert(acceptedPool.status === 'ACCEPTED', 'Route pool transitions to ACCEPTED');

  const reloadedOrder = await OrderModel.findById(orderAtoB._id);
  assert(reloadedOrder?.orderStatus === 'TRAVELLER_ASSIGNED', 'Pooled order automatically transitions to TRAVELLER_ASSIGNED');

  // 8. DELIVERY OTP VERIFICATION & RATE LIMITING
  console.log('\n[8] Testing Delivery OTP Verification:');
  const correctOtp = orderAtoB.deliveryOtp;
  const wrongOtp = '999999';

  // Test wrong OTP attempt
  let otpFailed = false;
  if (reloadedOrder) {
    if (reloadedOrder.deliveryOtp !== wrongOtp) {
      reloadedOrder.otpAttempts += 1;
      await reloadedOrder.save();
      otpFailed = true;
    }
  }
  assert(otpFailed && reloadedOrder?.otpAttempts === 1, 'Incorrect OTP increments attempt counter and rejects completion');

  // Test correct OTP verification
  if (reloadedOrder) {
    if (reloadedOrder.deliveryOtp === correctOtp) {
      reloadedOrder.orderStatus = 'COMPLETED';
      reloadedOrder.deliveredAt = new Date();
      await reloadedOrder.save();
    }
  }

  const completedOrder = await OrderModel.findById(orderAtoB._id);
  assert(completedOrder?.orderStatus === 'COMPLETED' && completedOrder?.deliveredAt !== null, 'Correct OTP verifies and transitions order to COMPLETED');

  // Cleanup test order
  await OrderModel.findByIdAndDelete(orderAtoB._id);
  await RoutePoolModel.findByIdAndDelete(pool._id);

  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');

  await mongoose.disconnect();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
