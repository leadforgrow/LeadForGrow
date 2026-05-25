import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import AutomationSequence from '@/models/automation/AutomationSequence';
import { withPlanAccess } from '@/lib/accessControl';
import { syncSequenceRule } from '@/lib/sequences/ruleSync';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const sequences = await AutomationSequence.find({ businessId })
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: sequences });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const userId = req.user.userId;
    const body = await req.json();

    const {
      name,
      description,
      category = 'custom',
      triggerType = 'new_lead',
      triggerConfig = {},
      nodes = [],
      edges = [],
      steps = [],
      status = 'draft',
      templateId,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Sequence name required' }, { status: 400 });
    }

    const workflowMode = nodes.length > 0 ? 'graph' : 'linear';

    const sequence = await AutomationSequence.create({
      businessId,
      name: name.trim(),
      description,
      category,
      triggerType,
      triggerConfig,
      workflowMode,
      nodes,
      edges,
      steps,
      status,
      createdBy: userId,
      tags: body.tags || [],
    });

    await syncSequenceRule(sequence, userId);

    const populated = await AutomationSequence.findById(sequence._id).lean();
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error('[Sequences API] POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
