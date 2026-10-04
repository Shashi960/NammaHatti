import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ProblemReportModel } from '@/models/ProblemReport';
import { reportProblemSchema } from '@/schemas/index';
import { getCurrentSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportProblemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();

    const reportNumber = `REP-${Date.now().toString().slice(-6)}`;

    const report = await ProblemReportModel.create({
      reportNumber,
      reporterId: session.userId,
      reporterName: session.name,
      reporterRole: session.role,
      orderId: parsed.data.orderId,
      category: parsed.data.category,
      description: parsed.data.description,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: `Report ${reportNumber} submitted. Our support team will investigate promptly.`,
      report: report.toObject(),
    });
  } catch (err: any) {
    console.error('Submit report error:', err);
    return NextResponse.json({ error: 'Failed to submit problem report' }, { status: 500 });
  }
}
