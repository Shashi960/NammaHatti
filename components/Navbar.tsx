'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import {
  MapPin,
  ShoppingBag,
  User,
  Compass,
  Store,
  Car,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Search,
  Sparkles,
} from 'lucide-react';
import { LocationPicker } from '@/components/maps/LocationPicker';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentLocation, setCurrentLocation } = useLocation();
  const { totalItems } = useCart();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const getDashboardHref = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SHOP':
        return '/shop/dashboard';
      case 'TRAVELLER':
        return '/traveller/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0f766e] text-white shadow-md">
        {/* Main Header Container */}
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* 1. Brand Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex flex-col leading-none group">
                <div className="flex items-center space-x-1">
                  <span className="text-xl sm:text-2xl font-black italic tracking-tight text-white drop-shadow-sm">
                    {brandName}
                  </span>
                </div>
                <div className="flex items-center space-x-0.5 text-[10px] text-teal-200 font-semibold tracking-wider">
                  <span>Local</span>
                  <span className="text-white font-bold">RouteMesh</span>
                  <Sparkles className="h-2.5 w-2.5 text-emerald-300 inline fill-emerald-300" />
                </div>
              </Link>
            </div>

            {/* 2. Desktop Search Bar (Rounded Pill Style) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for local shops, fresh bakery, electronics, grocery..."
                  className="w-full rounded-full bg-white py-2.5 pl-5 pr-11 text-sm text-[#0f172a] placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 border border-teal-600/30"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1 top-1 bottom-1 px-3.5 flex items-center justify-center rounded-full text-[#0f766e] hover:bg-teal-50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* 3. Location Selector Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden lg:flex items-center space-x-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors border border-white/20"
              title="Change Delivery Location"
            >
              <MapPin className="h-3.5 w-3.5 text-teal-200 shrink-0" />
              <div className="text-left leading-tight max-w-[150px] truncate">
                <span className="block text-[10px] text-teal-200 uppercase tracking-wider font-semibold">Deliver to</span>
                <span className="truncate block font-bold">
                  {currentLocation.city || 'Select Area'} {currentLocation.postalCode ? `(${currentLocation.postalCode})` : ''}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-white/70 ml-0.5" />
            </button>

            {/* 4. Desktop Right Action Items */}
            <div className="hidden md:flex items-center space-x-4">
              
              {/* Route Commute Portal */}
              <Link
                href="/traveller"
                className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-[#ea580c] text-white hover:bg-orange-700 transition-colors shadow-sm"
              >
                <Car className="h-3.5 w-3.5 text-white" />
                <span>Earn on Commute</span>
              </Link>

              {/* Explore Shops */}
              <Link
                href="/shops"
                className="flex items-center space-x-1 text-xs font-medium text-white hover:text-amber-200 transition-colors py-1.5"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Shops</span>
              </Link>

              {/* User Dropdown / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-1.5 bg-white text-[#0f766e] px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-teal-50 transition-colors"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="h-3 w-3 text-[#0f766e]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5 z-50 text-slate-800">
                      <div className="border-b border-slate-100 px-4 py-2.5 bg-slate-50">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0f766e]">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        href={getDashboardHref()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-slate-50 text-slate-700"
                      >
                        <Shield className="h-3.5 w-3.5 text-[#0f766e]" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        href="/customer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-slate-50 text-slate-700"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-teal-600" />
                        <span>Orders & Deliveries</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-white text-[#0f766e] px-5 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-teal-50 transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center space-x-1.5 text-xs font-bold text-white hover:text-teal-200 transition-colors py-1.5"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </Link>
            </div>

            {/* Mobile Header Right Icons */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setShowLocationModal(true)}
                className="p-1 text-white hover:text-teal-200"
                title="Change Location"
              >
                <MapPin className="h-5 w-5" />
              </button>

              <Link href="/cart" className="relative p-1 text-white" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-white hover:text-teal-200"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Row (Rounded Pill) */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for local shops, grocery, tools..."
                className="w-full rounded-full bg-white py-2 pl-4 pr-10 text-xs text-[#0f172a] placeholder-slate-400 shadow-inner focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Submit Search"
                className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#0f766e]"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Mobile Current Location Sub-bar */}
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-teal-100 md:hidden border-t border-teal-700/40 pt-1">
            <div className="flex items-center space-x-1 truncate max-w-[280px]">
              <MapPin className="h-3 w-3 text-teal-200 shrink-0" />
              <span className="truncate">
                Delivering to: <strong className="text-white">{currentLocation.city || 'Your Area'}</strong> {currentLocation.postalCode ? `(${currentLocation.postalCode})` : ''}
              </span>
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="text-teal-200 font-bold shrink-0 ml-2 hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-teal-700/40 bg-[#115e59] px-4 py-3 space-y-3 shadow-lg">
            {user ? (
              <div className="pb-2 border-b border-blue-400/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-blue-200">{user.email}</p>
                </div>
                <span className="rounded bg-amber-400 text-slate-900 px-2 py-0.5 text-[10px] font-bold">
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="pb-2 border-b border-blue-400/30">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-white text-[#2874f0] font-bold py-2 rounded text-xs shadow"
                >
                  Sign In / Register
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <Store className="h-4 w-4 text-amber-300" />
                <span>Explore Shops</span>
              </Link>
              <Link
                href="/traveller"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <Car className="h-4 w-4 text-amber-300" />
                <span>Commute & Earn</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <Compass className="h-4 w-4 text-blue-200" />
                <span>24x7 Help Center</span>
              </Link>
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <Shield className="h-4 w-4 text-blue-200" />
                <span>Dashboard</span>
              </Link>
            </div>

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center space-x-1.5 text-xs text-rose-200 hover:text-white pt-2 border-t border-blue-400/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Geolocation / Address Modal */}
      {showLocationModal && (
        <LocationPicker
          initialLocation={currentLocation}
          title="Select Delivery Address"
          onConfirm={(loc) => {
            setCurrentLocation(loc);
            setShowLocationModal(false);
          }}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </>
  );
}
