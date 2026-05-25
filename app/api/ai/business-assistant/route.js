import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withAuth } from '@/lib/auth';
import { buildBusinessAssistantContext, generateLocalAnswer } from '@/lib/server/businessAssistantContext';

const AI_BACKEND = process.env.AI_BACKEND_URL || 'https://lfg-v2.onrender.com';

export const POST = withAuth()(async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const body = await req.json();
    const { question, history = [] } = body;

    if (!question?.trim()) {
      return NextResponse.json({ success: false, error: 'Question required' }, { status: 400 });
    }

    const ctx = await buildBusinessAssistantContext(user.businessId, user.userId);
    if (!ctx) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    const metricsPayload = {
      businessName: ctx.businessName,
      totalLeads: ctx.metrics.totalLeads,
      activeLeads: ctx.metrics.activeLeads,
      totalPipelineValue: ctx.metrics.totalPipelineValue,
      revenueAtRisk: ctx.metrics.revenueAtRisk,
      recoveredRevenue: ctx.metrics.recoveredRevenue,
      slaCompliance: ctx.metrics.slaCompliance,
      topSource: ctx.topSource,
      avgDeal: ctx.dealValue,
      plan: ctx.plan,
      activeAutomations: ctx.operations.activeAutomationRules,
      activeSequences: ctx.operations.activeSequences,
    };

    let answer;
    let source = 'local';

    try {
      const aiRes = await fetch(`${AI_BACKEND}/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          metrics: metricsPayload,
          history: history.slice(-6),
          context: {
            businessName: ctx.businessName,
            integrations: ctx.integrations,
            hotLeads: ctx.hotLeads,
            operations: ctx.operations,
          },
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        if (data.answer) {
          answer = data.answer;
          source = 'ai';
        }
      }
    } catch (err) {
      console.warn('[BusinessAssistant] AI backend fallback:', err.message);
    }

    if (!answer) {
      answer = generateLocalAnswer(question, ctx);
      source = 'local';
    }

    return NextResponse.json({
      success: true,
      answer,
      source,
      context: {
        businessName: ctx.businessName,
        metrics: ctx.metrics,
      },
    });
  } catch (error) {
    console.error('[BusinessAssistant] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process question' }, { status: 500 });
  }
});

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const ctx = await buildBusinessAssistantContext(req.user.businessId, req.user.userId);
    if (!ctx) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        businessName: ctx.businessName,
        plan: ctx.plan,
        metrics: ctx.metrics,
        operations: ctx.operations,
        integrations: ctx.integrations,
        topSource: ctx.topSource,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
