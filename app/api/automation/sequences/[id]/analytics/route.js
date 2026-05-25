import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import AutomationSequence from '@/models/automation/AutomationSequence';
import SequenceExecution from '@/models/sequences/SequenceExecution';
import { withPlanAccess } from '@/lib/accessControl';

export const GET = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const businessId = req.user.businessId;

    const sequence = await AutomationSequence.findOne({ _id: id, businessId }).lean();
    if (!sequence) {
      return NextResponse.json({ success: false, error: 'Sequence not found' }, { status: 404 });
    }

    const [statusCounts, recentLogs] = await Promise.all([
      SequenceExecution.aggregate([
        { $match: { sequenceId: sequence._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      SequenceExecution.find({ sequenceId: id })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('logs status updatedAt leadId')
        .lean(),
    ]);

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
    const enrolled = sequence.analytics?.enrolled || byStatus.running + byStatus.completed + byStatus.failed + byStatus.waiting || 0;
    const completed = sequence.analytics?.completed || byStatus.completed || 0;
    const failed = sequence.analytics?.failed || byStatus.failed || 0;
    const activeRuns = sequence.analytics?.activeRuns || (byStatus.running || 0) + (byStatus.waiting || 0);

    const completionRate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
    const responseRate = sequence.analytics?.responded && enrolled
      ? Math.round((sequence.analytics.responded / enrolled) * 100)
      : 0;

    const timeline = recentLogs.flatMap((ex) =>
      (ex.logs || []).slice(-3).map((log) => ({
        ...log,
        executionId: ex._id,
        leadId: ex.leadId,
        executionStatus: ex.status,
      }))
    ).sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt)).slice(0, 30);

    return NextResponse.json({
      success: true,
      data: {
        enrolled,
        completed,
        failed,
        activeRuns,
        completionRate,
        responseRate,
        byStatus,
        timeline,
        sequence: {
          name: sequence.name,
          status: sequence.status,
          version: sequence.version,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
