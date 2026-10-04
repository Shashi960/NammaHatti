import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { notificationService } from '@/services/NotificationService';
import { getCurrentSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const notifications = await notificationService.getUserNotifications(session.userId);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    console.error('Get notifications error:', err);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await notificationService.markAllAsRead(session.userId);
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('Mark all read error:', err);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
