import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { registerSchema } from '@/schemas/auth';
import { hashPassword } from '@/lib/auth';
import { createSessionToken, getSessionCookieName } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const existing = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      phone: parsed.data.phone,
      role: parsed.data.role,
      status: 'ACTIVE',
    });

    const sessionPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Register API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
