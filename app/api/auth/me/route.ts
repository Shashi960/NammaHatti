import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { KYCVerificationModel } from '@/models/KYCVerification';
import { ShopModel } from '@/models/Shop';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectDB();
    const user: any = await UserModel.findById(session.userId).lean();
    if (!user || user.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    let isKycVerified = session.isKycVerified;
    if (user.role === 'TRAVELLER') {
      const kyc: any = await KYCVerificationModel.findOne({ partnerId: user._id.toString() }).lean();
      isKycVerified = kyc?.status === 'VERIFIED';
    }

    let shopId = user.shopId;
    if (user.role === 'SHOP' && !shopId) {
      const shop: any = await ShopModel.findOne({ ownerId: user._id.toString() }).lean();
      if (shop) {
        shopId = shop._id.toString();
      }
    }

    return NextResponse.json({
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        shopId,
        isKycVerified,
      },
    });
  } catch (err: any) {
    console.error('Me API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
