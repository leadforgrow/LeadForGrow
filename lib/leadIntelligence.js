/**
 * LEAD INTELLIGENCE LAYER
 * Enterprise-grade computed fields for lead decision-making
 * All calculations are derived, never stored in DB
 */

/**
 * 1️⃣ LEAD AGE (Time Intelligence)
 * Computes how old the lead is and returns urgency classification
 */
export function computeLeadAge(receivedAt) {
  const now = new Date();
  const received = new Date(receivedAt);
  const ageInMinutes = Math.floor((now - received) / (1000 * 60));
  const ageInHours = Math.floor(ageInMinutes / 60);
  const ageInDays = Math.floor(ageInHours / 24);

  let classification, urgencyLevel, displayText, color;

  if (ageInMinutes < 10) {
    classification = 'fresh';
    urgencyLevel = 5;
    displayText = `${ageInMinutes}m ago`;
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (ageInMinutes < 60) {
    classification = 'aging';
    urgencyLevel = 4;
    displayText = `${ageInMinutes}m ago`;
    color = 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (ageInHours < 24) {
    classification = 'at-risk';
    urgencyLevel = 3;
    displayText = `${ageInHours}h ago`;
    color = 'text-red-600 bg-red-50 border-red-200';
  } else if (ageInDays < 7) {
    classification = 'cold';
    urgencyLevel = 2;
    displayText = `${ageInDays}d ago`;
    color = 'text-slate-600 bg-slate-50 border-slate-200';
  } else {
    classification = 'stale';
    urgencyLevel = 1;
    displayText = `${ageInDays}d ago`;
    color = 'text-slate-400 bg-slate-50 border-slate-200';
  }

  return {
    ageInMinutes,
    ageInHours,
    ageInDays,
    classification,
    urgencyLevel,
    displayText,
    color
  };
}

/**
 * 2️⃣ LAST ACTION SUMMARY
 * Determines the most recent human/system interaction
 */
export function computeLastAction(lead) {
  // Check if notes/actions exist (assuming these might be in lead.notes or lead.actions)
  const actions = lead.actions || [];
  const notes = lead.notes || [];
  
  if (actions.length === 0 && notes.length === 0) {
    return {
      text: 'No action taken',
      timestamp: null,
      type: 'none',
      color: 'text-slate-400'
    };
  }

  // Get most recent action
  const allActivities = [
    ...actions.map(a => ({ ...a, source: 'action' })),
    ...notes.map(n => ({ ...n, source: 'note' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const latest = allActivities[0];
  const timeAgo = computeTimeAgo(latest.createdAt);

  return {
    text: `${latest.type || latest.source} ${timeAgo}`,
    timestamp: latest.createdAt,
    type: latest.type || latest.source,
    color: 'text-indigo-600'
  };
}

/**
 * 3️⃣ NEXT ACTION REQUIRED (Critical Decision Engine)
 * The most important field - tells users exactly what to do
 */
export function computeNextAction(lead) {
  const leadAge = computeLeadAge(lead.receivedAt);
  const { status, priority } = lead;

  let action, urgency, color, icon;

  // NEW LEADS - Time-based urgency
  if (status === 'new') {
    if (leadAge.ageInMinutes < 10) {
      action = 'Call NOW - Hot lead!';
      urgency = 'critical';
      color = 'bg-red-600 text-white border-red-700';
      icon = '🔥';
    } else if (leadAge.ageInMinutes < 30) {
      action = 'Call within 10 min';
      urgency = 'high';
      color = 'bg-orange-600 text-white border-orange-700';
      icon = '⚡';
    } else if (leadAge.ageInMinutes < 60) {
      action = 'Follow-up overdue';
      urgency = 'high';
      color = 'bg-orange-600 text-white border-orange-700';
      icon = '⏰';
    } else {
      action = 'Recovery call needed';
      urgency = 'medium';
      color = 'bg-yellow-600 text-white border-yellow-700';
      icon = '🔄';
    }
  }
  // CONTACTED - Schedule next step
  else if (status === 'contacted') {
    action = 'Schedule follow-up';
    urgency = 'medium';
    color = 'bg-indigo-600 text-white border-indigo-700';
    icon = '📅';
  }
  // FOLLOW-UP - Continue nurturing
  else if (status === 'follow-up') {
    const daysSinceUpdate = Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 3) {
      action = 'Touch base - 3+ days';
      urgency = 'medium';
      color = 'bg-yellow-600 text-white border-yellow-700';
      icon = '📞';
    } else {
      action = 'Continue nurturing';
      urgency = 'low';
      color = 'bg-blue-600 text-white border-blue-700';
      icon = '💬';
    }
  }
  // CONVERTED - Done!
  else if (status === 'converted') {
    action = 'Request testimonial';
    urgency = 'low';
    color = 'bg-emerald-600 text-white border-emerald-700';
    icon = '✅';
  }
  // ARCHIVED/LOST - Re-engagement opportunity
  else if (status === 'archived' || status === 'lost') {
    const monthsSinceLost = Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24 * 30));
    if (monthsSinceLost > 3) {
      action = 'Re-engagement opportunity';
      urgency = 'low';
      color = 'bg-slate-600 text-white border-slate-700';
      icon = '🔄';
    } else {
      action = 'No action needed';
      urgency = 'none';
      color = 'bg-slate-400 text-white border-slate-500';
      icon = '⏸️';
    }
  }
  // DEFAULT
  else {
    action = 'Review and update';
    urgency = 'low';
    color = 'bg-slate-600 text-white border-slate-700';
    icon = '👀';
  }

  return { action, urgency, color, icon };
}

/**
 * 4️⃣ SLA BREACH INDICATOR
 * Enterprise SLAs based on priority
 */
export function computeSLAStatus(lead) {
  const leadAge = computeLeadAge(lead.receivedAt);
  const { priority, status } = lead;

  // Only check SLA for active leads
  if (status === 'converted' || status === 'archived' || status === 'lost') {
    return {
      status: 'completed',
      breached: false,
      message: 'Lead closed',
      color: 'text-slate-400 bg-slate-50'
    };
  }

  let slaMinutes, breached, status_text, color;

  // Define SLA windows by priority
  switch (priority) {
    case 'high':
      slaMinutes = 10;
      break;
    case 'medium':
      slaMinutes = 30;
      break;
    case 'low':
      slaMinutes = 120; // 2 hours
      break;
    default:
      slaMinutes = 60; // 1 hour default
  }

  breached = leadAge.ageInMinutes > slaMinutes;
  
  if (breached) {
    const overdue = leadAge.ageInMinutes - slaMinutes;
    status_text = 'SLA Breached';
    color = 'text-red-700 bg-red-100 border-red-300';
    
    return {
      status: status_text,
      breached: true,
      overdueMinutes: overdue,
      slaMinutes,
      message: `${overdue}m overdue`,
      color
    };
  } else {
    const remaining = slaMinutes - leadAge.ageInMinutes;
    status_text = 'On Track';
    color = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    
    return {
      status: status_text,
      breached: false,
      remainingMinutes: remaining,
      slaMinutes,
      message: `${remaining}m remaining`,
      color
    };
  }
}

/**
 * 5️⃣ JOURNEY STAGE (Pipeline Awareness)
 * Maps status to customer journey stage
 */
export function computeJourneyStage(status) {
  const stageMap = {
    'new': {
      stage: 'Incoming',
      description: 'Lead just arrived',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: '📥',
      order: 1
    },
    'contacted': {
      stage: 'Qualified',
      description: 'Initial contact made',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      icon: '✓',
      order: 2
    },
    'follow-up': {
      stage: 'In Discussion',
      description: 'Active conversation',
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      icon: '💬',
      order: 3
    },
    'converted': {
      stage: 'Closed Won',
      description: 'Successfully converted',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      icon: '🎉',
      order: 4
    },
    'archived': {
      stage: 'Closed Lost',
      description: 'Not converted',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: '📁',
      order: 5
    },
    'lost': {
      stage: 'Closed Lost',
      description: 'Lost opportunity',
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: '❌',
      order: 5
    }
  };

  return stageMap[status] || stageMap['new'];
}

/**
 * 6️⃣ ENGAGEMENT SCORE (Behavioral Intelligence)
 * Computed quality indicator based on lead attributes and behavior
 */
export function computeEngagementScore(lead) {
  let score = 0;
  const reasons = [];

  // Contact information quality
  if (lead.phone) {
    score += 2;
    reasons.push('Phone provided');
  }
  if (lead.whatsapp) {
    score += 2;
    reasons.push('WhatsApp available');
  }
  if (lead.email && lead.email.includes('@')) {
    score += 2;
    reasons.push('Valid email');
  }

  // Message quality
  if (lead.message && lead.message.length > 50) {
    score += 3;
    reasons.push('Detailed message');
  } else if (lead.message && lead.message.length > 10) {
    score += 1;
    reasons.push('Message provided');
  }

  // Response time (if contacted within SLA)
  const sla = computeSLAStatus(lead);
  if (!sla.breached && lead.status !== 'new') {
    score += 3;
    reasons.push('Responded on time');
  }

  // Penalty for delayed action
  const leadAge = computeLeadAge(lead.receivedAt);
  if (lead.status === 'new' && leadAge.ageInHours > 1) {
    score -= 2;
    reasons.push('Delayed response');
  }

  // Service interest specificity
  if (lead.serviceInterest && lead.serviceInterest !== 'General Inquiry') {
    score += 2;
    reasons.push('Specific interest');
  }

  // Classify score
  let level, color, description;
  if (score >= 8) {
    level = 'High';
    color = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    description = 'Strong engagement signals';
  } else if (score >= 4) {
    level = 'Medium';
    color = 'text-yellow-700 bg-yellow-100 border-yellow-300';
    description = 'Moderate engagement';
  } else {
    level = 'Low';
    color = 'text-slate-700 bg-slate-100 border-slate-300';
    description = 'Limited engagement data';
  }

  return {
    score,
    level,
    color,
    description,
    reasons,
    maxScore: 14
  };
}

/**
 * 7️⃣ SOURCE QUALITY SIGNAL
 * Historical performance of lead source (requires aggregated data)
 */
export function computeSourceQuality(source, sourceStats = null) {
  // If no stats provided, return default
  if (!sourceStats) {
    return {
      quality: 'Unknown',
      conversionRate: null,
      color: 'text-slate-600 bg-slate-100 border-slate-300',
      description: 'No historical data'
    };
  }

  const { conversions = 0, total = 1 } = sourceStats;
  const conversionRate = (conversions / total) * 100;

  let quality, color, description;

  if (conversionRate >= 20) {
    quality = 'High';
    color = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    description = 'Top performing source';
  } else if (conversionRate >= 10) {
    quality = 'Medium';
    color = 'text-yellow-700 bg-yellow-100 border-yellow-300';
    description = 'Average performing source';
  } else {
    quality = 'Low';
    color = 'text-red-700 bg-red-100 border-red-300';
    description = 'Underperforming source';
  }

  return {
    quality,
    conversionRate: conversionRate.toFixed(1),
    color,
    description,
    totalLeads: total,
    conversions
  };
}

/**
 * 8️⃣ OWNER LOAD CONTEXT
 * Helps identify overloaded team members
 */
export function computeOwnerLoad(assignedUserId, allLeads) {
  if (!assignedUserId) {
    return {
      activeLeads: 0,
      load: 'unassigned',
      color: 'text-slate-600 bg-slate-100',
      recommendation: 'Assign to available rep'
    };
  }

  // Count active leads for this user
  const userLeads = allLeads.filter(lead => 
    lead.assignedTo === assignedUserId && 
    !['converted', 'archived', 'lost'].includes(lead.status)
  );

  const activeCount = userLeads.length;
  let load, color, recommendation;

  if (activeCount > 50) {
    load = 'overloaded';
    color = 'text-red-700 bg-red-100 border-red-300';
    recommendation = 'Consider reassignment';
  } else if (activeCount > 30) {
    load = 'high';
    color = 'text-orange-700 bg-orange-100 border-orange-300';
    recommendation = 'Monitor workload';
  } else if (activeCount > 15) {
    load = 'moderate';
    color = 'text-yellow-700 bg-yellow-100 border-yellow-300';
    recommendation = 'Healthy load';
  } else if (activeCount > 0) {
    load = 'light';
    color = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    recommendation = 'Can take more leads';
  } else {
    load = 'available';
    color = 'text-blue-700 bg-blue-100 border-blue-300';
    recommendation = 'Ready for assignment';
  }

  return {
    activeLeads: activeCount,
    load,
    color,
    recommendation
  };
}

/**
 * MASTER FUNCTION: Compute all intelligence for a lead
 * This is what you call to get the full intelligence layer
 */
export function computeLeadIntelligence(lead, allLeads = [], sourceStats = null) {
  const leadAge = computeLeadAge(lead.receivedAt);
  const lastAction = computeLastAction(lead);
  const nextAction = computeNextAction(lead);
  const slaStatus = computeSLAStatus(lead);
  const journeyStage = computeJourneyStage(lead.status);
  const engagementScore = computeEngagementScore(lead);
  const sourceQuality = computeSourceQuality(lead.source, sourceStats);
  const ownerLoad = computeOwnerLoad(lead.assignedTo, allLeads);

  return {
    // Original lead data
    ...lead,
    
    // Computed intelligence
    intelligence: {
      leadAge,
      lastAction,
      nextAction,
      slaStatus,
      journeyStage,
      engagementScore,
      sourceQuality,
      ownerLoad
    }
  };
}

/**
 * HELPER: Compute time ago from timestamp
 */
function computeTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * AGGREGATION: Get source statistics (for backend API)
 * This should be called periodically and cached
 */
export function aggregateSourceStats(allLeads) {
  const sourceMap = {};

  allLeads.forEach(lead => {
    const source = lead.source || 'direct';
    
    if (!sourceMap[source]) {
      sourceMap[source] = {
        total: 0,
        conversions: 0,
        new: 0,
        contacted: 0
      };
    }

    sourceMap[source].total++;
    
    if (lead.status === 'converted') {
      sourceMap[source].conversions++;
    }
    if (lead.status === 'new') {
      sourceMap[source].new++;
    }
    if (lead.status === 'contacted') {
      sourceMap[source].contacted++;
    }
  });

  return sourceMap;
}