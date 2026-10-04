'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LifeBuoy, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { ReportCategory } from '@/types/report';

function HelpCenterContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const { user } = useAuth();
  const [orderId, setOrderId] = useState(initialOrderId);
  const [category, setCategory] = useState<ReportCategory>('ORDER_NOT_RECEIVED');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to report a problem');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || undefined,
          category,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to file report');
        setSubmitting(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError('An error occurred filing report');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <Link href="/orders" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders</span>
      </Link>

      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Help Center & Dispute Resolution
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Need assistance with a delivery, merchant order, or traveller interaction? Our team investigates every ticket.
        </p>
      </div>

      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3 shadow-sm">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="text-xl font-bold text-emerald-950">Report Successfully Submitted</h2>
          <p className="text-xs text-emerald-800 font-semibold">
            Ticket ID: <span className="font-mono text-sm">{result.report.reportNumber}</span>
          </p>
          <p className="text-xs text-emerald-700 max-w-sm mx-auto leading-relaxed">
            {result.message}
          </p>
          <Link
            href="/orders"
            className="inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 mt-2"
          >
            Return to My Orders
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Related Order ID or Order Number (Optional)
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-2026-XXXX"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            >
              <option value="ORDER_NOT_RECEIVED">Order Not Received</option>
              <option value="WRONG_PRODUCT">Wrong Product / Defect</option>
              <option value="DAMAGED_ITEM">Damaged Package</option>
              <option value="SHOP_ISSUE">Shop Merchant Issue</option>
              <option value="TRAVELLER_ISSUE">Traveller Issue</option>
              <option value="PAYMENT_ISSUE">Payment / Refund Issue</option>
              <option value="OTHER">Other Dispute</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain the issue with specific context..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{submitting ? 'Submitting Report...' : 'Submit Support Report'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading help center...</div>}>
      <HelpCenterContent />
    </Suspense>
  );
}
