import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';
import { ShopModel } from '@/models/Shop';
import { UserModel } from '@/models/User';
import { RoutePoolModel } from '@/models/RoutePool';
import { KYCVerificationModel } from '@/models/KYCVerification';
import { ProblemReportModel } from '@/models/ProblemReport';
import { getCurrentSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await connectDB();

    const [
      totalOrders,
      completedOrders,
      totalCustomers,
      totalShops,
      verifiedShops,
      pendingShops,
      totalTravellers,
      verifiedTravellers,
      pendingKYCs,
      activePools,
      pendingReports,
    ] = await Promise.all([
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ orderStatus: 'COMPLETED' }),
      UserModel.countDocuments({ role: 'CUSTOMER' }),
      ShopModel.countDocuments(),
      ShopModel.countDocuments({ verificationStatus: 'VERIFIED' }),
      ShopModel.countDocuments({ verificationStatus: 'PENDING' }),
      UserModel.countDocuments({ role: 'TRAVELLER' }),
      KYCVerificationModel.countDocuments({ status: 'VERIFIED' }),
      KYCVerificationModel.countDocuments({ status: 'PENDING' }),
      RoutePoolModel.countDocuments({ status: { $in: ['OPEN', 'ACCEPTED', 'IN_PROGRESS'] } }),
      ProblemReportModel.countDocuments({ status: 'PENDING' }),
    ]);

    // Aggregate GMV and platform fees
    const financialAggregate = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalGMV: { $sum: '$total' },
          totalPlatformRevenue: { $sum: '$platformFee' },
          totalTravellerPayouts: { $sum: '$travellerEarnings' },
        },
      },
    ]);

    const financials = financialAggregate[0] || {
      totalGMV: 0,
      totalPlatformRevenue: 0,
      totalTravellerPayouts: 0,
    };

    const completionRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

    // Daily breakdown for charts
    const ordersByStatus = await OrderModel.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        completedOrders,
        completionRate,
        totalCustomers,
        totalShops,
        verifiedShops,
        pendingShops,
        totalTravellers,
        verifiedTravellers,
        pendingKYCs,
        activePools,
        pendingReports,
        ...financials,
        ordersByStatus: ordersByStatus.map((s) => ({ status: s._id, count: s.count })),
      },
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to retrieve admin stats' }, { status: 500 });
  }
}
