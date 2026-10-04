# Database Architecture & Collections

## 1. Overview
LocalMesh runs on MongoDB with Mongoose ODM and utilizes `2dsphere` indexes on all geographic models.

---

## 2. Collections & Schemas

### `users`
- Authentication credentials, role (`CUSTOMER`, `SHOP`, `TRAVELLER`, `ADMIN`), account status (`ACTIVE`, `SUSPENDED`), and optional linked `shopId`.

### `shops`
- Business name, contact name, category, hours (`openingTime`, `closingTime`), minimum order amount, rating, review count, verification status (`PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`), and embedded `location` with GeoJSON Point.
- Indexes: `location.geoJSON: '2dsphere'`, `businessName: 'text'`.

### `products`
- Store association (`shopId`), name, category, SKU, stock count, unit, weight (kg), dimensions, price, discount price, and inventory availability state (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `UNAVAILABLE`).
- Indexes: `{ shopId: 1, availability: 1 }`, `name: 'text', sku: 'text'`.

### `categories`
- Extensible classification (Grocery, Hardware, Electrical, Plumbing, Farm, etc.) with active status.

### `travellerTrips`
- Origin and destination `Location` subdocuments, travel date, departure time, estimated arrival time, max package capacity, current package count, max weight, and trip status.
- Indexes: `origin.geoJSON: '2dsphere'`, `destination.geoJSON: '2dsphere'`.

### `routePools`
- Pool code (`POOL-XXXXXX`), origin, destination, grouped `pickupStops`, orders list, package count, total weight, extra detour time (minutes), estimated traveller earnings, and status (`OPEN`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).

### `orders`
- Order number, customer info, shop info, items, subtotal, delivery fee, platform fee, traveller earnings, total, delivery type (`STANDARD`, `EXPRESS`), delivery OTP (6 digits), lifecycle status, and status history array.
- Indexes: `shopLocation.geoJSON: '2dsphere'`, `deliveryLocation.geoJSON: '2dsphere'`.

### `partnerLocalities`
- Verified residential locality centroid with GeoJSON Point, radius (km, capped at 7 km), verified timestamp, and historical relocation audit entries.
- Index: `centroid.geoJSON: '2dsphere'`.

### `kycVerifications`
- Verification status (`PENDING`, `VERIFIED`, `REJECTED`), provider name, and provider reference ID.

### `businessRules`
- Single source of truth for platform pricing, radius limits, and commissions.

### `adminActions`
- Immutable audit log recording administrative interventions, status approvals, suspensions, and rule modifications.
