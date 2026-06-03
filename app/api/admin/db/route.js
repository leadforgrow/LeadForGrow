import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { applyPlanQuotas } from '@/lib/plans';

import User from '@/models/User';
import Agency from '@/models/Agency';
import AgencyUsage from '@/models/AgencyUsage';
import Business from '@/models/Business';
import Client from '@/models/Client';
import Form from '@/models/Form';
import Invoice from '@/models/Invoice';
import OnboardingCall from '@/models/OnboardingCall';
import Website from '@/models/Website';
import Integration from '@/models/Integration';
import IntegrationLog from '@/models/IntegrationLog';
import Lead from '@/models/automation/Lead';
import AutomationRule from '@/models/automation/AutomationRule';
import AutomationSequence from '@/models/automation/AutomationSequence';
import SequenceExecution from '@/models/sequences/SequenceExecution';
import TeamMember from '@/models/automation/TeamMember';
import Event from '@/models/automation/Event';

const models = {
  User,
  Agency,
  AgencyUsage,
  Business,
  Client,
  Form,
  Invoice,
  OnboardingCall,
  Website,
  Integration,
  IntegrationLog,
  Lead,
  AutomationRule,
  AutomationSequence,
  SequenceExecution,
  TeamMember,
  Event,
};

const ADMIN_PASSWORD = process.env.LFG_ADMIN_PASSWORD;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function requireAdminPassword(password) {
  if (!ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Admin] LFG_ADMIN_PASSWORD must be set in production');
    }
    return false;
  }
  return password === ADMIN_PASSWORD;
}

function getSchemaDef(Model) {
  const schemaDef = {};
  if (Model.schema?.paths) {
    for (const [key, value] of Object.entries(Model.schema.paths)) {
      schemaDef[key] = {
        type: value.instance,
        enumValues: value.enumValues?.length ? value.enumValues : null,
      };
    }
  }
  return schemaDef;
}

function buildSearchQuery(Model, search) {
  if (!search?.trim()) return {};
  const term = search.trim();
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const or = [];
  if (Model.schema?.paths) {
    for (const [key, path] of Object.entries(Model.schema.paths)) {
      if (['String', 'Number'].includes(path.instance)) {
        or.push({ [key]: path.instance === 'Number' && !Number.isNaN(Number(term)) ? Number(term) : regex });
      }
    }
  }
  return or.length ? { $or: or } : {};
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action, modelName, id, updateData, query, search, page = 1, limit = 50 } = body;

    if (!requireAdminPassword(password)) return unauthorized();

    await dbConnect();

    if (action === 'listModels') {
      return NextResponse.json({ data: Object.keys(models) });
    }

    if (action === 'dashboard') {
      const [
        users, businesses, agencies, forms, leads, sequences,
        recentUsers, recentBusinesses, planBreakdown,
      ] = await Promise.all([
        User.countDocuments(),
        Business.countDocuments(),
        Agency.countDocuments(),
        Form.countDocuments(),
        Lead.countDocuments(),
        AutomationSequence.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select('email firstName lastName role createdAt businessId').lean(),
        Business.find().sort({ createdAt: -1 }).limit(5).select('businessName plan createdAt ownerId').lean(),
        Business.aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      return NextResponse.json({
        data: {
          counts: { users, businesses, agencies, forms, leads, sequences },
          planBreakdown: planBreakdown.map((p) => ({ plan: p._id || 'unknown', count: p.count })),
          recentUsers,
          recentBusinesses,
        },
      });
    }

    const Model = models[modelName];
    if (!Model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    switch (action) {
      case 'find': {
        const findQuery = { ...(query || {}), ...buildSearchQuery(Model, search) };
        const skip = Math.max(0, (page - 1) * limit);
        const safeLimit = Math.min(Math.max(1, limit), 200);

        const [docs, total] = await Promise.all([
          Model.find(findQuery).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
          Model.countDocuments(findQuery),
        ]);

        return NextResponse.json({
          data: docs,
          schema: getSchemaDef(Model),
          pagination: { page, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
        });
      }

      case 'delete':
        await Model.findByIdAndDelete(id);
        return NextResponse.json({ success: true });

      case 'update': {
        const cleanData = { ...updateData };
        delete cleanData._id;

        if (modelName === 'Business') {
          const doc = await Model.findById(id);
          if (!doc) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
          const prevPlan = doc.plan;
          Object.assign(doc, cleanData);
          if (cleanData.plan && cleanData.plan !== prevPlan) {
            applyPlanQuotas(doc, doc.plan);
          }
          await doc.save();
          return NextResponse.json({ data: doc.toObject() });
        }

        const updated = await Model.findByIdAndUpdate(id, cleanData, { new: true }).lean();
        return NextResponse.json({ data: updated });
      }

      case 'create': {
        const created = await Model.create(updateData);
        return NextResponse.json({ data: created });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin DB API Error:', error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
