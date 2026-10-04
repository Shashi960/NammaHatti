# Geographically Dynamic Location System

## 1. Zero Hardcoding Principle
LocalMesh **never** contains hardcoded cities, towns, or routes:
- No `if (city === "Bengaluru")`.
- No hardcoded origin-destination combinations.
- All location entities use generic coordinates and addresses.

---

## 2. Reusable Location Object
Every shop, delivery address, trip origin, and destination uses the standardized `Location` schema:

```typescript
interface Location {
  locationId: string;
  placeId?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  landmark?: string;
  geoJSON: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] for MongoDB 2dsphere
  };
}
```

---

## 3. MongoDB 2dsphere Geospatial Indexing
The following collections maintain `2dsphere` indexes on their `geoJSON` subdocuments:
- `shops.location.geoJSON`
- `orders.shopLocation.geoJSON`
- `orders.deliveryLocation.geoJSON`
- `travellerTrips.origin.geoJSON`
- `travellerTrips.destination.geoJSON`
- `routePools.origin.geoJSON`
- `routePools.destination.geoJSON`
- `partnerLocalities.centroid.geoJSON`

---

## 4. Haversine Calculation
When coordinates are compared, the great-circle Haversine formula is used to calculate distances in kilometers:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
where $R = 6371\text{ km}$.
