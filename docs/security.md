# Security & Trust Model

## 1. Authentication & Session Management
- **Password Security**: Passwords hashed with `bcryptjs` using 10 salt rounds.
- **JWT Cookies**: Stateless session management via `jose` with `HS256`, 7-day expiration, and `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (in production).
- **Backend Role-Based Access Control**:
  - Frontend routes AND backend API routes explicitly check session role (`CUSTOMER`, `SHOP`, `TRAVELLER`, `ADMIN`).
  - Account suspension checks block suspended accounts immediately across all API endpoints.

---

## 2. Ownership Authorization
- A shop merchant can only modify their own products and update orders placed at their store.
- A traveller can only accept eligible route pools and see assigned delivery packages.
- Customers can only view and cancel their own orders.

---

## 3. Sensitive Data Minimization
- **Strict Privacy**: No storage of raw Aadhaar numbers, PAN, government ID scans, or exact residential addresses.
- **Locality Centroid**: Coarse centroid coordinates and locality names are used for spatial calculations.
- **Delivery Information Protection**:
  - The traveller only sees customer first name, delivery address, instructions, and package information.
  - The 6-digit delivery OTP is shown ONLY to the customer and admin, never to the traveller.
  - The OTP must be provided by the customer at physical handoff.
  - OTP verification enforces a maximum 5-attempt rate limit.

---

## 4. Input Validation & Audit Logging
- Every endpoint validates incoming payloads with strict Zod schemas.
- Administrative actions (status changes, approvals, rule updates, suspensions) are logged to the `AdminAction` audit trail.
