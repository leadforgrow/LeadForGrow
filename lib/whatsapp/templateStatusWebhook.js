import WhatsAppTemplate from '@/models/automation/WhatsAppTemplate';
import Business from '@/models/Business';

/**
 * Handle Meta `message_template_status_update` and `template_category_update`
 * webhook events. Returns { processed, updated, skipped, notFound } for logging.
 *
 * Meta payload shape:
 *   {
 *     object: 'whatsapp_business_account',
 *     entry: [{
 *       id: '<WABA_ID>',
 *       changes: [{
 *         field: 'message_template_status_update',
 *         value: {
 *           event: 'APPROVED' | 'REJECTED' | 'PENDING_DELETION' | 'FLAGGED' | ...,
 *           message_template_id: '123',
 *           message_template_name: 'order_confirmation',
 *           message_template_language: 'en_US',
 *           reason: 'NONE' | 'INVALID_FORMAT' | 'PROMOTIONAL' | ...,
 *         }
 *       }]
 *     }]
 *   }
 */
export async function processTemplateStatusPayload(payload) {
  const result = { processed: 0, updated: 0, skipped: 0, notFound: 0, businessesTouched: new Set() };

  const entries = payload?.entry || [];
  for (const entry of entries) {
    const wabaId = entry.id;
    if (!wabaId) continue;

    const business = await Business.findOne({
      'integrationCredentials.whatsapp.businessAccountId': wabaId,
    }).select('_id');
    if (!business) {
      result.notFound += (entry.changes || []).length;
      continue;
    }
    result.businessesTouched.add(String(business._id));

    for (const change of (entry.changes || [])) {
      if (change.field !== 'message_template_status_update' && change.field !== 'template_category_update') {
        result.skipped += 1;
        continue;
      }
      const v = change.value || {};
      result.processed += 1;

      const metaTemplateId = v.message_template_id || v.template_id;
      const templateName = v.message_template_name || v.template_name;
      const language = v.message_template_language || v.template_language;

      const query = { businessId: business._id };
      if (metaTemplateId) {
        query.metaTemplateId = String(metaTemplateId);
      } else if (templateName) {
        query.name = String(templateName).toLowerCase();
        if (language) query.language = language;
      } else {
        result.skipped += 1;
        continue;
      }

      const template = await WhatsAppTemplate.findOne(query);
      if (!template) {
        result.notFound += 1;
        continue;
      }

      if (change.field === 'message_template_status_update') {
        const nextStatus = String(v.event || 'PENDING').toUpperCase();
        template.status = nextStatus;
        template.metaStatus = nextStatus;
        if (v.reason && v.reason !== 'NONE') {
          template.metaRejectionReason = v.reason;
        } else if (nextStatus === 'APPROVED') {
          template.metaRejectionReason = undefined;
        }
        if (metaTemplateId && !template.metaTemplateId) {
          template.metaTemplateId = String(metaTemplateId);
        }
      }

      if (change.field === 'template_category_update' && v.new_category) {
        template.metaCategoryChangedTo = String(v.new_category).toUpperCase();
      }

      template.metaLastCheckedAt = new Date();
      await template.save();
      result.updated += 1;
    }
  }

  result.businessesTouched = Array.from(result.businessesTouched);
  return result;
}

export default { processTemplateStatusPayload };
