'use client';

import React from 'react';
import { GoogleMap, MapMarker } from './GoogleMap';
import { Location } from '@/types/location';
import { PickupStop } from '@/types/routePool';

interface RouteMapProps {
  origin: Location;
  destination: Location;
  pickupStops?: PickupStop[];
  height?: string;
}

export function RouteMap({ origin, destination, pickupStops = [], height = '360px' }: RouteMapProps) {
  const centerLat = (origin.latitude + destination.latitude) / 2;
  const centerLng = (origin.longitude + destination.longitude) / 2;

  const markers: MapMarker[] = [
    {
      id: 'route_origin',
      latitude: origin.latitude,
      longitude: origin.longitude,
      title: `Origin: ${origin.formattedAddress}`,
      label: '🏁 A (Start)',
      color: 'blue',
    },
    {
      id: 'route_destination',
      latitude: destination.latitude,
      longitude: destination.longitude,
      title: `Destination: ${destination.formattedAddress}`,
      label: '🎯 B (End)',
      color: 'red',
    },
  ];

  // Add intermediate pickup stops
  pickupStops.forEach((stop, index) => {
    if (stop.location?.latitude && stop.location?.longitude) {
      markers.push({
        id: `stop_${stop.shopId}_${index}`,
        latitude: stop.location.latitude,
        longitude: stop.location.longitude,
        title: `Stop ${index + 1}: ${stop.shopName} (${stop.packageCount} pkgs)`,
        label: `🏪 #${index + 1}`,
        color: stop.isPickedUp ? 'green' : 'route',
      });
    }
  });

  // Construct sequence of waypoints for the polyline
  const polylinePoints = [
    { lat: origin.latitude, lng: origin.longitude },
    ...pickupStops.map((s) => ({ lat: s.location.latitude, lng: s.location.longitude })),
    { lat: destination.latitude, lng: destination.longitude },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <GoogleMap
        center={{ lat: centerLat, lng: centerLng }}
        zoom={12}
        markers={markers}
        polyline={{ points: polylinePoints, color: '#2874f0' }}
        height={height}
      />
    </div>
  );
}
