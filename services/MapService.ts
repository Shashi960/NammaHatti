import { Location, createLocation } from '@/types/location';

export interface RouteDistanceResult {
  distanceKm: number;
  durationMinutes: number;
  isFallback: boolean;
}

export interface IMapService {
  calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteDistanceResult>;
  geocode(address: string): Promise<Location[]>;
  reverseGeocode(lat: number, lng: number): Promise<Location>;
}

/**
 * Great-circle distance between two points using the Haversine formula (in kilometers).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

export class DefaultMapService implements IMapService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteDistanceResult> {
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${this.apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          return {
            distanceKm: Math.round((element.distance.value / 1000) * 10) / 10,
            durationMinutes: Math.round(element.duration.value / 60),
            isFallback: false,
          };
        }
      } catch (err) {
        // Fall back gracefully
        console.warn('Google Maps API request failed, falling back to Haversine calculation');
      }
    }

    // Straight-line fallback with urban velocity model (avg 25 km/h + 5 min overhead)
    const dist = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const estMinutes = Math.max(5, Math.round((dist / 25) * 60) + 5);
    return {
      distanceKm: dist,
      durationMinutes: estMinutes,
      isFallback: true,
    };
  }

  async geocode(address: string): Promise<Location[]> {
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.results?.length) {
          return data.results.map((res: any) => {
            const lat = res.geometry.location.lat;
            const lng = res.geometry.location.lng;
            return createLocation({
              placeId: res.place_id,
              formattedAddress: res.formatted_address,
              latitude: lat,
              longitude: lng,
              city: this.extractComponent(res.address_components, 'locality') || 'Generic Locality',
              district: this.extractComponent(res.address_components, 'administrative_area_level_2') || '',
              state: this.extractComponent(res.address_components, 'administrative_area_level_1') || '',
              country: this.extractComponent(res.address_components, 'country') || 'DemoCountry',
              postalCode: this.extractComponent(res.address_components, 'postal_code') || '000000',
            });
          });
        }
      } catch (err) {
        console.warn('Google Maps Geocoding failed, falling back to synthetic coordinates');
      }
    }

    // Generic geocode fallback for demo / test without API key
    // Deterministic lat/long derived from address string hash so repeated queries stay stable
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoLat = 12.9 + (hash % 100) * 0.005;
    const pseudoLng = 77.5 + (hash % 80) * 0.005;

    return [
      createLocation({
        formattedAddress: address,
        latitude: Math.round(pseudoLat * 10000) / 10000,
        longitude: Math.round(pseudoLng * 10000) / 10000,
        city: 'Locality Central',
        district: 'District 1',
        state: 'Province Alpha',
        country: 'DemoCountry',
        postalCode: '560001',
      }),
    ];
  }

  async reverseGeocode(lat: number, lng: number): Promise<Location> {
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.results?.[0]) {
          const res0 = data.results[0];
          return createLocation({
            placeId: res0.place_id,
            formattedAddress: res0.formatted_address,
            latitude: lat,
            longitude: lng,
            city: this.extractComponent(res0.address_components, 'locality') || 'Generic Locality',
            district: this.extractComponent(res0.address_components, 'administrative_area_level_2') || '',
            state: this.extractComponent(res0.address_components, 'administrative_area_level_1') || '',
            country: this.extractComponent(res0.address_components, 'country') || 'DemoCountry',
            postalCode: this.extractComponent(res0.address_components, 'postal_code') || '000000',
          });
        }
      } catch (err) {
        console.warn('Google Maps Reverse Geocoding failed, using fallback location');
      }
    }

    return createLocation({
      formattedAddress: `Location at (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
      city: 'Locality Central',
      district: 'District 1',
      state: 'Province Alpha',
      country: 'DemoCountry',
      postalCode: '560001',
    });
  }

  private extractComponent(components: any[], type: string): string {
    if (!components) return '';
    const comp = components.find((c: any) => c.types?.includes(type));
    return comp ? comp.long_name : '';
  }
}

export const mapService = new DefaultMapService();
