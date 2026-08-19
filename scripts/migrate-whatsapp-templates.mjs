/**
 * Migrate legacy AutomationRule.manual_template docs into WhatsAppTemplate.
 *
 * Legacy schema stored WhatsApp templates as AutomationRule docs with:
 *   type: 'manual_template'
 *   config.channel: 'whatsapp' | 'email'
 *   config.messageTemplate, config.metaTemplateId, config.metaCategory,
 *   config.metaStatus, config.metaComponents, config.language
 *
 * We copy any doc where config.channel === 'whatsapp' (or metaTemplateId is
 * present) into WhatsAppTemplate. Email quick-replies are left where they are.
 *
 * Run: node --import ./scripts/register-alias.mjs scripts/migrate-whatsapp-templates.mjs
 */

import { dbConnect } from '../lib/mongodb.js';
import AutomationRule from '../models/automation/AutomationRule.js';
import WhatsAppTemplate from '../models/automation/WhatsAppTemplate.js';

function coerceStatus(metaStatus) {
  const s = String(metaStatus || 'DRAFT').toUpperCase();
  if (['APPROVED', 'PENDING', 'REJECTED', 'DISABLED', 'PAUSED', 'DRAFT'].includes(s)) return s;
  if (s === 'IN_APPEAL' || s === 'PENDING_DELETION') return 'PENDING';
  return 'DRAFT';
}

function normaliseName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

async function run() {
  await dbConnect();

  const legacy = await AutomationRule.find({ type: 'manual_template' }).lean();
  console.log(`[migrate] Found ${legacy.length} legacy manual_template rules`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const rule of legacy) {
    const cfg = rule.config || {};
    const channel = cfg.channel || 'whatsapp';
    if (channel !== 'whatsapp' && !cfg.metaTemplateId) {
      skipped += 1;
      continue;
    }

    const name = normaliseName(rule.name);
    if (!name) {
      console.warn(`[migrate] Skipping rule ${rule._id} — cannot derive a valid name from "${rule.name}"`);
      skipped += 1;
      continue;
    }

    const language = cfg.language || 'en_US';
    const components = Array.isArray(cfg.metaComponents) && cfg.metaComponents.length
      ? cfg.metaComponents
      : [{ type: 'BODY', text: cfg.messageTemplate || '' }];

    const existing = await WhatsAppTemplate.findOne({
      businessId: rule.businessId,
      $or: [
        { name, language },
        ...(cfg.metaTemplateId ? [{ metaTemplateId: String(cfg.metaTemplateId) }] : []),
      ],
    });

    const doc = {
      businessId: rule.businessId,
      name,
      language,
      category: cfg.metaCategory || 'MARKETING',
      status: coerceStatus(cfg.metaStatus || (cfg.isMetaTemplate ? 'PENDING' : 'DRAFT')),
      components,
      metaTemplateId: cfg.metaTemplateId ? String(cfg.metaTemplateId) : undefined,
      metaStatus: cfg.metaStatus,
      source: cfg.isMetaTemplate ? 'imported' : 'native',
    };

    if (existing) {
      Object.assign(existing, doc);
      await existing.save();
      updated += 1;
    } else {
      try {
        await WhatsAppTemplate.create(doc);
        created += 1;
      } catch (e) {
        console.error(`[migrate] Failed to create for rule ${rule._id}:`, e.message);
        skipped += 1;
      }
    }
  }

  console.log(`[migrate] Done — created=${created} updated=${updated} skipped=${skipped}`);
  process.exit(0);
}

run().catch((e) => {
  console.error('[migrate] Fatal:', e);
  process.exit(1);
});
