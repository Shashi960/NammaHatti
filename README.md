# LocalMesh — Geographically Dynamic Local-Commerce & Route-Pooled Delivery Platform

> **Connecting local communities through smart, route-pooled logistics.**  
> LocalMesh empowers local neighbourhood merchants, customers, and commuters by transforming everyday travel into an efficient, low-cost delivery network.

---

## 🌟 Key Differentiators & Product Concept

Unlike on-demand quick-commerce platforms that deploy dedicated delivery riders for single small orders (causing congestion and unsustainable unit economics), **LocalMesh groups compatible orders across multiple local shops along the exact commute path of verified travellers**.

- **Route First, Not Dedicated Riders**: Orders are matched to travellers already journeying from Location A to Location B.
- **Geographically Dynamic**: Zero hard-coded cities, towns, or routes. The platform natively functions across any village, town, city, district, or state using MongoDB `2dsphere` GeoJSON indexes and coordinate geometry.
- **Strict Privacy Architecture**: Zero storage of raw identity documents or full residential addresses. Travellers are verified via locality centroids with an enforced 5 km default and a strict 7 km hard cap.
- **Resilient Map Abstraction**: Primary Google Maps JavaScript API with an automatic, crash-proof Haversine formula and SVG coordinate viewer fallback when API credentials are absent.
- **Tamper-Proof Handoff**: Strict state-machine progression governed by a cryptographically generated 6-digit Delivery OTP known only to the customer.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14.2 (App Router), React 18, Tailwind CSS, Lucide Icons, Recharts |
| **Backend & APIs** | Next.js Serverless Route Handlers, Edge-ready middleware |
| **Database** | MongoDB 6+ / Mongoose 8 (`2dsphere` geospatial indexing, text search) |
| **Authentication & RBAC** | `jose` (JWT in HTTP-only cookies), `bcryptjs` password hashing |
| **Maps & Routing** | Google Maps Platform (Places, Geocoding, Directions) + Haversine SVG Fallback |
| **Verification & Privacy** | `KYCService` abstraction (MockKYC + DigiLocker ready), Locality Centroid Cap |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Installation
```bash
# Clone and enter the repository
cd c:\NammaMart

# Install dependencies
npm install
```

### 3. Environment Configuration
Create or edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/localmesh
NEXT_PUBLIC_APP_NAME=LocalMesh
NEXT_PUBLIC_BRAND_COLOR=#059669
JWT_SECRET=super-secret-localmesh-jwt-key-2026-production-ready
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_API_KEY=
```
*(Note: If Google Maps API keys are empty, LocalMesh automatically operates in its resilient SVG + Haversine fallback mode without crashing).*

### 4. Seed Database
Populate 10 shops, 35+ products, 10 customers, 5 verified travellers, 22 realistic orders, and route pools:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Execute the automated test suite covering pricing, route matching, locality caps, order state machine, and delivery OTP:
```bash
npm run test
```
**Test Results:** 34/34 passing (100% test success rate).

---

## 👥 Demo Walkthrough & User Roles

LocalMesh provides pre-seeded accounts for all four user roles. On the `/login` page, you can use the **1-Click Dev Quick-Fill** bar:

| Role | Email | Password | What to Experience |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.local` | `demo1234` | Governance, audit logs, KYC approvals, dynamic fees |
| **Shop Merchant** | `shop@demo.local` | `demo1234` | Inventory, order preparation, mark ready for pickup |
| **Traveller** | `traveller@demo.local` | `demo1234` | Plan trip, match route pools, pickup checklist, OTP delivery handoff |
| **Customer** | `customer@demo.local` | `demo1234` | Multi-shop discovery, cart checkout, order tracking & OTP display |

For detailed step-by-step instructions, see [`docs/demo-guide.md`](file:///c:/NammaMart/docs/demo-guide.md).

---

## 📚 Complete Documentation Index

All core architectural decisions and subsystem guides are located in `/docs`:
- [Architecture & System Design](file:///c:/NammaMart/docs/architecture.md)
- [Deterministic Route Matching](file:///c:/NammaMart/docs/route-matching.md)
- [KYC & Locality Privacy System](file:///c:/NammaMart/docs/kyc-and-locality.md)
- [Order Lifecycle & State Machine](file:///c:/NammaMart/docs/order-workflow.md)
- [Geographic Location Architecture](file:///c:/NammaMart/docs/location-system.md)
- [Maps & Resilient Fallback](file:///c:/NammaMart/docs/google-maps.md)
- [Database Models & Indexes](file:///c:/NammaMart/docs/database.md)
- [Security, RBAC & Privacy](file:///c:/NammaMart/docs/security.md)
- [Business Model & Pricing Engine](file:///c:/NammaMart/docs/business-model.md)
- [API Reference](file:///c:/NammaMart/docs/api.md)
- [Testing & Quality Assurance](file:///c:/NammaMart/docs/testing.md)
- [Demo Guide & Walkthrough Script](file:///c:/NammaMart/docs/demo-guide.md)
- [Deployment Guide](file:///c:/NammaMart/docs/deployment.md)
- [Future Product Roadmap](file:///c:/NammaMart/docs/future-roadmap.md)
