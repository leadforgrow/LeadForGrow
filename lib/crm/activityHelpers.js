/**
 * Build Activity document fields with required universal timeline entity refs.
 */
export function leadActivityFields(base, leadId, fields = {}) {
  return {
    ...base,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    ...fields,
  };
}

export function entityActivityFields(base, entityType, entityId, fields = {}) {
  return {
    ...base,
    entityType,
    entityId,
    ...fields,
  };
}
