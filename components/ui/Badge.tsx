import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export type BadgeType =
  | 'verified-shop'
  | 'verified-traveller'
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'open-now'
  | 'closed'
  | 'nearby'
  | 'standard'
  | 'express'
  | 'pending'
  | 'ready-for-pickup'
  | 'route-matching'
  | 'traveller-assigned'
  | 'picked-up'
  | 'out-for-delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

interface BadgeProps {
  type: BadgeType;
  customLabel?: string;
  className?: string;
}

export function Badge({ type, customLabel, className = '' }: BadgeProps) {
  switch (type) {
    case 'verified-shop':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 ${className}`}>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{customLabel || '✓ Verified Shop'}</span>
        </span>
      );

    case 'verified-traveller':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200 ${className}`}>
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          <span>{customLabel || '✓ Verified Traveller'}</span>
        </span>
      );

    case 'in-stock':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span>{customLabel || 'In Stock'}</span>
        </span>
      );

    case 'low-stock':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 ${className}`}>
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          <span>{customLabel || 'Low Stock'}</span>
        </span>
      );

    case 'out-of-stock':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200 ${className}`}>
          <XCircle className="h-3 w-3 text-rose-500" />
          <span>{customLabel || 'Out of Stock'}</span>
        </span>
      );

    case 'open-now':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 ${className}`}>
          <Clock className="h-3 w-3 text-emerald-600" />
          <span>{customLabel || 'Open Now'}</span>
        </span>
      );

    case 'closed':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200 ${className}`}>
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{customLabel || 'Closed'}</span>
        </span>
      );

    case 'nearby':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-800 border border-cyan-200 ${className}`}>
          <MapPin className="h-3 w-3 text-cyan-600" />
          <span>{customLabel || 'Nearby'}</span>
        </span>
      );

    case 'standard':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 border border-slate-200 ${className}`}>
          {customLabel || 'Standard Delivery'}
        </span>
      );

    case 'express':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300 ${className}`}>
          <Sparkles className="h-3 w-3 text-amber-600" />
          <span>{customLabel || '⚡ Express'}</span>
        </span>
      );

    case 'ready-for-pickup':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200 ${className}`}>
          Ready for Pickup
        </span>
      );

    case 'route-matching':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-800 border border-purple-200 ${className}`}>
          Route Matching
        </span>
      );

    case 'traveller-assigned':
      return (
        <span className={`inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-800 border border-cyan-200 ${className}`}>
          Traveller Assigned
        </span>
      );

    case 'picked-up':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800 border border-sky-200 ${className}`}>
          Picked Up
        </span>
      );

    case 'out-for-delivery':
      return (
        <span className={`inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 border border-teal-200 ${className}`}>
          Out for Delivery
        </span>
      );

    case 'delivered':
    case 'completed':
      return (
        <span className={`inline-flex items-center space-x-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200 ${className}`}>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span>{customLabel || (type === 'completed' ? 'Completed' : 'Delivered')}</span>
        </span>
      );

    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-300 ${className}`}>
          Cancelled
        </span>
      );

    case 'disputed':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-300 ${className}`}>
          Disputed
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 ${className}`}>
          {customLabel || 'Pending'}
        </span>
      );
  }
}
