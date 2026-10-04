'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { Shop } from '@/types/shop';
import { ShopMap } from '@/components/maps/ShopMap';
import { Badge } from '@/components/ui/Badge';
import { Search, MapPin, Grid, Map, Filter, Store, Star } from 'lucide-react';

export default function ShopsDiscoveryPage() {
  const { currentLocation } = useLocation();
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.categories) setCategories(catData.categories);

        // Fetch Shops
        let url = `/api/shops?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=30`;
        if (selectedCategory !== 'all') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.shops) {
          setShops(data.shops);
        }
      } catch (err) {
        console.error('Failed to load shops:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentLocation, selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Local Shop Discovery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover verified brick-and-mortar merchants near <span className="font-semibold text-slate-800">{currentLocation.city}</span>
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'split' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'list' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>List Only</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'map' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops by name, category, or address..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Layout */}
      {viewMode === 'map' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <ShopMap
            shops={shops}
            userLocation={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            height="600px"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Shop List */}
          <div className={viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Showing {shops.length} verified businesses</span>
              </div>

              {shops.map((shop) => (
                <div
                  key={shop._id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {shop.category}
                      </span>
                      {shop.verificationStatus === 'VERIFIED' && (
                        <Badge type="verified-shop" />
                      )}
                      {shop.distanceKm !== null && (
                        <span className="text-xs text-slate-500 flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{shop.distanceKm.toFixed(1)} km away</span>
                        </span>
                      )}
                    </div>

                    <Link href={`/shops/${shop._id}`}>
                      <h2 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors">
                        {shop.businessName}
                      </h2>
                    </Link>

                    <p className="text-xs text-slate-600">{shop.address}</p>

                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1 text-amber-600 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{shop.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({shop.reviewCount || 0} reviews)</span>
                      </span>
                      <span>·</span>
                      <span>Hours: {shop.openingTime} - {shop.closingTime}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">{shop.productCount || 0} Products in Stock</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <Link
                      href={`/shops/${shop._id}`}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors whitespace-nowrap text-center w-full"
                    >
                      View Shop & Menu
                    </Link>
                  </div>
                </div>
              ))}

              {shops.length === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                  <Store className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-800">No shops found matching your filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try expanding search radius or choosing all categories</p>
                </div>
              )}
            </div>
          </div>

          {/* Map View (Split Mode) */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-5 sticky top-20 self-start">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Interactive Map View</span>
                  <span className="text-[11px] text-brand-700">Click pins to inspect</span>
                </div>
                <ShopMap
                  shops={shops}
                  userLocation={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  height="550px"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
