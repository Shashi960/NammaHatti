import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await UserModel.find(query).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({ ...u, _id: u._id.toString() })),
    });
  } catch (err: any) {
    console.error('Get users error:', err);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'userId and status (ACTIVE/SUSPENDED) required' }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.status = status;
    await user.save();

    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: `USER_${status}`,
      targetType: 'USER',
      targetId: userId,
      details: { email: user.email, name: user.name, role: user.role },
    });

    return NextResponse.json({ success: true, user: { ...user.toObject(), _id: user._id.toString() } });
  } catch (err: any) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
