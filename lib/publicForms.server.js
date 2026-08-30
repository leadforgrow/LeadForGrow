/**
 * Server-only helpers that keep the LeadForGrow "master" contact form token
 * bound to the LeadForGrow business in every environment.
 *
 * Why this exists
 * ---------------
 * The public `/api/forms/submit` endpoint resolves tenancy from the Form's
 * `token`. The landing page on leadforgrow.com submits with a well-known
 * "master" token (see lib/publicForms.js → CONTACT_FORM_TOKEN). If a DB is
 * seeded from another environment, that token can end up attached to the
 * wrong Business (or missing), silently routing leadforgrow.com's own leads
 * into some other tenant's inbox. That is embarrassing during demos and
 * caused a live bug once already.
 *
 * The rule this helper enforces:
 *   The master token is reserved for LeadForGrow. Wherever the app runs,
 *   its Form document must exist, be active, and belong to the LeadForGrow
 *   Business. Every OTHER business gets its own unique token generated
 *   in-app; those are unaffected by anything here.
 *
 * How the LeadForGrow business is identified (first match wins):
 *   1. env var LEADFORGROW_BUSINESS_ID (explicit override)
 *   2. env var LEADFORGROW_OWNER_EMAIL (defaults to "leadforgrow@gmail.com")
 *      → the businessId owned by that user
 *
 * The healing is best-effort and idempotent: one findOne + optional save
 * per submit that carries the master token. Other tokens are untouched.
 */
import mongoose from 'mongoose';
import Business from '@/models/Business';
import User from '@/models/User';
import Form from '@/models/Form';
import { CONTACT_FORM_TOKEN } from '@/lib/publicForms';

const MASTER_FORM_NAME = 'LeadForGrow Website Contact';
const OWNER_EMAIL_DEFAULT = 'leadforgrow@gmail.com';

let cachedLeadForGrowBusinessId = null;

export function isMasterContactFormToken(token) {
  return typeof token === 'string' && token === CONTACT_FORM_TOKEN;
}

export async function resolveLeadForGrowBusinessId() {
  if (cachedLeadForGrowBusinessId) return cachedLeadForGrowBusinessId;

  const overrideId = process.env.LEADFORGROW_BUSINESS_ID;
  if (overrideId && mongoose.Types.ObjectId.isValid(overrideId)) {
    const found = await Business.findById(overrideId).select('_id status').lean();
    if (found) {
      cachedLeadForGrowBusinessId = String(found._id);
      return cachedLeadForGrowBusinessId;
    }
    console.warn(
      `[publicForms] LEADFORGROW_BUSINESS_ID=${overrideId} not found in DB — falling back to owner lookup.`
    );
  }

  const ownerEmail = (process.env.LEADFORGROW_OWNER_EMAIL || OWNER_EMAIL_DEFAULT).toLowerCase();
  const owner = await User.findOne({ email: ownerEmail }).select('_id businessId');
  if (!owner) return null;

  // Prefer an existing owned business, then the User's linked businessId if it
  // still resolves. A stale user.businessId (pointing to a deleted Business)
  // is auto-cleared so callers don't keep hitting "Workspace not found".
  let business = await Business.findOne({ ownerId: owner._id }).select('_id').sort({ createdAt: 1 });
  if (!business && owner.businessId) {
    business = await Business.findById(owner.businessId).select('_id');
  }

  if (!business) {
    // Auto-provision a LeadForGrow business on first submit so a fresh env
    // (or one where the record was deleted) does not silently 400.
    business = await Business.create({
      businessName: 'LeadForGrow',
      ownerId: owner._id,
      status: 'active',
      plan: 'enterprise',
    });
    console.log(
      `[publicForms] Auto-created LeadForGrow Business ${business._id} for ${ownerEmail}.`
    );
  }

  if (String(owner.businessId || '') !== String(business._id)) {
    owner.businessId = business._id;
    await owner.save();
  }

  cachedLeadForGrowBusinessId = String(business._id);
  return cachedLeadForGrowBusinessId;
}

/**
 * Ensure the master contact form exists, is active, and points at the
 * LeadForGrow business. Safe to call on every submit that carries the
 * master token. No-op for any other token.
 *
 * @returns {Promise<{ status: 'ok' | 'repointed' | 'created' | 'missing_business' | 'skipped' }>}
 */
export async function ensureMasterContactFormBinding(token) {
  if (!isMasterContactFormToken(token)) return { status: 'skipped' };

  const targetBusinessId = await resolveLeadForGrowBusinessId();
  if (!targetBusinessId) {
    console.warn(
      '[publicForms] No LeadForGrow business found — set LEADFORGROW_BUSINESS_ID or ensure a user with LEADFORGROW_OWNER_EMAIL exists with an owned Business.'
    );
    return { status: 'missing_business' };
  }

  const existing = await Form.findOne({ token });
  if (!existing) {
    await Form.create({
      businessId: targetBusinessId,
      name: MASTER_FORM_NAME,
      token,
      active: true,
    });
    return { status: 'created' };
  }

  const drift =
    String(existing.businessId || '') !== String(targetBusinessId) || existing.active !== true;

  if (drift) {
    existing.businessId = targetBusinessId;
    existing.active = true;
    await existing.save();
    return { status: 'repointed' };
  }

  return { status: 'ok' };
}

/** Test-only. Not exported through an index. */
export function _resetLeadForGrowBusinessCache() {
  cachedLeadForGrowBusinessId = null;
}
