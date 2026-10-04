# Delivery Partner Identity, Locality Verification & Privacy

## 1. Principles
- **Safety & Trust**: Only verified delivery partners can accept customer orders.
- **Strict Privacy**: LocalMesh does NOT store raw identity numbers (e.g. Aadhaar), photos of government IDs, or sensitive residential addresses.

---

## 2. Locality Centroid Model
Instead of storing house numbers or sensitive personal addresses:
1. When a partner verifies their residence, a **locality centroid** coordinate is recorded along with their locality/area name, city, district, and postal code.
2. A configurable delivery eligibility radius is established around this centroid:
   - **`PARTNER_DEFAULT_RADIUS_KM` = 5 km**
   - **`PARTNER_MAX_RADIUS_KM` = 7 km** (strictly enforced hard cap)
3. Matching checks:
   $$\text{Distance}(\text{Partner Centroid}, \text{Customer Delivery Location}) \le \text{partnerLocality.radiusKm}$$

---

## 3. Locality Changes & Audit History
When a partner relocates:
- The previous locality is archived in the `PartnerLocality.history` array with timestamp and previous centroid.
- Admin approves the new locality after re-verification, creating an immutable audit log entry in `AdminAction`.
