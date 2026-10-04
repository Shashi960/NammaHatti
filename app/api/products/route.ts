import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { ShopModel } from '@/models/Shop';
import { productSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';
import { haversineDistanceKm } from '@/services/MapService';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const shopId = url.searchParams.get('shopId') || '';
    const availability = url.searchParams.get('availability') || '';
    const minPrice = url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : null;
    const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : null;
    const latStr = url.searchParams.get('lat');
    const lngStr = url.searchParams.get('lng');
    const radiusKm = parseFloat(url.searchParams.get('radius') || '30');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '40', 10);

    const query: any = {};

    if (shopId) {
      query.shopId = shopId;
    }

    if (categoryId && categoryId !== 'all') {
      query.categoryId = categoryId;
    }

    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
      ];
    }

    const rawProducts: any[] = await ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalCount = await ProductModel.countDocuments(query);

    // Fetch shop info for distance and shop details
    const shopIds = Array.from(new Set(rawProducts.map((p: any) => p.shopId)));
    const shops: any[] = await ShopModel.find({ _id: { $in: shopIds } }).lean();
    const shopMap = new Map<string, any>(shops.map((s: any) => [s._id.toString(), s]));

    const userLat = latStr ? parseFloat(latStr) : null;
    const userLng = lngStr ? parseFloat(lngStr) : null;

    let productsWithShop = rawProducts.map((p: any) => {
      const shop = shopMap.get(p.shopId);
      let distanceKm: number | null = null;

      if (userLat !== null && userLng !== null && shop?.location?.latitude && shop?.location?.longitude) {
        distanceKm = haversineDistanceKm(
          userLat,
          userLng,
          shop.location.latitude,
          shop.location.longitude
        );
      }

      return {
        ...p,
        _id: p._id.toString(),
        shop: shop
          ? {
              _id: shop._id.toString(),
              businessName: shop.businessName,
              verificationStatus: shop.verificationStatus,
              rating: shop.rating,
              location: shop.location,
              distanceKm,
            }
          : null,
        distanceKm,
      };
    });

    if (userLat !== null && userLng !== null) {
      productsWithShop = productsWithShop.filter(
        (p) => p.distanceKm === null || p.distanceKm <= radiusKm
      );
      productsWithShop.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return NextResponse.json({
      success: true,
      total: totalCount,
      page,
      limit,
      products: productsWithShop,
    });
  } catch (err: any) {
    console.error('Products search error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    if (session.role !== 'SHOP' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only shop owners can add products' }, { status: 403 });
    }

    await connectDB();

    let shopId = session.shopId;
    if (!shopId) {
      const shop = await ShopModel.findOne({ ownerId: session.userId });
      if (!shop) {
        return NextResponse.json({ error: 'Please register your shop first before adding products' }, { status: 400 });
      }
      shopId = shop._id.toString();
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Determine availability state based on stock
    let availability = parsed.data.availability;
    if (parsed.data.stock <= 0) {
      availability = 'OUT_OF_STOCK';
    } else if (parsed.data.stock <= 3) {
      availability = 'LOW_STOCK';
    }

    const product = await ProductModel.create({
      shopId,
      name: parsed.data.name,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      categoryName: parsed.data.categoryName,
      price: parsed.data.price,
      discountPrice: parsed.data.discountPrice,
      stock: parsed.data.stock,
      unit: parsed.data.unit,
      sku: parsed.data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      images: parsed.data.images.length > 0 ? parsed.data.images : ['/placeholder-product.svg'],
      weightKg: parsed.data.weightKg,
      availability,
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        _id: product._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
