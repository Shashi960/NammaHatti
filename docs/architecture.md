# LocalMesh Architecture

## 1. High-Level Modular Monolith Architecture

LocalMesh is structured as a **modular monolith** with clean separation between UI components, business domains, database models, and service interfaces:

```
c:\NammaMart/
├── app/                    # Next.js App Router (pages & REST API endpoints)
│   ├── api/                # Secure server API routes (auth, shops, products, orders, etc.)
│   ├── admin/              # Admin dashboard, audit logs, business rules editor
│   ├── cart/               # Multi-shop cart checkout & fee breakdowns
│   ├── customer/           # Customer portal, order history & active live tracking
│   ├── help/               # Help center & dispute resolution
│   ├── orders/             # Order tracking with Delivery OTP & state machine
│   ├── products/           # Product detail pages
│   ├── shops/              # Shop discovery (Map view + List view)
│   ├── shop/               # Shop merchant portal (orders queue, products, inventory)
│   └── traveller/          # Route pooling, trips declaration, match finder, route execution
├── components/             # Reusable UI & Map components
│   ├── maps/               # GoogleMap (with fallback), PlaceAutocomplete, LocationPicker, ShopMap, RouteMap, DeliveryMap
│   └── ui/                 # Badge, icons, design primitives
├── context/                # Client state (AuthContext, LocationContext, CartContext)
├── lib/                    # Core utilities (mongodb connection, jose session, bcrypt, orderStateMachine)
├── models/                 # Mongoose database models & 2dsphere indexes
├── schemas/                # Zod schemas for input validation
├── services/               # Swappable service interfaces (MapService, PricingService, KYCService, PaymentService, RouteMatchingService, NotificationService)
├── types/                  # Central TypeScript domain interfaces
├── scripts/                # Seed scripts & automated test runner
└── docs/                   # Full documentation specifications
```

---

## 2. Core Service Abstractions

1. **`MapService`**:
   - Primary: Google Maps Platform (Directions, Geocoding, Distance Matrix, Places).
   - Resilient Fallback: Haversine distance formula with urban transit velocity models, deterministic coordinate generation, and interactive SVG coordinate canvas. Never crashes when credentials are missing.

2. **`RouteMatchingService`**:
   - Explainable deterministic rule-based engine.
   - Evaluates:
     - Origin proximity ($\le 5\text{ km}$)
     - Destination proximity ($\le 5\text{ km}$)
     - Partner locality eligibility ($\le 5\text{ km}$, hard-capped at $7\text{ km}$)
     - Remaining traveller capacity (package count & weight allowances)
     - Shop readiness (`READY_FOR_PICKUP`)

3. **`KYCService`**:
   - Abstraction supporting identity and locality verification.
   - Strict privacy: No raw Aadhaar numbers or full residential addresses.
   - Retains only coarse centroid coordinates and verification status.

4. **`PricingService`**:
   - Governed by the dynamic `BusinessRules` collection.
   - Computes base/express delivery fee, platform commission (5%), shop commission, and traveller payout (80%).

5. **`PaymentService`**:
   - Supports Cash On Delivery (COD) and Instant Demo Online Payment.
   - Modular interface ready for Razorpay/Stripe integration.

6. **`NotificationService`**:
   - In-app notification feed delivered directly to accounts across all roles.
