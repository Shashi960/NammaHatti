# Deterministic Route-Pooling & Matching Engine

## 1. Overview
Unlike dedicated delivery networks (Blinkit, Swiggy, Zepto) that dispatch individual delivery riders on dedicated point-to-point roundtrips, LocalMesh uses **existing commuter travel**.

A verified traveller travelling from Location A to Location B is matched with small orders from shops near Location A going to recipients near Location B.

---

## 2. Explainable Rule-Based Matching Criteria

Matching is performed deterministically behind the `IRouteMatchingService` interface:

1. **Origin Proximity**:
   $$\text{Distance}(\text{Trip Origin}, \text{Shop Location}) \le \text{ORDER\_MATCH\_RADIUS\_KM} \ (5\text{ km})$$

2. **Destination Proximity**:
   $$\text{Distance}(\text{Trip Destination}, \text{Customer Delivery Location}) \le \text{ORDER\_MATCH\_RADIUS\_KM} \ (5\text{ km})$$

3. **Partner Locality Eligibility**:
   The customer delivery location must lie within the partner's verified residential locality radius:
   $$\text{Distance}(\text{Locality Centroid}, \text{Delivery Location}) \le \text{partnerLocality.radiusKm} \ (\le 7\text{ km})$$

4. **Order Status**:
   Order must have status `READY_FOR_PICKUP` or `SHOP_CONFIRMED` and must have no currently assigned traveller (`travellerId == null`).

5. **Package & Weight Capacity**:
   $$\text{Trip Current Packages} + \text{Order Packages} \le \text{Trip Max Package Capacity}$$
   $$\text{Trip Current Weight} + \text{Order Weight} \le \text{Trip Max Weight (kg)}$$

---

## 3. Explanations
For every candidate order evaluated, the engine produces explicit audit explanations:
- `✓ Pickup shop is nearby origin (1.2 km <= 5 km)`
- `✓ Delivery location is nearby destination (2.1 km <= 5 km)`
- `✓ Within verified locality radius (3.0 km <= 5 km)`
- `✕ Order weight (16.0 kg) exceeds remaining allowance (15.0 kg)`

---

## 4. Route Pool Formation
When compatible orders are selected:
- Orders are grouped by `shopId` into an ordered sequence of **Pickup Stops**.
- Estimated detour time is computed ($8\text{ mins}$ per unique stop $+ 5\text{ mins}$ transit buffer).
- Estimated traveller earnings are summed ($80\%$ of order delivery fees).
- Status advances: `OPEN` $\rightarrow$ `ACCEPTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.
