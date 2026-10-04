import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { notificationService } from '@/services/NotificationService';
import { getCurrentSession } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await notificationService.markAsRead(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Failed to mark notification read' }, { status: 500 });
  }
}
