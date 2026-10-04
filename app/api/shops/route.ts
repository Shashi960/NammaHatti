import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ShopModel } from '@/models/Shop';
import { ProductModel } from '@/models/Product';
import { UserModel } from '@/models/User';
import { shopRegisterSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';
import { createLocation } from '@/types/location';
import { haversineDistanceKm } from '@/services/MapService';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const latStr = url.searchParams.get('lat');
    const lngStr = url.searchParams.get('lng');
    const radiusKm = parseFloat(url.searchParams.get('radius') || '25');
    const includeAll = url.searchParams.get('all') === 'true';

    const query: any = {};
    if (!includeAll) {
      query.verificationStatus = 'VERIFIED';
    }

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const shops: any[] = await ShopModel.find(query).lean();

    // Attach product counts and distances if user coordinates provided
    const userLat = latStr ? parseFloat(latStr) : null;
    const userLng = lngStr ? parseFloat(lngStr) : null;

    const shopsWithDetails = await Promise.all(
      shops.map(async (shop: any) => {
        const productCount = await ProductModel.countDocuments({
          shopId: shop._id.toString(),
          availability: { $ne: 'UNAVAILABLE' },
        });

        let distanceKm: number | null = null;
        if (userLat !== null && userLng !== null && shop.location?.latitude && shop.location?.longitude) {
          distanceKm = haversineDistanceKm(
            userLat,
            userLng,
            shop.location.latitude,
            shop.location.longitude
          );
        }

        return {
          ...shop,
          _id: shop._id.toString(),
          productCount,
          distanceKm,
        };
      })
    );

    // If location filter provided, filter by radius and sort by distance
    let results = shopsWithDetails;
    if (userLat !== null && userLng !== null) {
      results = results.filter((s) => s.distanceKm === null || s.distanceKm <= radiusKm);
      results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return NextResponse.json({ success: true, count: results.length, shops: results });
  } catch (err: any) {
    console.error('Get shops error:', err);
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    if (session.role !== 'SHOP' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only shop accounts can register a shop' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = shopRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    // Check if user already owns a shop
    const existing = await ShopModel.findOne({ ownerId: session.userId });
    if (existing && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You have already registered a business' }, { status: 409 });
    }

    const locationObj = createLocation({
      formattedAddress: parsed.data.location.formattedAddress,
      latitude: parsed.data.location.latitude,
      longitude: parsed.data.location.longitude,
      city: parsed.data.location.city,
      district: parsed.data.location.district,
      state: parsed.data.location.state,
      country: parsed.data.location.country,
      postalCode: parsed.data.location.postalCode,
      landmark: parsed.data.location.landmark,
    });

    const shop = await ShopModel.create({
      ownerId: session.userId,
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      category: parsed.data.category,
      description: parsed.data.description,
      address: parsed.data.address,
      landmark: parsed.data.landmark,
      openingTime: parsed.data.openingTime,
      closingTime: parsed.data.closingTime,
      minOrderAmount: parsed.data.minOrderAmount,
      location: locationObj,
      verificationStatus: 'PENDING',
      rating: 4.8,
      reviewCount: 0,
    });

    // Link shopId to user
    await UserModel.findByIdAndUpdate(session.userId, { shopId: shop._id.toString() });

    return NextResponse.json({
      success: true,
      shop: {
        ...shop.toObject(),
        _id: shop._id.toString(),
      },
    });
  } catch (err: any) {
    console.error('Create shop error:', err);
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
  }
}
