'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Location, createLocation } from '@/types/location';

interface PlaceAutocompleteProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export function PlaceAutocomplete({
  onLocationSelect,
  placeholder = 'Search address, locality, area or landmark...',
  initialValue = '',
  className = '',
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/locations/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: query }),
        });
        const data = await res.json();
        if (data.success && data.locations) {
          setSuggestions(data.locations);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: Location) => {
    setQuery(loc.formattedAddress);
    setIsOpen(false);
    onLocationSelect(loc);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-10 text-sm placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-brand-600" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {suggestions.map((sug, idx) => (
            <li
              key={sug.locationId || idx}
              onClick={() => handleSelect(sug)}
              className="flex cursor-pointer items-start px-3 py-2.5 text-slate-700 hover:bg-brand-50 hover:text-brand-900 transition-colors"
            >
              <MapPin className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-xs text-slate-900">{sug.formattedAddress}</p>
                <p className="text-[11px] text-slate-500">
                  {sug.city} {sug.district ? `· ${sug.district}` : ''} {sug.postalCode ? `· ${sug.postalCode}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
