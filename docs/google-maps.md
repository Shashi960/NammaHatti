# Google Maps Platform Integration & Resilient Fallback

## 1. Google Maps APIs Used
LocalMesh uses the minimum set of Google Maps Platform APIs:
1. **Maps JavaScript API**: Dynamic interactive client rendering.
2. **Places API (Autocomplete & Details)**: Address predictions and structured place component extraction.
3. **Geocoding & Reverse Geocoding API**: Latitude/longitude $\leftrightarrow$ formatted physical address conversion.
4. **Distance Matrix API**: Server-side driving distances and duration calculations.

---

## 2. Environment Variables
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Restricted browser client key (domain/HTTP referer restricted in Google Cloud Console).
- `GOOGLE_MAPS_API_KEY`: Server-side API key with IP restriction for backend distance matrix and geocoding queries.

---

## 3. Resilient Fallback Architecture
If credentials are not configured or if Google Maps APIs encounter rate limits or network failures:
1. **Never Crash**: The platform gracefully falls back to:
   - **Haversine Distance**: Computes exact geographic great-circle distance.
   - **Urban Velocity Transit Model**: Simulates travel durations based on average urban transit speeds ($25\text{ km/h} + 5\text{ min}$ handling buffer).
   - **Interactive SVG Coordinate Canvas**: Plots origins, destinations, pickup stops, and waypoints with zoomable coordinate projections.
   - **Manual Search & Geolocation**: Uses browser GPS coordinates (`navigator.geolocation`) or direct text address inputs.
