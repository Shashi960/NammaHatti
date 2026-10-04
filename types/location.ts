export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Location {
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
  geoJSON: GeoJSONPoint;
}

export function createLocation(params: {
  locationId?: string;
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
}): Location {
  return {
    locationId: params.locationId || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    placeId: params.placeId || "",
    formattedAddress: params.formattedAddress,
    latitude: params.latitude,
    longitude: params.longitude,
    city: params.city,
    district: params.district || "",
    state: params.state || "",
    country: params.country || "DemoCountry",
    postalCode: params.postalCode || "000000",
    landmark: params.landmark || "",
    geoJSON: {
      type: "Point",
      coordinates: [params.longitude, params.latitude],
    },
  };
}
