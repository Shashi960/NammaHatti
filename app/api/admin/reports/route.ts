import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ProblemReportModel } from '@/models/ProblemReport';
import { AdminActionModel } from '@/models/AdminAction';
import { getCurrentSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const reports = await ProblemReportModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: reports.length, reports });
  } catch (err: any) {
    console.error('Get reports error:', err);
    return NextResponse.json({ error: 'Failed to retrieve reports' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, resolutionNote } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status are required' }, { status: 400 });
    }

    await connectDB();
    const report = await ProblemReportModel.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    report.status = status;
    report.resolutionNote = resolutionNote || '';
    report.resolvedBy = session.email;
    report.resolvedAt = new Date();
    await report.save();

    // Audit log
    await AdminActionModel.create({
      adminId: session.userId,
      adminEmail: session.email,
      action: `RESOLVE_REPORT_${status}`,
      targetType: 'REPORT',
      targetId: reportId,
      details: { resolutionNote, status },
    });

    return NextResponse.json({ success: true, report: report.toObject() });
  } catch (err: any) {
    console.error('Update report error:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
