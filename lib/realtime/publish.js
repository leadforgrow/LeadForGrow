import { publishEvent } from './hub';
import { REALTIME_EVENTS } from './constants';

export { REALTIME_EVENTS };

export async function emitChatMessage(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.CHAT_MESSAGE, data });
}

export async function emitChatRead(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.CHAT_READ, data });
}

export async function emitChatMessageStatus(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.CHAT_MESSAGE_STATUS, data });
}

export async function emitChatTyping(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.CHAT_TYPING, data });
}

export async function emitNotification(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.NOTIFICATION, data });
}

export async function emitLeadAssigned(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.LEAD_ASSIGNED, data });
}

export async function emitLeadUpdated(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.LEAD_UPDATED, data });
}

export async function emitTaskUpdated(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.TASK_UPDATED, data });
}

export async function emitSequenceStep(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.SEQUENCE_STEP, data });
}

export async function emitDashboardMetrics(businessId, data) {
  return publishEvent(businessId, { type: REALTIME_EVENTS.DASHBOARD_METRICS, data });
}
