import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import ConsentLog from '@/models/ConsentLog';

export const CONSENT_VERSION = '1.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function resolveFormByToken(token) {
  if (!token) return null;
  await dbConnect();
  return Form.findOne({ token, active: true }).lean();
}

export async function upsertConsentLog({
  token,
  visitorId,
  status,
  analyticsAllowed,
  marketingAllowed,
  ipAddress,
  userAgent,
  sourcePage,
  locale,
  regionHint,
  pageViews,
  notes,
  contactEmail,
  contactPhone,
  linkedLeadId,
}) {
  const form = await resolveFormByToken(token);
  if (!form) {
    return { ok: false, error: 'Invalid or inactive form token', status: 404 };
  }

  const businessId = form.businessId || form.clientId;
  const payload = {
    visitorId,
    businessId,
    formToken: token,
    status,
    analyticsAllowed: Boolean(analyticsAllowed),
    marketingAllowed: Boolean(marketingAllowed),
    consentVersion: CONSENT_VERSION,
    ipAddress: ipAddress || '',
    userAgent: userAgent || '',
    sourcePage: sourcePage || '',
    locale: locale || '',
    regionHint: regionHint || '',
    notes: notes || '',
  };

  if (contactEmail) payload.contactEmail = contactEmail;
  if (contactPhone) payload.contactPhone = contactPhone;
  if (linkedLeadId) payload.linkedLeadId = linkedLeadId;

  const existing = await ConsentLog.findOne({ visitorId, businessId });

  if (existing) {
    Object.assign(existing, payload);
    if (Array.isArray(pageViews) && pageViews.length) {
      existing.pageViews.push(...pageViews.slice(-20));
    }
    await existing.save();
    return { ok: true, record: existing, form, businessId };
  }

  const created = await ConsentLog.create({
    ...payload,
    pageViews: Array.isArray(pageViews) ? pageViews.slice(-20) : [],
  });

  return { ok: true, record: created, form, businessId };
}

export async function appendPageView({ token, visitorId, path, title, durationSec, ipAddress }) {
  const form = await resolveFormByToken(token);
  if (!form) {
    return { ok: false, error: 'Invalid or inactive form token', status: 404 };
  }

  const businessId = form.businessId || form.clientId;
  const record = await ConsentLog.findOne({ visitorId, businessId });

  if (!record) {
    return { ok: false, error: 'Consent record not found', status: 404 };
  }

  if (record.status !== 'granted' || !record.analyticsAllowed) {
    return { ok: false, error: 'Analytics tracking not allowed for this visitor', status: 403 };
  }

  record.pageViews.push({
    path,
    title: title || path,
    durationSec: durationSec || 0,
    viewedAt: new Date(),
  });

  if (record.pageViews.length > 100) {
    record.pageViews = record.pageViews.slice(-100);
  }

  await record.save();
  return { ok: true, record };
}

export async function linkConsentToLead({ token, visitorId, leadId, email, phone }) {
  const form = await resolveFormByToken(token);
  if (!form || !visitorId) return null;

  const businessId = form.businessId || form.clientId;
  await ConsentLog.findOneAndUpdate(
    { visitorId, businessId },
    {
      $set: {
        linkedLeadId: leadId,
        ...(email ? { contactEmail: email } : {}),
        ...(phone ? { contactPhone: phone } : {}),
      },
    }
  );
}
