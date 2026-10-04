'use client';

import React from 'react';
import { GoogleMap, MapMarker } from './GoogleMap';
import { Shop } from '@/types/shop';
import Link from 'next/link';

interface ShopMapProps {
  shops: Array<Shop & { distanceKm?: number | null; productCount?: number }>;
  userLocation?: { latitude: number; longitude: number };
  onShopSelect?: (shop: Shop) => void;
  height?: string;
}

export function ShopMap({ shops, userLocation, onShopSelect, height = '450px' }: ShopMapProps) {
  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : shops.length > 0 && shops[0].location
    ? { lat: shops[0].location.latitude, lng: shops[0].location.longitude }
    : { lat: 12.9716, lng: 77.5946 };

  const markers: MapMarker[] = [];

  // User Marker
  if (userLocation) {
    markers.push({
      id: 'user_position',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      title: 'Your Location',
      label: '👤 YOU',
      color: 'blue' as any,
    });
  }

  // Shop Markers
  shops.forEach((s) => {
    if (s.location?.latitude && s.location?.longitude) {
      markers.push({
        id: s._id,
        latitude: s.location.latitude,
        longitude: s.location.longitude,
        title: s.businessName,
        label: s.businessName.substring(0, 8),
        color: s.verificationStatus === 'VERIFIED' ? 'green' : 'route',
        infoHtml: `
          <div style="font-family: sans-serif; padding: 4px;">
            <p style="font-weight: 700; margin: 0 0 2px 0; color: #212121;">${s.businessName}</p>
            <p style="font-size: 11px; color: #878787; margin: 0 0 4px 0;">${s.category} · ★ ${s.rating.toFixed(1)}</p>
            <p style="font-size: 11px; color: #212121; margin: 0 0 4px 0;">${s.address}</p>
            <a href="/shops/${s._id}" style="font-size: 11px; color: #2874f0; font-weight: bold; text-decoration: underline;">View Shop & Products →</a>
          </div>
        `,
        onClick: () => {
          if (onShopSelect) onShopSelect(s);
        },
      });
    }
  });

  return (
    <div className="relative">
      <GoogleMap
        center={center}
        zoom={13}
        markers={markers}
        height={height}
      />
    </div>
  );
}
