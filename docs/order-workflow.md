# Order Lifecycle & Delivery OTP Workflow

## 1. State Machine Transitions

Orders progress through an explicit, strictly validated state machine:

```
PENDING
  │ (Shop reviews order)
  ▼
SHOP_CONFIRMED
  │ (Shop prepares & packs items)
  ▼
PREPARING
  │ (Shop marks packaged)
  ▼
READY_FOR_PICKUP  ◄── (Becomes available for route matching)
  │
  ├──────────────────────────────┐
  ▼                              ▼
ROUTE_MATCHING           TRAVELLER_ASSIGNED
  │ (Pool formed)                │ (Traveller picks up at shop)
  └─────────────────────────────►│
                                 ▼
                             PICKED_UP
                                 │ (En route to destination)
                                 ▼
                          OUT_FOR_DELIVERY
                                 │ (Traveller inputs customer OTP)
                                 ▼
                             DELIVERED
                                 │ (Immediate finalization)
                                 ▼
                             COMPLETED
```

Other Terminal / Exception States:
- `CANCELLED`: Allowed before package pickup.
- `FAILED`: Delivery handoff failure.
- `REFUNDED`: Financial refund recorded.
- `DISPUTED`: Open ticket investigated by Admin.

---

## 2. Delivery OTP Confirmation (Section 7)
- Generated randomly as a 6-digit numeric PIN upon order placement.
- Rendered exclusively to the customer on their order tracking view.
- Never exposed to the traveller or logged in plain text.
- When the traveller arrives at the delivery destination, the customer provides the 6-digit PIN.
- Traveller submits the code via `/api/orders/[id]/verify-otp`:
  - Correct code: Order transitions to `COMPLETED`, traveller earnings are credited, and customer is notified.
  - Wrong code: Rejection response with rate-limiting attempt counter (locks after 5 failures).
