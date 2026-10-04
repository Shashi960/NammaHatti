import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CategoryModel } from '@/models/Category';
import { getCurrentSession } from '@/lib/session';
import { INITIAL_CATEGORIES } from '@/lib/categories';

export async function GET() {
  try {
    await connectDB();
    let categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();

    if (!categories.length) {
      await CategoryModel.insertMany(INITIAL_CATEGORIES);
      categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
    }

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    console.error('Categories API error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    }

    await connectDB();
    const cat = await CategoryModel.create({
      name: body.name,
      slug: body.slug.toLowerCase().trim(),
      description: body.description || '',
      iconName: body.iconName || 'Package',
      isActive: true,
    });

    return NextResponse.json({ success: true, category: cat });
  } catch (err: any) {
    console.error('Create category error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
