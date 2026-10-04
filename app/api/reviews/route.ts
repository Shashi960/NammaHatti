import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ReviewModel } from '@/models/Review';
import { ShopModel } from '@/models/Shop';
import { reviewSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetId = url.searchParams.get('targetId');
    const targetType = url.searchParams.get('targetType');

    const query: any = {};
    if (targetId) query.targetId = targetId;
    if (targetType) query.targetType = targetType;

    await connectDB();
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const review = await ReviewModel.create({
      orderId: parsed.data.orderId,
      authorId: session.userId,
      authorName: session.name,
      authorRole: session.role === 'TRAVELLER' ? 'TRAVELLER' : 'CUSTOMER',
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    // If review is for a shop, recalculate shop average rating
    if (parsed.data.targetType === 'SHOP') {
      const allShopReviews = await ReviewModel.find({ targetId: parsed.data.targetId, targetType: 'SHOP' }).lean();
      if (allShopReviews.length > 0) {
        const avg = allShopReviews.reduce((sum, r) => sum + r.rating, 0) / allShopReviews.length;
        await ShopModel.findByIdAndUpdate(parsed.data.targetId, {
          rating: Math.round(avg * 10) / 10,
          reviewCount: allShopReviews.length,
        });
      }
    }

    return NextResponse.json({ success: true, review: review.toObject() });
  } catch (err: any) {
    console.error('Create review error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
