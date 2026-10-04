# Complete Demo Walkthrough Guide — LocalMesh

This guide provides a comprehensive step-by-step walkthrough for evaluating and demonstrating the **LocalMesh** local-commerce and route-pooled delivery platform across all four roles:
1. **Customer**
2. **Local Shop Owner**
3. **Traveller / Delivery Partner**
4. **Platform Administrator**

---

## 0. Quick Access Demo Accounts

Every demo account is pre-configured with password `password123`. The `/login` page features a **1-Click Dev Quick-Fill** bar that instantly populates login credentials for any role.

| Role | Name | Email | Password | Location / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Platform Super Admin | `admin@demo.local` | `demo1234` | Full governance, business rules & audit logs |
| **Shop Merchant** | Rajesh Hardware Owner | `shop@demo.local` | `demo1234` | Apex Tools & Electricals (Sector 1, Metro Alpha) |
| **Customer** | Sarah Jenkins | `customer@demo.local` | `demo1234` | Sector 14, Town Beta |
| **Traveller** | Karthik Traveller | `traveller@demo.local` | `demo1234` | Verified Traveller (Locality: Metro Alpha, Cap: 5 km) |

---

## 1. Scenario: Route-Pooled Delivery Across 4 Roles

### Step 1: Customer Explores and Orders
1. Open the homepage: [http://localhost:3000](http://localhost:3000)
2. Log in as **Customer Sarah** (`customer@demo.local` / `demo1234`) using the Quick-Fill bar.
3. Observe the location selector in the header bar showing your active delivery location (or click "Change Location" to pick a location on the interactive map).
4. Click **"Explore Shops"** (`/shops`).
   - View the local shops arranged on the interactive map and responsive grid.
   - Note the **"✓ Verified Shop"** badges.
5. Click **"The Daily Crumb Bakery"** (`/shops/[id]`).
   - Browse baked goods: Artisan Sourdough Loaf, Butter Croissant Box, etc.
   - Click **"Add to Cart"** on 2 loaves of Artisan Sourdough.
6. Open Cart (`/cart`).
   - Observe the transparent fee breakdown:
     - Subtotal
     - Delivery Fee (Standard ₹35 vs. Express ₹70)
     - Platform Fee (5%)
     - Total
     - "Why do I pay this fee?" explanatory note explaining route-pooling mechanics.
7. Choose **Standard Delivery** and click **"Proceed to Checkout"**.
8. Select payment method: **Demo Online Payment** (or Cash on Delivery).
9. Click **"Pay & Place Order"**.
   - You are redirected to `/orders/[id]`.
   - The status is `PENDING`.
   - Your secret **6-digit Delivery OTP** is displayed in a secure green card: *"Share this code with the delivery partner ONLY when packages are handed over."*

---

### Step 2: Shop Accepts and Prepares Order
1. Log out or open an Incognito window.
2. Log in as **Shop Merchant Rajesh** (`shop@demo.local` / `demo1234`).
3. You are automatically routed to the **Shop Dashboard** (`/shop/dashboard`).
4. Notice the newly arrived order in the **"Active Orders"** section.
5. Click **"Accept Order"**:
   - Status transitions to `SHOP_CONFIRMED`.
6. Click **"Mark Preparing"**:
   - Status transitions to `PREPARING`.
7. Once the package is packed, click **"Ready for Pickup"**:
   - Status transitions to `READY_FOR_PICKUP`.
   - The order is now pooled and available to verified travellers whose trips match this route.

---

### Step 3: Verified Traveller Creates Trip & Accepts Route Pool
1. Log in as **Traveller Karthik** (`traveller@demo.local` / `demo1234`).
2. Go to **Traveller Dashboard** (`/traveller/dashboard`).
   - Notice your verified status: **"✓ Verified Traveller"** with residential locality set to Metro Alpha.
3. Click **"Plan New Trip"** (`/traveller/trips/new`).
   - Origin: Type or select **Metro Alpha**.
   - Destination: Type or select **Town Beta**.
   - Travel Date: Today.
   - Departure Time: 09:00 AM.
   - Package Capacity: 5 packages.
   - Click **"Create Trip & Find Compatible Orders"**.
4. The system navigates to `/traveller/trips/[id]/matches`.
   - LocalMesh's deterministic matching engine evaluates:
     - Origin proximity $\le 5$ km
     - Destination proximity $\le 5$ km
     - Verified locality eligibility $\le 7$ km cap
     - Package capacity and shop readiness
   - The system displays the matched Route Pool: pickup stop at Apex Tools, delivering to Sarah in Town Beta.
   - Estimated Traveller Earnings: calculated dynamically based on distance and pooling tier.
5. Click **"Accept Route Pool"**:
   - Status transitions to `TRAVELLER_ASSIGNED`.
   - A real-time notification is sent to both the merchant and customer Sarah.

---

### Step 4: Pickup Sequence & Secure Delivery Handoff
1. Go to the active Route Pool details page (`/traveller/route-pools/[id]`).
2. View the **Interactive Route Map** showing the sequence:
   - Origin $\rightarrow$ Shop Stop $\rightarrow$ Customer Drop-off $\rightarrow$ Destination.
3. Arrive at Apex Tools:
   - Check the items and click **"Confirm Pickup"**.
   - Order transitions to `PICKED_UP` and `OUT_FOR_DELIVERY`.
4. Travel to Sarah's delivery address in Town Beta:
   - Expand the delivery stop card.
   - Customer name, address landmark, and package count are displayed (strict privacy: no unnecessary private data).
5. Delivery Confirmation:
   - Ask Customer Sarah for her 6-digit Delivery OTP.
   - Enter the 6-digit OTP into the verification form and click **"Verify & Complete Delivery"**.
   - The system checks the OTP in constant time, increments attempts if invalid, and on match returns:
     - **"✓ Delivery Confirmed Successfully!"**
   - Order transitions to `DELIVERED` and `COMPLETED`.
   - Karthik's wallet balance increases with the delivery payout.

---

### Step 5: Customer Reviews the Order
1. Switch back to Customer Sarah's view (`/orders/[id]`).
2. The page updates to `DELIVERED`.
3. Sarah is prompted:
   - "How was your experience with Apex Tools?" (1–5 Stars + Review comment).
   - "How was your delivery with Karthik?" (1–5 Stars).
4. Submit review. The shop's average rating is automatically updated.

---

### Step 6: Platform Admin Oversight & Governance
1. Log in as **Admin** (`admin@demo.local` / `demo1234`).
2. Navigate to **Admin Dashboard** (`/admin/dashboard`):
   - **System Metrics**: Total platform orders, active route pools, GMV, platform fee revenue, active shops, and verified travellers.
   - **Shop Verifications**: Approve or reject pending local shop applications.
   - **Traveller KYC Approvals**: Review mock KYC submissions, inspect residential locality centroids, and enforce the 7 km maximum radius cap.
   - **Dynamic Business Rules**: Tune delivery fees (base fee, per-km rate, express surcharge), platform commission percentage, and matching radii without code redeployments.
   - **Dispute Resolution & Audit Logs**: Inspect problem reports, refunds, and view chronological immutable audit logs of all administrative actions.

---

## 2. Testing Edge Cases in the Demo

- **Invalid OTP Attempt**: In the Traveller verification modal, enter `000000`. Observe the error message *"Invalid OTP. Please check with customer. 4 attempts remaining."*
- **Locality Cap Enforcement**: In Admin Business Rules or Traveller Locality, attempt to set the partner radius to `8.5 km`. The system rejects the update with *"Radius cannot exceed the 7 km maximum eligibility cap."*
- **Offline / Missing Map Keys**: Disconnect `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. The interface gracefully renders the SVG fallback coordinate map and straight-line distances with zero console crashes or page breaks.
