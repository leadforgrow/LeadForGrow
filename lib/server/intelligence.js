import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';

/**
 * SERVER-SIDE LEAD INTELLIGENCE
 * The source of truth for lead urgency, scoring, and follow-up hierarchy.
 */

export async function getLeadIntelligence(leadId, businessId) {
    const lead = await Lead.findById(leadId).lean();
    if (!lead) return null;

    // Fetch recent activities to check automation status
    const activities = await Activity.find({ leadId }).sort({ createdAt: -1 }).limit(10).lean();

    const hasSuccessfulHandshake = activities.some(a =>
        a.type === 'automation_executed' &&
        a.metadata?.status === 'success' &&
        (a.metadata?.channel === 'whatsapp' || a.metadata?.channel === 'email')
    );

    const intelligence = computeIntelligence(lead, activities, hasSuccessfulHandshake);

    return {
        ...lead,
        intelligence
    };
}

/**
 * Pure logic function that can be used by both single lead fetch and bulk aggregations
 */
export function computeIntelligence(lead, activities = [], hasSuccessfulHandshake = false) {
    const now = new Date();
    const receivedAt = new Date(lead.receivedAt || lead.createdAt);
    const ageInMinutes = Math.floor((now - receivedAt) / (1000 * 60));

    // 1. SLA & Urgency Hierarchy (Follow-up Rescue)
    let action, urgency, icon, color;

    if (lead.status === 'new') {
        if (ageInMinutes < 2) {
            action = 'Sending Automations...';
            urgency = 'low';
            icon = '📲';
            color = 'bg-blue-600 text-white';
        } else if (ageInMinutes < 10) {
            action = hasSuccessfulHandshake ? 'Call NOW - Warmed' : 'Call NOW - Hot';
            urgency = 'critical';
            icon = '🔥';
            color = 'bg-red-600 text-white';
        } else if (ageInMinutes < 60) {
            action = 'Response Recovery';
            urgency = 'high';
            icon = '⚡';
            color = 'bg-orange-600 text-white';
        } else if (ageInMinutes < 1440) {
            action = 'Missed Opportunity Rescue';
            urgency = 'high';
            icon = '🔄';
            color = 'bg-orange-700 text-white';
        } else {
            action = 'Stale Lead Recovery';
            urgency = 'medium';
            icon = '📁';
            color = 'bg-slate-600 text-white';
        }
    } else if (lead.status === 'contacted') {
        action = 'Schedule Next Step';
        urgency = 'medium';
        icon = '📅';
        color = 'bg-indigo-600 text-white';
    } else if (lead.status === 'follow-up') {
        const updatedAt = new Date(lead.updatedAt);
        const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

        if (daysSinceUpdate >= 1) {
            action = 'Follow-up Recovery';
            urgency = 'high';
            icon = '💰';
            color = 'bg-emerald-600 text-white';
        } else {
            action = 'Continue Nurturing';
            urgency = 'low';
            icon = '💬';
            color = 'bg-slate-600 text-white';
        }
    } else {
        action = 'Engagement Opportunity';
        urgency = 'low';
        icon = '🔄';
        color = 'bg-slate-400 text-white';
    }

    // 2. Engagement Score (0-14)
    let score = 0;
    if (lead.phone) score += 2;
    if (lead.email) score += 2;
    if (lead.message && lead.message.length > 50) score += 4;
    else if (lead.message) score += 2;
    if (hasSuccessfulHandshake) score += 3;
    if (lead.serviceInterest && lead.serviceInterest !== 'General Inquiry') score += 3;

    return {
        nextAction: { action, urgency, icon, color },
        engagementScore: { score, maxScore: 14 },
        slaStatus: {
            breached: (lead.status === 'new' && ageInMinutes > 10) || (lead.status === 'follow-up' && ageInMinutes > 1440),
            ageInMinutes
        },
        automationStatus: {
            handshakeSent: hasSuccessfulHandshake
        }
    };
}
