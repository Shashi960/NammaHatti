'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Car,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  CheckCircle,
  Truck,
  Users,
  ChevronRight,
  Star,
  Flame,
  Tag,
  Zap,
  Download,
  Percent,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/Badge';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { ShopMap } from '@/components/maps/ShopMap';

export default function HomePage() {
  const { currentLocation } = useLocation();
  const { addItem } = useCart();
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.categories) setCategories(catData.categories);

        // Load Nearby Shops based on location
        const shopRes = await fetch(
          `/api/shops?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=30`
        );
        const shopData = await shopRes.json();
        if (shopData.shops) setNearbyShops(shopData.shops.slice(0, 8));

        // Load Deals & Products
        const prodRes = await fetch(
          `/api/products?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&limit=12`
        );
        const prodData = await prodRes.json();
        if (prodData.products) setDeals(prodData.products);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentLocation]);

  // Promotional Banner Slides
  const banners = [
    {
      id: 1,
      tag: 'ROUTE POOL FESTIVAL',
      title: 'Local Products. 0 Dark Store Markup.',
      subtitle: 'Delivered by daily commuters travelling along your route.',
      cta: 'Shop Nearby Deals',
      link: '/search',
      bg: 'from-[#1a5dc7] via-[#2874f0] to-[#0e3b82]',
      accentColor: 'text-amber-300',
    },
    {
      id: 2,
      tag: 'DAILY COMMUTER EARNINGS',
      title: 'Earn ₹300 - ₹800 Daily on Your Route',
      subtitle: 'Pick up 2–4 verified packages along your journey and earn effortlessly.',
      cta: 'Register as Commuter',
      link: '/traveller',
      bg: 'from-[#d94b07] via-[#fb641b] to-[#ff9f00]',
      accentColor: 'text-white',
    },
    {
      id: 3,
      tag: '100% VERIFIED NEIGHBOURHOOD SHOPS',
      title: 'Support Your Real Local Retailers',
      subtitle: 'Hardware, bakeries, electricals & organics with authentic store receipts.',
      cta: 'Explore Verified Shops',
      link: '/shops',
      bg: 'from-[#19584c] via-[#2874f0] to-[#14489b]',
      accentColor: 'text-emerald-300',
    },
  ];

  // Auto-rotate hero banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: product._id,
        shopId: product.shopId,
        shopName: product.shopName || 'Local Shop',
        name: product.name,
        price: product.discountPrice || product.price,
        unit: product.unit || 'piece',
        weightKg: product.weightKg || 0.5,
        imageUrl: product.images?.[0] || '/placeholder-product.svg',
      },
      1
    );
    setAddedItem(product._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4]">
      
      {/* 1. Mobile App Install / PWA Top Strip */}
      {showPwaBanner && (
        <div className="md:hidden bg-gradient-to-r from-blue-900 to-[#2874f0] text-white px-3 py-2 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-400 text-slate-900 font-black text-xs shadow">
              LM
            </div>
            <div>
              <p className="font-bold leading-tight">LocalMesh Mobile App</p>
              <p className="text-[10px] text-blue-200">Faster orders & live route tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('To install: Tap your browser menu and choose "Add to Home screen"')}
              className="bg-[#ff9f00] text-slate-900 px-2.5 py-1 rounded text-[11px] font-bold shadow hover:bg-amber-400"
            >
              Get App
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="text-blue-200 hover:text-white text-base px-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 2. Flipkart-Style Horizontal Category Scroller */}
      <section className="bg-white border-b border-slate-200/80 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-2 py-3 flex items-center space-x-4 sm:space-x-8 sm:justify-center">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${encodeURIComponent(cat.slug)}`}
              className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[80px] group text-center shrink-0"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2874f0] shadow-sm group-hover:scale-105 group-hover:bg-[#2874f0] group-hover:text-white transition-all">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 transition-transform" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#212121] group-hover:text-[#2874f0] mt-1.5 line-clamp-1">
                {cat.name.split(' ')[0]}
              </span>
            </Link>
          ))}
          <Link
            href="/shops"
            className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[80px] group text-center shrink-0"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#ff9f00] shadow-sm group-hover:scale-105 group-hover:bg-[#ff9f00] group-hover:text-white transition-all">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#212121] group-hover:text-[#ff9f00] mt-1.5 line-clamp-1">
              All Shops
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Hero Promotional Banner Carousel */}
      <section className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="relative overflow-hidden rounded-md sm:rounded-lg shadow-md">
          <div
            className={`bg-gradient-to-r ${banners[activeBanner].bg} text-white p-5 sm:p-10 transition-all duration-700 min-h-[170px] sm:min-h-[220px] flex flex-col justify-center`}
          >
            <div className="max-w-xl">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-extrabold uppercase tracking-wider bg-black/20 ${banners[activeBanner].accentColor} mb-2`}>
                ⚡ {banners[activeBanner].tag}
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug drop-shadow-sm">
                {banners[activeBanner].title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-100 mt-1 sm:mt-2 line-clamp-2 max-w-lg">
                {banners[activeBanner].subtitle}
              </p>
              <div className="mt-3.5 sm:mt-5 flex items-center space-x-3">
                <Link
                  href={banners[activeBanner].link}
                  className="bg-[#ff9f00] hover:bg-amber-400 text-slate-900 text-xs sm:text-sm font-bold px-4 py-2 rounded-sm shadow-md transition-transform active:scale-95 inline-flex items-center space-x-1"
                >
                  <span>{banners[activeBanner].cta}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="absolute bottom-2 right-4 flex space-x-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeBanner === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flipkart-Style "Deal of the Day" Horizontal Product Scroller */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 mb-4">
        <div className="bg-white rounded-md shadow-sm border border-slate-200/80 p-3 sm:p-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-amber-50 text-[#ff9f00]">
                <Flame className="h-5 w-5 fill-[#ff9f00]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#212121]">Deal of the Day</h2>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>Ends in <strong className="text-[#388e3c]">04h : 32m : 18s</strong></span>
                </div>
              </div>
            </div>
            <Link
              href="/search"
              className="bg-[#2874f0] text-white text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-blue-700 shadow-sm"
            >
              VIEW ALL
            </Link>
          </div>

          {/* Horizontal Product Cards Row */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pt-1">
            {deals.map((prod) => {
              const originalPrice = Math.round(prod.price * 1.35);
              const discountPercent = Math.round(((originalPrice - prod.price) / originalPrice) * 100);

              return (
                <div
                  key={prod._id}
                  className="min-w-[155px] max-w-[155px] sm:min-w-[200px] sm:max-w-[200px] rounded border border-slate-200/70 p-2 sm:p-3 flex flex-col justify-between hover:shadow-md transition-shadow bg-white shrink-0 group"
                >
                  <Link href={`/products/${prod._id}`} className="block">
                    {/* Product Image */}
                    <div className="h-32 sm:h-40 w-full rounded bg-slate-50 flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                      <img
                        src={prod.images?.[0] || '/placeholder-product.svg'}
                        alt={prod.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 left-1 bg-[#388e3c] text-white text-[9px] font-bold px-1 py-0.5 rounded">
                        {discountPercent}% off
                      </span>
                    </div>

                    {/* Shop Brand Title */}
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold truncate">
                      {prod.shopName}
                    </p>

                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm font-semibold text-[#212121] line-clamp-1 mt-0.5 group-hover:text-[#2874f0]">
                      {prod.name}
                    </h3>

                    {/* Star Rating Badge (Flipkart Style) */}
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className="inline-flex items-center space-x-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        <span>4.3</span>
                        <Star className="h-2.5 w-2.5 fill-white" />
                      </span>
                      <span className="text-[10px] text-slate-400">(42)</span>
                    </div>

                    {/* Pricing */}
                    <div className="mt-1.5 flex items-baseline space-x-1.5">
                      <span className="text-sm sm:text-base font-bold text-[#212121]">
                        ₹{prod.price}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{originalPrice}
                      </span>
                    </div>

                    {/* Route Pool Tag */}
                    <div className="mt-1 text-[10px] text-[#2874f0] font-medium flex items-center space-x-1">
                      <Zap className="h-2.5 w-2.5 fill-[#2874f0]" />
                      <span>Route Delivery</span>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleQuickAdd(prod, e)}
                    className="mt-2 w-full bg-[#ff9f00] hover:bg-amber-400 text-slate-900 font-bold text-xs py-1.5 rounded-sm transition-colors shadow-sm active:scale-95"
                  >
                    {addedItem === prod._id ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Top Local Shops Near You */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 mb-4">
        <div className="bg-white rounded-md shadow-sm border border-slate-200/80 p-3 sm:p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">
                Verified Neighbourhood Merchants
              </h2>
              <p className="text-xs text-slate-500">
                Near {currentLocation.city || 'your area'} · Real neighbourhood inventory
              </p>
            </div>
            <Link
              href="/shops"
              className="text-xs font-bold text-[#2874f0] hover:underline"
            >
              See All Shops →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nearbyShops.map((shop) => (
              <Link
                key={shop._id}
                href={`/shops/${shop._id}`}
                className="rounded border border-slate-200/80 p-3 hover:border-[#2874f0] hover:shadow-md transition-all group flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#212121] group-hover:text-[#2874f0] line-clamp-1">
                        {shop.businessName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{shop.category}</p>
                    </div>
                    {shop.verificationStatus === 'VERIFIED' && (
                      <span className="bg-emerald-50 text-[#388e3c] border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                        <CheckCircle className="h-2.5 w-2.5 fill-[#388e3c] text-white" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 mt-2 flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{shop.address || shop.location?.formattedAddress}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    {shop.distanceKm !== undefined ? `📍 ${shop.distanceKm.toFixed(1)} km away` : 'Nearby'}
                  </span>
                  <span className="font-bold text-[#2874f0] group-hover:translate-x-0.5 transition-transform">
                    Visit Shop →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why LocalMesh Route Pooling (The Core Value Proposition) */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 mb-6">
        <div className="bg-gradient-to-r from-blue-900 to-[#1a5dc7] rounded-md sm:rounded-lg p-5 sm:p-6 text-white shadow-sm">
          <div className="max-w-3xl mb-4">
            <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">
              Smart Sustainable Logistics
            </span>
            <h2 className="text-lg sm:text-2xl font-black mt-1">
              How LocalMesh Route Pooling Works
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              We never hire dedicated riders to criss-cross the city for single packs. We pool compatible orders along regular commuter journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/10">
              <div className="h-8 w-8 rounded bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <h3 className="font-bold text-sm text-white">Neighbourhood First</h3>
              <p className="text-xs text-blue-100 mt-1">
                Order from local corner stores, bakeries, and tool marts at true local prices without 30% aggregator markups.
              </p>
            </div>

            <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/10">
              <div className="h-8 w-8 rounded bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <h3 className="font-bold text-sm text-white">Commuters Deliver</h3>
              <p className="text-xs text-blue-100 mt-1">
                Verified travellers heading in your direction pick up and drop off orders, earning fair rewards on their existing commute.
              </p>
            </div>

            <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/10">
              <div className="h-8 w-8 rounded bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <h3 className="font-bold text-sm text-white">Secure 6-Digit OTP</h3>
              <p className="text-xs text-blue-100 mt-1">
                Packages are only marked complete when you provide your confidential 6-digit Delivery OTP directly to the commuter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive Map Explorer */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 mb-8">
        <div className="bg-white rounded-md shadow-sm border border-slate-200/80 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#212121]">
                Geographic Shop Map
              </h2>
              <p className="text-xs text-slate-500">
                Explore local shops positioned around {currentLocation.city || 'your area'}
              </p>
            </div>
            <Link
              href="/shops"
              className="bg-blue-50 text-[#2874f0] border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-blue-100"
            >
              Full Map View
            </Link>
          </div>
          <div className="h-64 sm:h-80 rounded overflow-hidden border border-slate-200">
            <ShopMap shops={nearbyShops} height="100%" />
          </div>
        </div>
      </section>

    </div>
  );
}
