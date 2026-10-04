# LocalMesh REST API Reference

## 1. Authentication Endpoints

### `POST /api/auth/register`
- Registers a new user (`CUSTOMER`, `SHOP`, `TRAVELLER`, or `ADMIN`).
- Sets secure HTTP-only session cookie.
- Payload: `{ name, email, password, phone, role }`.

### `POST /api/auth/login`
- Authenticates credentials and sets session cookie.
- Payload: `{ email, password }`.

### `POST /api/auth/logout`
- Clears session cookie.

### `GET /api/auth/me`
- Returns currently authenticated user session, role, shop ID, and KYC status.

---

## 2. Location & Map Endpoints

### `POST /api/locations/geocode`
- Geocodes physical address to coordinates, or reverse geocodes lat/lng to physical address.
- Payload: `{ address: string }` OR `{ type: "reverse", lat: number, lng: number }`.

### `POST /api/locations/distance`
- Calculates driving or haversine distance and duration between two coordinates.
- Payload: `{ origin: { lat, lng }, destination: { lat, lng } }`.

---

## 3. Shops & Categories Endpoints

### `GET /api/shops`
- Query parameters: `lat`, `lng`, `radius` (km), `category`, `search`, `all` (admin).
- Returns list of verified shops with live product counts and distance calculations.

### `POST /api/shops`
- Merchant onboarding: registers business details and location.

### `GET /api/shops/[id]`
- Returns shop details and active catalog products.

### `GET /api/categories`
- Lists commerce categories (auto-seeded).

---

## 4. Products & Catalog Endpoints

### `GET /api/products`
- Filters by `search`, `categoryId`, `shopId`, `availability`, `minPrice`, `maxPrice`, `lat`, `lng`, `radius`.

### `POST /api/products`
- Merchant adds new product with stock, SKU, price, weight (kg).

### `PUT /api/products/[id]`
- Updates product details or inventory stock levels.

### `DELETE /api/products/[id]`
- Removes product from catalog.

---

## 5. Orders & Checkout Endpoints

### `POST /api/checkout`
- Parent checkout session supporting multi-shop item carts.
- Splits into child shop orders, reserves inventory stock, computes transparent fees, and generates 6-digit Delivery OTP.

### `GET /api/orders`
- Returns user's orders (role-filtered: customer sees own, shop sees store orders, traveller sees assigned).

### `GET /api/orders/[id]`
- Order tracking details with status history and delivery map.
- Delivery OTP shown only to customer and admin.

### `PUT /api/orders/[id]/status`
- Validated state machine transition (`PENDING` $\rightarrow$ `SHOP_CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY_FOR_PICKUP` $\rightarrow$ etc.).

### `POST /api/orders/[id]/verify-otp`
- Delivery partner enters customer's 6-digit OTP.
- On match: Order marked `COMPLETED`, traveller earnings credited, payment finalized.

---

## 6. Traveller & Route-Pooling Endpoints

### `GET /api/traveller/kyc`
- Checks partner KYC verification status and residential locality centroid.

### `POST /api/traveller/kyc`
- Submits partner KYC documents and locality coordinates (capped at 7 km radius).

### `POST /api/traveller/trips`
- Declares commuter journey (Origin, Destination, Travel Date, Departure, Arrival, Capacity).

### `GET /api/traveller/trips/[id]/matches`
- Runs deterministic matching engine; returns compatible ready orders and audit explanations.

### `POST /api/traveller/route-pools`
- Groups selected compatible orders into a `RoutePool` with pickup stops.

### `POST /api/traveller/route-pools/[id]/accept`
- Locks route pool and transitions pooled orders to `TRAVELLER_ASSIGNED`.

### `POST /api/traveller/route-pools/[id]/pickup-stop`
- Marks merchant pickup stop completed and transitions orders to `PICKED_UP`.

---

## 7. Admin & Oversight Endpoints

### `GET /api/admin/stats`
- Total GMV, platform fees, order counts, verified counts, completion rates.

### `POST /api/admin/verify-shop`
- Approves or rejects shop merchant business.

### `POST /api/admin/verify-traveller`
- Approves or rejects delivery partner KYC.

### `GET /api/admin/business-rules` & `PUT /api/admin/business-rules`
- Reads and updates dynamic platform fees, commissions, and radius caps.

### `GET /api/admin/logs`
- Inspects immutable administrative audit trails.
