'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { LocationPicker } from '@/components/maps/LocationPicker';

export function Navbar() {
  const { user, logout } = useAuth();
  const { currentLocation, setCurrentLocation } = useLocation();
  const { totalItems } = useCart();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Brand + Location */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-sm font-bold text-lg">
                LM
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {brandName}
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                  Local · Route First
                </span>
              </div>
            </Link>

            {/* Location Selector Button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:border-brand-400 hover:bg-white transition-all max-w-[220px]"
            >
              <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
              <div className="truncate text-left">
                <span className="block font-semibold text-slate-900 leading-tight">
                  {currentLocation.city || 'Select Area'}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {currentLocation.formattedAddress}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
            </button>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link href="/shops" className="hover:text-brand-600 transition-colors flex items-center space-x-1">
              <Store className="h-4 w-4" />
              <span>Explore Shops</span>
            </Link>
            <Link href="/search" className="hover:text-brand-600 transition-colors flex items-center space-x-1">
              <Compass className="h-4 w-4" />
              <span>Products</span>
            </Link>
            <Link href="/traveller" className="hover:text-brand-600 transition-colors flex items-center space-x-1 text-route-700 font-semibold bg-route-50 px-2.5 py-1 rounded-md border border-route-200">
              <Car className="h-4 w-4 text-route-600" />
              <span>Travel & Earn</span>
            </Link>
          </nav>

          {/* Right: Cart + User Action */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications (if logged in) */}
            {user && (
              <Link
                href="/notifications"
                className="relative flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
              </Link>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-xl z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <User className="h-4 w-4 text-brand-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">My Orders</span>
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Subheader Location bar */}
        <div className="md:hidden border-t border-slate-100 bg-slate-50/80 px-4 py-1.5 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center space-x-1.5 text-slate-700 truncate"
          >
            <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold text-slate-900">{currentLocation.city || 'Set Area'}:</span>
            <span className="truncate text-slate-500">{currentLocation.formattedAddress}</span>
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm">
            <Link
              href="/shops"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Shops
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Search Products
            </Link>
            <Link
              href="/traveller"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 font-medium text-route-700 bg-route-50"
            >
              Travel & Earn (Route Pooling)
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Track Orders
            </Link>
          </div>
        )}
      </header>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-bold text-slate-900">Change Delivery & Shopping Area</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <LocationPicker
                initialLocation={currentLocation}
                onConfirm={(newLoc) => {
                  setCurrentLocation(newLoc);
                  setShowLocationModal(false);
                }}
                title="Pinpoint your current location"
                confirmButtonText="Save & Set Active Location"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
