import React from 'react';
import Link from 'next/link';
import { Store, Car, Shield, Heart, MapPin } from 'lucide-react';

export function Footer() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white text-sm">
                LM
              </div>
              <span className="text-xl font-bold tracking-tight text-white">{brandName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your local shops, connected. Route-pooled delivery linking local merchants, travellers, and customers without predatory margins.
            </p>
            <div className="text-[11px] text-slate-500">
              Deterministic route-pooling · Dynamic geography
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              For Customers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shops" className="hover:text-white transition-colors">
                  Explore Nearby Shops
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search Products
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Order Tracking & OTP
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center & Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>

          {/* For Shops & Businesses */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              For Merchants
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register?role=SHOP" className="hover:text-white transition-colors">
                  Register Your Business
                </Link>
              </li>
              <li>
                <Link href="/shop/dashboard" className="hover:text-white transition-colors">
                  Merchant Portal
                </Link>
              </li>
              <li>
                <Link href="/docs/business-model" className="hover:text-white transition-colors">
                  Transparent Pricing & Fees
                </Link>
              </li>
            </ul>
          </div>

          {/* For Travellers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Route Pooling
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/traveller" className="hover:text-white transition-colors">
                  Travel & Earn on Existing Journeys
                </Link>
              </li>
              <li>
                <Link href="/traveller/verification" className="hover:text-white transition-colors">
                  KYC & Locality Verification
                </Link>
              </li>
              <li>
                <Link href="/traveller/trips/new" className="hover:text-white transition-colors">
                  Declare a Route Trip
                </Link>
              </li>
              <li>
                <Link href="/docs/route-matching" className="hover:text-white transition-colors">
                  How Route Matching Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {brandName}. Geographically Dynamic Local Commerce Platform.</p>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-400">Privacy & KYC Policy</Link>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">Admin Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
