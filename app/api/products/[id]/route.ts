import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { ShopModel } from '@/models/Shop';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const product: any = await ProductModel.findById(params.id).lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const shop: any = await ShopModel.findById(product.shopId).lean();

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product._id.toString(),
        shop: shop ? { ...shop, _id: shop._id.toString() } : null,
      },
    });
  } catch (err: any) {
    console.error('Get product error:', err);
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const product = await ProductModel.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify ownership
    const shop = await ShopModel.findById(product.shopId);
    if (!shop || (shop.ownerId !== session.userId && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 });
    }

    const body = await req.json();

    if (body.name) product.name = body.name;
    if (body.description !== undefined) product.description = body.description;
    if (body.categoryId) product.categoryId = body.categoryId;
    if (body.categoryName) product.categoryName = body.categoryName;
    if (body.price !== undefined) product.price = body.price;
    if (body.discountPrice !== undefined) product.discountPrice = body.discountPrice;
    if (body.stock !== undefined) {
      product.stock = body.stock;
      if (product.stock <= 0) product.availability = 'OUT_OF_STOCK';
      else if (product.stock <= 3) product.availability = 'LOW_STOCK';
      else product.availability = 'IN_STOCK';
    }
    if (body.availability) product.availability = body.availability;
    if (body.unit) product.unit = body.unit;
    if (body.sku) product.sku = body.sku;
    if (body.images) product.images = body.images;
    if (body.weightKg !== undefined) product.weightKg = body.weightKg;

    await product.save();

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        _id: product._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Update product error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const product = await ProductModel.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const shop = await ShopModel.findById(product.shopId);
    if (!shop || (shop.ownerId !== session.userId && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ProductModel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Product removed' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
