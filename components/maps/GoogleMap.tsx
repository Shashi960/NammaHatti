'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, Plus, Minus, RotateCcw, Info } from 'lucide-react';

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
  color?: 'brand' | 'route' | 'red' | 'blue' | 'purple' | 'green' | 'teal';
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
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Google Maps SDK Loader
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

  // Google Maps Instance initialization & updates
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || !window.google?.maps) return;

    try {
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          streetViewControl: false,
          mapTypeControl: false,
        });

        if (interactive && onMapClick) {
          map.addListener('click', (e: any) => {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          });
        }

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }

      // Update Markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      markers.forEach((m) => {
        const marker = new window.google.maps.Marker({
          position: { lat: m.latitude, lng: m.longitude },
          map: mapInstanceRef.current,
          title: m.title,
        });

        if (m.infoHtml || m.onClick) {
          marker.addListener('click', () => {
            if (m.onClick) m.onClick();
            if (m.infoHtml) {
              const info = new window.google.maps.InfoWindow({ content: m.infoHtml });
              info.open(mapInstanceRef.current, marker);
            }
          });
        }

        markersRef.current.push(marker);
      });

      // Update Polyline
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      if (polyline && polyline.points.length > 1) {
        polylineRef.current = new window.google.maps.Polyline({
          path: polyline.points,
          geodesic: true,
          strokeColor: polyline.color || '#0f766e',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map: mapInstanceRef.current,
        });
      }
    } catch (e) {
      console.warn('Error configuring Google Maps instance:', e);
      setLoadError(true);
    }
  }, [isGoogleLoaded, center.lat, center.lng, zoom, markers, polyline, interactive, onMapClick]);

  // Compute projection box for Fallback Interactive SVG Map
  const { minLat, maxLat, minLng, maxLng, latSpan, lngSpan } = useMemo(() => {
    const allLats = [center.lat, ...markers.map((m) => m.latitude), ...(polyline?.points.map((p) => p.lat) || [])];
    const allLngs = [center.lng, ...markers.map((m) => m.longitude), ...(polyline?.points.map((p) => p.lng) || [])];

    const baseMinLat = Math.min(...allLats) - 0.02 / zoomScale;
    const baseMaxLat = Math.max(...allLats) + 0.02 / zoomScale;
    const baseMinLng = Math.min(...allLngs) - 0.02 / zoomScale;
    const baseMaxLng = Math.max(...allLngs) + 0.02 / zoomScale;

    const spanLat = baseMaxLat - baseMinLat || 0.04;
    const spanLng = baseMaxLng - baseMinLng || 0.04;

    return {
      minLat: baseMinLat,
      maxLat: baseMaxLat,
      minLng: baseMinLng,
      maxLng: baseMaxLng,
      latSpan: spanLat,
      lngSpan: spanLng,
    };
  }, [center.lat, center.lng, markers, polyline, zoomScale]);

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / lngSpan) * 80 + 10;
    const y = ((maxLat - lat) / latSpan) * 70 + 15;
    return { x: Math.min(Math.max(x, 4), 96), y: Math.min(Math.max(y, 4), 94) };
  };

  // If Google Maps is not active or key is missing, render the High-Fidelity SVG Interactive Map
  if (!apiKey || loadError || !isGoogleLoaded) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-200 bg-[#e8ecef] shadow-inner select-none ${className}`}
        style={{ height }}
      >
        {/* Top Control & Status Bar */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between rounded-lg bg-white/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <Navigation className="h-3.5 w-3.5 text-[#0f766e]" />
            <span className="font-semibold text-[#212121]">Interactive Map</span>
            <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-[#0f766e]">
              Active
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="absolute right-2 top-12 z-10 flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(prev * 1.3, 3))}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 shadow-md hover:bg-slate-50 border border-slate-200"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(prev / 1.3, 0.5))}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 shadow-md hover:bg-slate-50 border border-slate-200"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          {zoomScale !== 1 && (
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 shadow-md hover:bg-slate-50 border border-slate-200"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Click hint overlay for interactive mode */}
        {interactive && onMapClick && (
          <div className="absolute bottom-2 left-2 z-10 rounded bg-slate-900/75 px-2 py-1 text-[10px] text-white shadow pointer-events-none">
            📍 Tap anywhere on map to drop or move pin
          </div>
        )}

        {/* SVG Map Canvas */}
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
          {/* Street & Grid Layout Pattern */}
          <defs>
            <pattern id="street-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#f4f6f8" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d5dbdb" strokeWidth="0.8" />
              <line x1="0" y1="10" x2="20" y2="10" stroke="#e8ecef" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="10" y1="0" x2="10" y2="20" stroke="#e8ecef" strokeWidth="0.5" strokeDasharray="1,1" />
            </pattern>
            {/* Filter for marker dropshadow */}
            <filter id="marker-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.3" />
            </filter>
          </defs>

          <rect width="100" height="100" fill="url(#street-grid)" />

          {/* Major simulated road arteries for realistic map look */}
          <path d="M 0 35 Q 40 45 100 30" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M 0 35 Q 40 45 100 30" fill="none" stroke="#fbc531" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
          <path d="M 25 0 Q 30 50 35 100" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M 25 0 Q 30 50 35 100" fill="none" stroke="#fbc531" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
          <path d="M 70 0 L 65 100" fill="none" stroke="#ffffff" strokeWidth="2" />

          {/* Polyline Route */}
          {polyline && polyline.points.length > 1 && (
            <>
              {/* Outer glow */}
              <polyline
                points={polyline.points
                  .map((p) => {
                    const pt = project(p.lat, p.lng);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#0f766e"
                strokeWidth="4"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Core polyline */}
              <polyline
                points={polyline.points
                  .map((p) => {
                    const pt = project(p.lat, p.lng);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={polyline.color || '#0f766e'}
                strokeWidth="2.2"
                strokeDasharray="3,1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Central Point Radar / Pulse */}
          {(() => {
            const p = project(center.lat, center.lng);
            return (
              <g transform={`translate(${p.x}, ${p.y})`}>
                <circle r="4.5" className="fill-[#0f766e]/20 animate-ping" />
                <circle r="2.5" className="fill-[#0f766e] stroke-white" strokeWidth="0.8" />
              </g>
            );
          })()}

          {/* Markers */}
          {markers.map((m) => {
            const pt = project(m.latitude, m.longitude);
            const isSelected = selectedMarker?.id === m.id;

            let fillColor = '#0f766e'; // Default Forest Teal
            if (m.color === 'route') fillColor = '#ea580c'; // Transit Amber
            if (m.color === 'red') fillColor = '#e11d48'; // Vibrant Coral
            if (m.color === 'green' || m.color === 'brand') fillColor = '#059669'; // Emerald
            if (m.color === 'blue' || m.color === 'teal') fillColor = '#0f766e';

            return (
              <g
                key={m.id}
                className="cursor-pointer transition-transform hover:scale-125"
                filter="url(#marker-shadow)"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker(m);
                  if (m.onClick) m.onClick();
                }}
              >
                {/* Pin pinhead */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '4.5' : '3.5'}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* Inner white dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="1.2"
                  fill="#ffffff"
                />
                {/* Pin Label */}
                <rect
                  x={pt.x - 9}
                  y={pt.y - 7.5}
                  width="18"
                  height="4"
                  rx="1"
                  fill="#ffffff"
                  stroke="#e0e0e0"
                  strokeWidth="0.4"
                />
                <text
                  x={pt.x}
                  y={pt.y - 4.6}
                  textAnchor="middle"
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="#212121"
                >
                  {m.label || m.title.substring(0, 8)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Marker Card */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 z-30 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-[#212121]">{selectedMarker.title}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Coordinates: {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            {selectedMarker.infoHtml && (
              <div
                className="mt-1.5 border-t border-slate-100 pt-1.5 text-[11px] text-slate-600"
                dangerouslySetInnerHTML={{ __html: selectedMarker.infoHtml }}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
