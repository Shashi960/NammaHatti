'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Home, Search, Car, ShoppingBag, User, Bell } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems } = useCart();

  const getAccountHref = () => {
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

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Categories',
      href: '/search',
      icon: Search,
      isActive: pathname === '/search' || pathname === '/shops',
    },
    {
      label: 'Route Pool',
      href: user?.role === 'TRAVELLER' ? '/traveller/dashboard' : '/traveller',
      icon: Car,
      isActive: pathname.startsWith('/traveller'),
      highlight: true,
    },
    {
      label: 'Alerts',
      href: '/notifications',
      icon: Bell,
      isActive: pathname === '/notifications',
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      isActive: pathname === '/cart',
      badge: totalItems,
    },
    {
      label: user ? 'Account' : 'Sign In',
      href: getAccountHref(),
      icon: User,
      isActive: pathname.includes('/dashboard') || pathname === '/login',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                active ? 'text-[#2874f0] font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.highlight ? (
                  <div className={`p-1 rounded-full ${active ? 'bg-amber-100 text-[#ff9f00]' : 'text-[#ff9f00]'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#fb641b] px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
