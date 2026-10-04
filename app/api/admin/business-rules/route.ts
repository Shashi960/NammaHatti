import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BusinessRulesModel } from '@/models/BusinessRules';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';
import { DEFAULT_BUSINESS_RULES } from '@/types/businessRules';

export async function GET() {
  try {
    await connectDB();
    let rules: any = await BusinessRulesModel.findOne().lean();
    if (!rules) {
      rules = await BusinessRulesModel.create(DEFAULT_BUSINESS_RULES);
    }
    return NextResponse.json({ success: true, rules });
  } catch (err: any) {
    console.error('Get business rules error:', err);
    return NextResponse.json({ error: 'Failed to retrieve business rules' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    let rules = await BusinessRulesModel.findOne();
    if (!rules) {
      rules = new BusinessRulesModel(DEFAULT_BUSINESS_RULES);
    }

    if (body.baseDeliveryFee !== undefined) rules.baseDeliveryFee = Number(body.baseDeliveryFee);
    if (body.expressDeliveryFee !== undefined) rules.expressDeliveryFee = Number(body.expressDeliveryFee);
    if (body.platformCommissionPercent !== undefined) rules.platformCommissionPercent = Number(body.platformCommissionPercent);
    if (body.shopCommissionPercent !== undefined) rules.shopCommissionPercent = Number(body.shopCommissionPercent);
    if (body.travellerPayoutSharePercent !== undefined) rules.travellerPayoutSharePercent = Number(body.travellerPayoutSharePercent);
    if (body.partnerDefaultRadiusKm !== undefined) rules.partnerDefaultRadiusKm = Number(body.partnerDefaultRadiusKm);
    if (body.partnerMaxRadiusKm !== undefined) rules.partnerMaxRadiusKm = Math.min(Number(body.partnerMaxRadiusKm), 10);
    if (body.orderMatchRadiusKm !== undefined) rules.orderMatchRadiusKm = Number(body.orderMatchRadiusKm);
    if (body.maxPackageCapacity !== undefined) rules.maxPackageCapacity = Number(body.maxPackageCapacity);
    if (body.maxRouteDistanceKm !== undefined) rules.maxRouteDistanceKm = Number(body.maxRouteDistanceKm);
    rules.updatedBy = session.email;

    await rules.save();

    // Audit log
    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: 'UPDATE_BUSINESS_RULES',
      targetType: 'PLATFORM_SETTINGS',
      targetId: rules._id.toString(),
      details: body,
    });

    return NextResponse.json({ success: true, rules: rules.toObject() });
  } catch (err: any) {
    console.error('Update business rules error:', err);
    return NextResponse.json({ error: 'Failed to update business rules' }, { status: 500 });
  }
}
