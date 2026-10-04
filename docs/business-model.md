# Business Model & Transparent Pricing

## 1. Principles
- **No Extortionate Aggregator Fees**: Traditional food and quick-commerce delivery platforms extract 25–35% commissions from small local shops, plus inflated hidden customer convenience fees.
- **Fair Split**:
  - The delivery fee is distributed directly to the route traveller ($80\%$).
  - The platform charges a small $5\%$ commission on subtotal.
  - Shop owners keep their full in-store pricing margins.

---

## 2. Dynamic Fee Calculation
$$\text{Delivery Fee} = \begin{cases} 
\text{BASE\_DELIVERY\_FEE} \ (₹35), & \text{Standard Delivery} \\ 
\text{EXPRESS\_DELIVERY\_FEE} \ (₹70), & \text{Express Priority} 
\end{cases}$$

$$\text{Platform Commission} = \text{Subtotal} \times 5\%$$
$$\text{Traveller Payout} = \text{Delivery Fee} \times 80\%$$
$$\text{Total Paid by Customer} = \text{Subtotal} + \text{Delivery Fee} + \text{Platform Commission}$$

Example breakdown:
- Customer orders ₹400 worth of electrical spares with Standard delivery:
  - Subtotal: ₹400
  - Delivery Fee: ₹35
  - Platform Commission: ₹20 (5%)
  - Total: ₹455
  - Verified Traveller receives: ₹28 directly upon entering delivery OTP
  - Merchant receives: ₹400 (minus 5% merchant commission = ₹380 net)

---

## 3. Extensible Revenue Streams
The architecture includes extension hooks for:
- Merchant sponsored / featured listings
- Volume loyalty subscriptions
- Distance surge allowances (extra ₹5 per km beyond 5 km)
- Professional route-pooling partner programs
