import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const logs = await AdminActionModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    console.error('Get logs error:', err);
    return NextResponse.json({ error: 'Failed to retrieve admin logs' }, { status: 500 });
  }
}
