'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  label?: string;
  color?: 'brand' | 'route' | 'red' | 'blue' | 'purple';
  infoHtml?: string;
  onClick?: () => void;
}

export interface RoutePolyline {
  points: Array<{ lat: number; lng: number }>;
  color?: string;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  polyline?: RoutePolyline;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  interactive?: boolean;
  className?: string;
  height?: string;
}

export function GoogleMap({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 13,
  markers = [],
  polyline,
  onMapClick,
  interactive = true,
  className = '',
  height = '360px',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!apiKey) {
      setLoadError(true);
      return;
    }

    if (window.google?.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsGoogleLoaded(true));
      script.addEventListener('error', () => setLoadError(true));
    }
  }, [apiKey]);

  // Google Maps Instance
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || !window.google?.maps) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: !interactive,
        zoomControl: interactive,
      });

      if (interactive && onMapClick) {
        mapInstance.addListener('click', (e: any) => {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      }

      // Add Markers
      markers.forEach((m) => {
        const marker = new window.google.maps.Marker({
          position: { lat: m.latitude, lng: m.longitude },
          map: mapInstance,
          title: m.title,
        });

        if (m.infoHtml || m.onClick) {
          marker.addListener('click', () => {
            if (m.onClick) m.onClick();
            if (m.infoHtml) {
              const info = new window.google.maps.InfoWindow({ content: m.infoHtml });
              info.open(mapInstance, marker);
            }
          });
        }
      });

      // Add Polyline
      if (polyline && polyline.points.length > 1) {
        new window.google.maps.Polyline({
          path: polyline.points,
          geodesic: true,
          strokeColor: polyline.color || '#1e6f5e',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map: mapInstance,
        });
      }
    } catch (e) {
      console.warn('Error initializing Google Maps:', e);
      setLoadError(true);
    }
  }, [isGoogleLoaded, center, zoom, markers, polyline, interactive, onMapClick]);

  // Fallback Interactive Canvas / SVG Map representation if Google Maps key is missing or fails
  if (!apiKey || loadError || !isGoogleLoaded) {
    // Compute bounding box for projection
    const allLats = [center.lat, ...markers.map((m) => m.latitude), ...(polyline?.points.map((p) => p.lat) || [])];
    const allLngs = [center.lng, ...markers.map((m) => m.longitude), ...(polyline?.points.map((p) => p.lng) || [])];

    const minLat = Math.min(...allLats) - 0.02;
    const maxLat = Math.max(...allLats) + 0.02;
    const minLng = Math.min(...allLngs) - 0.02;
    const maxLng = Math.max(...allLngs) + 0.02;

    const latSpan = maxLat - minLat || 0.04;
    const lngSpan = maxLng - minLng || 0.04;

    const project = (lat: number, lng: number) => {
      const x = ((lng - minLng) / lngSpan) * 80 + 10;
      const y = ((maxLat - lat) / latSpan) * 70 + 15;
      return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 90) };
    };

    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner ${className}`}
        style={{ height }}
      >
        {/* Map Header Notice */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between rounded-lg bg-white/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <Navigation className="h-3.5 w-3.5 text-brand-600" />
            <span className="font-medium">Geographic Route Viewer</span>
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
              Haversine Engine Active
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Center: {center.lat.toFixed(3)}, {center.lng.toFixed(3)}
          </span>
        </div>

        {/* SVG Coordinate Map Canvas */}
        <svg
          className="h-full w-full cursor-crosshair"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onClick={(e) => {
            if (!interactive || !onMapClick) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 100;
            const clickY = ((e.clientY - rect.top) / rect.height) * 100;
            const clickLng = minLng + ((clickX - 10) / 80) * lngSpan;
            const clickLat = maxLat - ((clickY - 15) / 70) * latSpan;
            onMapClick({
              lat: Math.round(clickLat * 10000) / 10000,
              lng: Math.round(clickLng * 10000) / 10000,
            });
          }}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Polyline Route */}
          {polyline && polyline.points.length > 1 && (
            <polyline
              points={polyline.points
                .map((p) => {
                  const pt = project(p.lat, p.lng);
                  return `${pt.x},${pt.y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#1e6f5e"
              strokeWidth="2.5"
              strokeDasharray="3,2"
            />
          )}

          {/* Central Point */}
          {(() => {
            const p = project(center.lat, center.lng);
            return (
              <circle
                cx={p.x}
                cy={p.y}
                r="3"
                className="fill-brand-500/20 stroke-brand-600"
                strokeWidth="1"
              />
            );
          })()}

          {/* Markers */}
          {markers.map((m) => {
            const pt = project(m.latitude, m.longitude);
            const isSelected = selectedMarker?.id === m.id;
            return (
              <g
                key={m.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker(m);
                  if (m.onClick) m.onClick();
                }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '4' : '3'}
                  className={
                    m.color === 'route'
                      ? 'fill-amber-500 stroke-white'
                      : m.color === 'red'
                      ? 'fill-rose-500 stroke-white'
                      : 'fill-emerald-600 stroke-white'
                  }
                  strokeWidth="1"
                />
                <text
                  x={pt.x}
                  y={pt.y - 4}
                  textAnchor="middle"
                  fontSize="3"
                  className="fill-slate-800 font-semibold"
                >
                  {m.label || m.title.substring(0, 10)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Marker Card */}
        {selectedMarker && (
          <div className="absolute bottom-2 left-2 right-2 z-20 rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{selectedMarker.title}</p>
                <p className="text-[11px] text-slate-500">
                  Lat: {selectedMarker.latitude.toFixed(4)}, Lng: {selectedMarker.longitude.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            </div>
            {selectedMarker.infoHtml && (
              <div
                className="mt-1 text-[11px] text-slate-600"
                dangerouslySetInnerHTML={{ __html: selectedMarker.infoHtml }}
              />
            )}
          </div>
        )}

        {/* Fallback Footer Note */}
        {!apiKey && (
          <div className="absolute bottom-1 right-2 z-10 text-[10px] text-slate-400">
            * Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env to enable satellite/terrain tiles.
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl border border-slate-200 shadow-sm ${className}`}
      style={{ height }}
    />
  );
}
