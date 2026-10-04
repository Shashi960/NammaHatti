import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    await connectDB();
    const order: any = await OrderModel.findById(params.id).lean();
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Role authorization
    const isOwner = order.customerId === session.userId;
    const isShop = order.shopId === session.shopId;
    const isTraveller = order.travellerId === session.userId;
    const isAdmin = session.role === 'ADMIN';

    if (!isOwner && !isShop && !isTraveller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this order' }, { status: 403 });
    }

    // Sensitive data minimization: OTP only visible to customer or admin
    const canSeeOtp = isOwner || isAdmin;

    // Traveller sees customer first name and package info only (section 7 privacy)
    let sanitizedCustomerName = order.customerName;
    if (isTraveller && !isAdmin) {
      sanitizedCustomerName = order.customerName.split(' ')[0] + ' (Customer)';
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        customerName: sanitizedCustomerName,
        deliveryOtp: canSeeOtp ? order.deliveryOtp : undefined,
      },
    });
  } catch (err: any) {
    console.error('Get order detail error:', err);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}
