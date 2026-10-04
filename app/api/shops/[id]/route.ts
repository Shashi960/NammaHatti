import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ShopModel } from '@/models/Shop';
import { ProductModel } from '@/models/Product';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const shop: any = await ShopModel.findById(params.id).lean();
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const products = await ProductModel.find({ shopId: params.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      shop: {
        ...shop,
        _id: shop._id.toString(),
      },
      products: products.map((p: any) => ({ ...p, _id: p._id.toString() })),
    });
  } catch (err: any) {
    console.error('Get shop detail error:', err);
    return NextResponse.json({ error: 'Failed to retrieve shop' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const shop = await ShopModel.findById(params.id);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Must be owner or admin
    if (shop.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this shop' }, { status: 403 });
    }

    const body = await req.json();

    if (body.businessName) shop.businessName = body.businessName;
    if (body.contactName) shop.contactName = body.contactName;
    if (body.phone) shop.phone = body.phone;
    if (body.description !== undefined) shop.description = body.description;
    if (body.category) shop.category = body.category;
    if (body.openingTime) shop.openingTime = body.openingTime;
    if (body.closingTime) shop.closingTime = body.closingTime;
    if (body.minOrderAmount !== undefined) shop.minOrderAmount = body.minOrderAmount;
    if (body.images) shop.images = body.images;

    if (body.location) {
      shop.location = {
        ...shop.location,
        ...body.location,
        geoJSON: {
          type: 'Point',
          coordinates: [body.location.longitude, body.location.latitude],
        },
      };
    }

    await shop.save();

    return NextResponse.json({
      success: true,
      shop: {
        ...shop.toObject(),
        _id: shop._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Update shop error:', err);
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
  }
}
