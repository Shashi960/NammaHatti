'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  TrendingUp,
  Store,
  Car,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Users,
  FileText,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [pendingKYCs, setPendingKYCs] = useState<any[]>([]);
  const [rules, setRules] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'travellers' | 'rules' | 'logs'>('overview');
  const [savingRules, setSavingRules] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      // Stats
      const statRes = await fetch('/api/admin/stats');
      const statData = await statRes.json();
      if (statData.stats) setStats(statData.stats);

      // Pending shops
      const shopRes = await fetch('/api/shops?all=true');
      const shopData = await shopRes.json();
      if (shopData.shops) {
        setPendingShops(shopData.shops.filter((s: any) => s.verificationStatus === 'PENDING'));
      }

      // Business Rules
      const rulesRes = await fetch('/api/admin/business-rules');
      const rulesData = await rulesRes.json();
      if (rulesData.rules) setRules(rulesData.rules);

      // Audit Logs
      const logRes = await fetch('/api/admin/logs');
      const logData = await logRes.json();
      if (logData.logs) setLogs(logData.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadData();
    }
  }, [user]);

  const handleVerifyShop = async (shopId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/verify-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, status, note: `Admin approved on ${new Date().toISOString()}` }),
      });
      if (res.ok) {
        setActionSuccess(`Shop successfully marked as ${status}`);
        await loadData();
      }
    } catch (err) {
      console.error('Verify shop error:', err);
    }
  };

  const handleVerifyTraveller = async (partnerId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/verify-traveller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, status }),
      });
      if (res.ok) {
        setActionSuccess(`Traveller successfully marked as ${status}`);
        await loadData();
      }
    } catch (err) {
      console.error('Verify traveller error:', err);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRules(true);
    try {
      const res = await fetch('/api/admin/business-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        setActionSuccess('Business rules and platform limits updated successfully');
        await loadData();
      }
    } catch (err) {
      console.error('Save rules error:', err);
    } finally {
      setSavingRules(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 space-y-3">
        <Shield className="h-10 w-10 text-rose-500" />
        <p className="font-semibold text-slate-800 text-sm">Administrator privileges required</p>
        <Link href="/login" className="text-xs font-semibold text-brand-600 underline">
          Sign In with Admin Account (admin@demo.local)
        </Link>
      </div>
    );
  }

  const chartData = [
    { name: 'Total GMV', amount: stats?.totalGMV || 0 },
    { name: 'Traveller Payouts', amount: stats?.totalTravellerPayouts || 0 },
    { name: 'Platform Revenue', amount: stats?.totalPlatformRevenue || 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Platform Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System health, merchant verification, route pool oversight, and business rules
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'shops' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shop Verifications ({pendingShops.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Rules & Pricing
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs ({logs.length})
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
          ✓ {actionSuccess}
        </div>
      )}

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Total GMV</span>
              <p className="text-xl font-black text-slate-900 mt-1">₹{stats?.totalGMV || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Platform Revenue</span>
              <p className="text-xl font-black text-brand-700 mt-1">₹{stats?.totalPlatformRevenue || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Total Orders</span>
              <p className="text-xl font-black text-slate-900 mt-1">{stats?.totalOrders || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Completion Rate</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{stats?.completionRate || 100}%</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Active Pools</span>
              <p className="text-xl font-black text-route-600 mt-1">{stats?.activePools || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400">Verified Shops</span>
              <p className="text-xl font-black text-slate-900 mt-1">{stats?.verifiedShops || 0}</p>
            </div>
          </div>

          {/* Recharts Analytics Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Financial Breakdown (GMV, Traveller Payouts, Platform Commission)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#1e6f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHOPS VERIFICATION */}
      {activeTab === 'shops' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pending Merchant Business Approvals</h3>
              <p className="text-xs text-slate-500">Review business authenticity and physical location before granting Verified badge</p>
            </div>
            <span className="text-xs font-semibold text-slate-700">{pendingShops.length} Pending</span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingShops.map((s) => (
              <div key={s._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{s.businessName}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{s.address}, {s.location?.city}</p>
                  <p className="text-[11px] text-slate-500">
                    Contact: {s.contactName} · Phone: {s.phone} · Email: {s.email}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyShop(s._id, 'VERIFIED')}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    ✓ Approve Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyShop(s._id, 'REJECTED')}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {pendingShops.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending shop verifications. All merchant businesses are approved!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS RULES & CONFIG */}
      {activeTab === 'rules' && rules && (
        <form onSubmit={handleSaveRules} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Dynamic Platform Fees & Matching Limits</h3>
            <p className="text-xs text-slate-500">Configurable business parameters applied system-wide without hardcoded logic</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Delivery Fee (₹)</label>
              <input
                type="number"
                value={rules.baseDeliveryFee}
                onChange={(e) => setRules({ ...rules, baseDeliveryFee: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Express Delivery Fee (₹)</label>
              <input
                type="number"
                value={rules.expressDeliveryFee}
                onChange={(e) => setRules({ ...rules, expressDeliveryFee: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Platform Commission (%)</label>
              <input
                type="number"
                value={rules.platformCommissionPercent}
                onChange={(e) => setRules({ ...rules, platformCommissionPercent: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Traveller Payout Share (%)</label>
              <input
                type="number"
                value={rules.travellerPayoutSharePercent}
                onChange={(e) => setRules({ ...rules, travellerPayoutSharePercent: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Partner Default Radius (km)</label>
              <input
                type="number"
                value={rules.partnerDefaultRadiusKm}
                onChange={(e) => setRules({ ...rules, partnerDefaultRadiusKm: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Partner Max Radius Cap (km)</label>
              <input
                type="number"
                value={rules.partnerMaxRadiusKm}
                onChange={(e) => setRules({ ...rules, partnerMaxRadiusKm: Math.min(Number(e.target.value), 10) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Order Match Radius (km)</label>
              <input
                type="number"
                value={rules.orderMatchRadiusKm}
                onChange={(e) => setRules({ ...rules, orderMatchRadiusKm: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Max Route Distance (km)</label>
              <input
                type="number"
                value={rules.maxRouteDistanceKm}
                onChange={(e) => setRules({ ...rules, maxRouteDistanceKm: Number(e.target.value) })}
                className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingRules}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {savingRules ? 'Updating...' : 'Save System Rules'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-3 px-4">{log.targetType}</td>
                  <td className="py-3 px-4">{log.adminEmail}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No admin actions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
