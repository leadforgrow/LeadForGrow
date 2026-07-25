import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import WhatsAppFlow from '@/models/automation/WhatsAppFlow';
import FlowExecution from '@/models/automation/FlowExecution';
import { ensureDefaultVariables } from '@/lib/whatsappFlows/service';
import { getDefaultNodeData } from '@/lib/whatsappFlows/constants';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.trim();

    const query = { businessId };
    if (status) query.status = status;
    if (q) {
      query.$or = [
        { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { description: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ];
    }

    const flows = await WhatsAppFlow.find(query).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, data: flows });
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
    const name = body.name?.trim() || 'Untitled Flow';
    const triggerType = body.triggerType || 'incoming_message';

    const FlowNode = (await import('@/models/automation/FlowNode')).default;

    const triggerNodeKey = `trigger_${Date.now()}`;
    const triggerNodeType =
      triggerType === 'keyword'
        ? 'trigger_keyword'
        : triggerType === 'contact_created'
          ? 'trigger_contact_created'
          : triggerType === 'lead_created'
            ? 'trigger_lead_created'
            : triggerType === 'manual'
              ? 'trigger_manual'
              : triggerType === 'webhook'
                ? 'trigger_webhook'
                : 'trigger_incoming_message';

    const flow = await WhatsAppFlow.create({
      businessId,
      name,
      description: body.description || '',
      status: 'draft',
      triggerType,
      triggerConfig: body.triggerConfig || {},
      edges: [],
      createdBy: userId,
      updatedBy: userId,
      webhookSecret: triggerType === 'webhook' ? crypto.randomBytes(24).toString('hex') : undefined,
      tags: body.tags || [],
    });

    await FlowNode.create({
      businessId,
      flowId: flow._id,
      nodeKey: triggerNodeKey,
      type: triggerNodeType,
      position: { x: 120, y: 160 },
      data: getDefaultNodeData(triggerNodeType),
    });

    await ensureDefaultVariables(businessId, flow._id);

    return NextResponse.json({ success: true, data: flow }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
