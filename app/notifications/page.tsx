'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notification';
import { Bell, Check, CheckCheck, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Link href="/orders" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders</span>
      </Link>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live order updates, route allocations, and earnings</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <CheckCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            onClick={() => !notif.isRead && handleMarkRead(notif._id)}
            className={`rounded-xl border p-4 transition-all cursor-pointer ${
              notif.isRead
                ? 'bg-white border-slate-200'
                : 'bg-brand-50/40 border-brand-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-brand-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600">{notif.message}</p>
                <span className="text-[10px] text-slate-400">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>

              {notif.entityId && notif.entityType === 'ORDER' && (
                <Link
                  href={`/orders/${notif.entityId}`}
                  className="text-xs font-semibold text-brand-600 hover:underline shrink-0 ml-3"
                >
                  View Order →
                </Link>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-xs">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
