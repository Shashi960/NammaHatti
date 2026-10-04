# Testing Guide — LocalMesh Platform

This document describes the testing architecture, automated test suites, test scenarios, edge cases, and instructions for verifying the LocalMesh local-commerce and route-pooled delivery platform.

---

## 1. Test Architecture Overview

LocalMesh uses an automated test runner (`scripts/test-runner.ts`) designed to test domain services, validation logic, calculation models, and state-machine transitions directly against live database logic and pure functions without browser overhead.

### Test Categories
1. **Domain Services & Utilities**:
   - Haversine distance calculations
   - Pricing engine (Standard vs. Express, platform commission, traveller payout)
   - Locality radius cap validation (strictly capped at 7 km)
   - Route-matching compatibility algorithm
2. **State Machine Integrity**:
   - Order status transitions (valid and invalid paths)
   - OTP delivery confirmation logic & rate limiting
3. **Authentication & RBAC**:
   - JWT creation, signing, and verification
   - Password hashing and verification via `bcryptjs`
   - Role-based route guard semantics

---

## 2. Running Automated Tests

To execute the full automated test suite:

```bash
npm run test
```

### Expected Output
The test runner executes 34 distinct assertions across 7 core modules:
- ✓ `haversineDistanceKm` calculates accurate geographic distance
- ✓ `calculateOrderPricing` calculates standard delivery correctly
- ✓ `calculateOrderPricing` calculates express delivery correctly
- ✓ `calculateOrderPricing` enforces platform and traveller earnings split
- ✓ `KYCService` validates locality radius within cap (<= 7 km)
- ✓ `KYCService` rejects locality radius exceeding 7 km hard cap
- ✓ `OrderStateMachine` allows valid transition: PENDING -> SHOP_CONFIRMED
- ✓ `OrderStateMachine` allows valid transition: SHOP_CONFIRMED -> PREPARING
- ✓ `OrderStateMachine` allows valid transition: PREPARING -> READY_FOR_PICKUP
- ✓ `OrderStateMachine` allows valid transition: READY_FOR_PICKUP -> TRAVELLER_ASSIGNED
- ✓ `OrderStateMachine` allows valid transition: TRAVELLER_ASSIGNED -> PICKED_UP
- ✓ `OrderStateMachine` allows valid transition: PICKED_UP -> OUT_FOR_DELIVERY
- ✓ `OrderStateMachine` allows valid transition: OUT_FOR_DELIVERY -> DELIVERED
- ✓ `OrderStateMachine` allows valid transition: DELIVERED -> COMPLETED
- ✓ `OrderStateMachine` prevents illegal transition: PENDING -> DELIVERED
- ✓ `OrderStateMachine` prevents illegal transition: COMPLETED -> CANCELLED
- ✓ `DeliveryOTP` verifies matching 6-digit code
- ✓ `DeliveryOTP` rejects incorrect 6-digit code
- ✓ `DeliveryOTP` increments failed attempts and enforces lockouts
- ✓ `JWT` creates valid token and verifies payload
- ✓ `JWT` rejects invalid/tampered token
- ✓ `Bcrypt` hashes and verifies passwords
- ✓ `RouteMatching` matches orders within origin & destination radii
- ✓ `RouteMatching` rejects orders outside traveller destination radius
- ✓ `RouteMatching` respects package weight and capacity constraints
- ...and additional boundary assertions.

**Target Success Rate:** 34/34 passing (100%).

---

## 3. Manual Test Scenarios

### Scenario 1: Complete 4-Role Purchase and Route-Pooled Delivery
1. **Customer Discovery & Checkout**:
   - Log in as `priya@example.com` (Customer, City A).
   - Search for "Artisan Sourdough Loaf" from "The Daily Crumb Bakery".
   - Add 2 loaves to cart.
   - Proceed to checkout. Select **Standard Delivery**. Choose saved delivery address or current location.
   - Click "Place Order (Demo Pay)". Order is created with status `PENDING` and a 6-digit OTP is generated.
2. **Shop Preparation**:
   - Log in as `owner.bakery@example.com` (Daily Crumb Bakery).
   - Go to Shop Dashboard. The new order appears under "New Incoming Orders".
   - Click "Accept Order" (`SHOP_CONFIRMED`).
   - Click "Mark Preparing" (`PREPARING`).
   - When ready, click "Ready for Pickup" (`READY_FOR_PICKUP`). The order is now pooled for compatible travellers.
3. **Traveller Route Pooling**:
   - Log in as `arun.traveller@example.com` (Verified Traveller).
   - Go to "New Trip". Create a trip with Origin: Sector 4 (City A), Destination: Sector 15 (Town B), Departure: Today, Capacity: 5 packages.
   - Click "Find Compatible Orders".
   - The matching engine identifies the bakery order as compatible (within origin and destination radius and within verified locality cap).
   - Click "Accept Route Pool". Order status transitions to `TRAVELLER_ASSIGNED`.
4. **Pickup & Delivery Handoff**:
   - Traveller visits the bakery and taps "Mark Picked Up" on the pickup checklist (`PICKED_UP` -> `OUT_FOR_DELIVERY`).
   - Traveller arrives at Priya's destination.
   - Priya reveals her delivery OTP from her Order Tracking page.
   - Traveller inputs the 6-digit OTP into the delivery portal.
   - System confirms: "✓ Delivery Confirmed". Status transitions to `DELIVERED` and `COMPLETED`.
   - Earnings are credited to the traveller; customer is prompted to rate the shop and traveller.

---

## 4. Edge Cases Tested

| Edge Case | Expected System Behavior | Verified |
| :--- | :--- | :--- |
| **Locality Radius > 7 km** | Rejected with error: `Radius cannot exceed maximum allowed cap of 7 km`. | ✓ |
| **Unverified Traveller accepts order** | Server returns `403 Forbidden: KYC verification required`. | ✓ |
| **Tampered / Invalid OTP** | Delivery is blocked. Attempt counter increments. After 5 attempts, OTP is locked. | ✓ |
| **Shop tries to modify order after pickup** | Transition rejected by State Machine (`Illegal transition from PICKED_UP to CANCELLED`). | ✓ |
| **Multi-shop cart checkout** | Generates separate sub-orders per shop tied to one parent `checkoutSessionId`. | ✓ |
| **Missing Google Maps API Key** | System falls back to straight-line Haversine distance and SVG coordinate map without crashing. | ✓ |
| **Weight capacity exceeded** | Route matching algorithm excludes orders that would breach vehicle package/weight capacity. | ✓ |
