'use client';

import React from 'react';
import { GoogleMap, MapMarker } from './GoogleMap';
import { Location } from '@/types/location';

interface DeliveryMapProps {
  shopLocation: Location;
  deliveryLocation: Location;
  height?: string;
}

export function DeliveryMap({ shopLocation, deliveryLocation, height = '320px' }: DeliveryMapProps) {
  const centerLat = (shopLocation.latitude + deliveryLocation.latitude) / 2;
  const centerLng = (shopLocation.longitude + deliveryLocation.longitude) / 2;

  const markers: MapMarker[] = [
    {
      id: 'pickup_shop',
      latitude: shopLocation.latitude,
      longitude: shopLocation.longitude,
      title: `Pickup: ${shopLocation.formattedAddress}`,
      label: '🏪 SHOP',
      color: 'green',
    },
    {
      id: 'drop_location',
      latitude: deliveryLocation.latitude,
      longitude: deliveryLocation.longitude,
      title: `Delivery: ${deliveryLocation.formattedAddress}`,
      label: '🏠 YOU',
      color: 'blue',
    },
  ];

  const polylinePoints = [
    { lat: shopLocation.latitude, lng: shopLocation.longitude },
    { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <GoogleMap
        center={{ lat: centerLat, lng: centerLng }}
        zoom={13}
        markers={markers}
        polyline={{ points: polylinePoints, color: '#0f766e' }}
        height={height}
      />
    </div>
  );
}
