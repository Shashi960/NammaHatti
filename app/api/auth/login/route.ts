import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { ShopModel } from '@/models/Shop';
import { KYCVerificationModel } from '@/models/KYCVerification';
import { loginSchema } from '@/schemas/auth';
import { verifyPassword } from '@/lib/auth';
import { createSessionToken, getSessionCookieName } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'This account has been suspended by administration' }, { status: 403 });
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    let shopId = user.shopId;
    if (user.role === 'SHOP' && !shopId) {
      const shop = await ShopModel.findOne({ ownerId: user._id.toString() });
      if (shop) {
        shopId = shop._id.toString();
        user.shopId = shopId;
        await user.save();
      }
    }

    let isKycVerified = false;
    if (user.role === 'TRAVELLER') {
      const kyc = await KYCVerificationModel.findOne({ partnerId: user._id.toString() });
      isKycVerified = kyc?.status === 'VERIFIED';
    }

    const sessionPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      shopId,
      isKycVerified,
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
    console.error('Login API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
