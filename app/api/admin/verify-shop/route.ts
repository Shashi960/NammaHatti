import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ShopModel } from '@/models/Shop';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';
import { notificationService } from '@/services/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { shopId, status, note } = body;

    if (!shopId || !['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Valid shopId and status required' }, { status: 400 });
    }

    await connectDB();
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const previousStatus = shop.verificationStatus;
    shop.verificationStatus = status;
    await shop.save();

    // Audit log
    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: `SHOP_VERIFICATION_${status}`,
      targetType: 'SHOP',
      targetId: shopId,
      details: {
        previousStatus,
        newStatus: status,
        shopName: shop.businessName,
        note,
      },
    });

    // Notify shop owner
    await notificationService.notify({
      userId: shop.ownerId,
      title: `Shop Status Updated: ${status}`,
      message: `Your shop "${shop.businessName}" verification status is now ${status}. ${note || ''}`,
      type: 'SYSTEM_ALERT',
      entityType: 'SHOP',
      entityId: shopId,
    });

    return NextResponse.json({
      success: true,
      shop: { ...shop.toObject(), _id: shop._id.toString() },
    });
  } catch (err: any) {
    console.error('Verify shop error:', err);
    return NextResponse.json({ error: 'Failed to verify shop' }, { status: 500 });
  }
}
