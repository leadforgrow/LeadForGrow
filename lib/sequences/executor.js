import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import Lead from '@/models/automation/Lead';
import { sendCustomerEmail } from '@/lib/integrations/email';
import { sendAutoWhatsApp } from '@/lib/integrations/whatsapp';

function applyVars(text, lead, business) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/gi, lead.name || '')
    .replace(/\{\{lead\.name\}\}/gi, lead.name || '')
    .replace(/\{\{phone\}\}/gi, lead.phone || '')
    .replace(/\{\{lead\.phone\}\}/gi, lead.phone || '')
    .replace(/\{\{email\}\}/gi, lead.email || '')
    .replace(/\{\{lead\.email\}\}/gi, lead.email || '')
    .replace(/\{\{business\.name\}\}/gi, business?.businessName || '')
    .replace(/\{\{serviceInterest\}\}/gi, lead.serviceInterest || '');
}

/**
 * Execute a single workflow node
 */
export async function executeNode(node, lead, business, execution) {
  const data = node.data || {};
  const log = { nodeId: node.id, nodeType: node.type, status: 'running', executedAt: new Date() };

  try {
    switch (node.type) {
      case 'send_whatsapp': {
        const msg = applyVars(data.message || data.body || '', lead, business);
        const result = await sendAutoWhatsApp(lead, business, msg);
        log.status = result.success ? 'success' : 'failed';
        log.message = result.success ? 'WhatsApp sent' : (result.error || 'WhatsApp failed');
        log.metadata = { channel: 'whatsapp' };
        break;
      }
      case 'send_email': {
        const body = applyVars(data.body || data.message || '', lead, business);
        const subject = applyVars(data.subject || 'Message from us', lead, business);
        const result = await sendCustomerEmail(lead, business, body, subject);
        log.status = result.success ? 'success' : 'failed';
        log.message = result.success ? 'Email sent' : (result.error || 'Email failed');
        log.metadata = { channel: 'email' };
        break;
      }
      case 'assign_agent':
        await Lead.updateOne({ _id: lead._id }, { $set: { 'metadata.autoAssigned': true, 'metadata.assignmentStrategy': data.strategy || 'round-robin' } });
        log.status = 'success';
        log.message = 'Agent assignment queued';
        break;
      case 'add_tag': {
        const tag = data.tag || 'automated';
        await Lead.updateOne({ _id: lead._id }, { $addToSet: { tags: tag } });
        log.status = 'success';
        log.message = `Tag "${tag}" added`;
        break;
      }
      case 'create_task':
        await Task.create({
          businessId: business._id,
          leadId: lead._id,
          title: applyVars(data.title || 'Follow up', lead, business),
          description: 'Created by sequence automation',
          status: 'pending',
          priority: data.priority || 'medium',
          dueDate: new Date(Date.now() + (data.dueHours || 24) * 3600000),
          assignedTo: lead.assignedTo,
        });
        log.status = 'success';
        log.message = 'Task created';
        break;
      case 'move_pipeline':
        await Lead.updateOne({ _id: lead._id }, { $set: { status: data.stage || 'contacted' } });
        log.status = 'success';
        log.message = `Moved to ${data.stage || 'contacted'}`;
        break;
      case 'notify_team':
        log.status = 'success';
        log.message = 'Team notification logged';
        break;
      case 'delay':
        log.status = 'success';
        log.message = `Delay ${data.delayHours || 0}h ${data.delayMinutes || 0}m scheduled`;
        log.metadata = { delayMs: ((data.delayHours || 0) * 3600000) + ((data.delayMinutes || 0) * 60000) };
        break;
      case 'condition': {
        const passed = evaluateCondition(data, lead);
        log.status = 'success';
        log.message = passed ? 'Condition passed' : 'Condition failed';
        log.metadata = { branch: passed ? 'true' : 'false' };
        break;
      }
      case 'wait_until':
        log.status = 'success';
        log.message = 'Wait until scheduled';
        log.metadata = { waitUntil: data.datetime };
        break;
      case 'webhook':
        log.status = 'success';
        log.message = 'Webhook triggered (configure URL in node settings)';
        log.metadata = { url: data.url };
        break;
      case 'ai_whatsapp_reply':
      case 'ai_qualification':
      case 'ai_scoring':
      case 'ai_intent':
      case 'ai_followup_timing': {
        const aiMsg = applyVars(data.message || `Hi ${lead.name}, thanks for reaching out! How can we help you today?`, lead, business);
        const result = await sendAutoWhatsApp(lead, business, aiMsg);
        log.status = result.success ? 'success' : 'failed';
        log.message = `AI action: ${node.type.replace('ai_', '')}`;
        log.metadata = { ai: true, tone: data.tone };
        break;
      }
      case 'end':
        log.status = 'success';
        log.message = 'Sequence completed';
        return { log, complete: true };
      default:
        if (node.type?.startsWith('trigger_')) {
          log.status = 'success';
          log.message = 'Trigger passed';
          break;
        }
        log.status = 'skipped';
        log.message = `Unknown node type: ${node.type}`;
    }

    await Activity.create({
      leadId: lead._id,
      businessId: business._id,
      type: 'automation_executed',
      description: log.message,
      performedBy: business.ownerId,
      metadata: { sequenceExecutionId: execution._id, nodeId: node.id, nodeType: node.type, ...log.metadata },
    });

    return { log, complete: false };
  } catch (err) {
    log.status = 'failed';
    log.message = err.message;
    return { log, complete: false, error: err.message };
  }
}

function evaluateCondition(data, lead) {
  const field = data.field || 'status';
  const op = data.operator || 'equals';
  const val = data.value;
  const actual = field === 'score' ? (lead.metadata?.score ?? 0) : (lead[field] ?? lead.metadata?.[field]);
  switch (op) {
    case 'equals': return String(actual) === String(val);
    case 'not_equals': return String(actual) !== String(val);
    case 'gte': return Number(actual) >= Number(val);
    case 'lte': return Number(actual) <= Number(val);
    case 'contains': return String(actual).toLowerCase().includes(String(val).toLowerCase());
    default: return true;
  }
}

export function getOutgoingEdges(sequence, nodeId, branch) {
  const edges = sequence.edges || [];
  return edges.filter((e) => {
    if (e.source !== nodeId) return false;
    if (branch && e.label) return e.label.toLowerCase() === branch.toLowerCase();
    if (branch === 'false') return e.label?.toLowerCase() === 'no' || e.sourceHandle === 'false';
    if (branch === 'true') return !e.label || e.label?.toLowerCase() === 'yes' || e.sourceHandle === 'true';
    return true;
  });
}

export function findTriggerNode(sequence) {
  return (sequence.nodes || []).find((n) => n.type?.startsWith('trigger_'));
}

export function findStartNode(sequence) {
  const trigger = findTriggerNode(sequence);
  if (!trigger) return (sequence.nodes || [])[0];
  const edge = (sequence.edges || []).find((e) => e.source === trigger.id);
  if (edge) return (sequence.nodes || []).find((n) => n.id === edge.target);
  return trigger;
}
