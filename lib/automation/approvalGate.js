/**
 * Workflow approval gates and A/B variant selection.
 */

const CHANNEL_ACTIONS = ['send_whatsapp', 'send_email', 'send_instagram_dm'];

export function requiresApproval(node, business, lead) {
  const rules = business?.settings?.automation?.approvalRules || {};
  if (!rules.requireApproval && !rules.enabled) return null;

  if (!CHANNEL_ACTIONS.includes(node.type)) return null;

  const channels = rules.channels || ['whatsapp', 'email', 'instagram'];
  const channelMap = {
    send_whatsapp: 'whatsapp',
    send_email: 'email',
    send_instagram_dm: 'instagram',
  };
  const channel = channelMap[node.type];
  if (channels.length && !channels.includes(channel)) return null;

  const dealValue = lead?.metadata?.dealValue || lead?.metadata?.get?.('dealValue') || 0;
  const minAmount = rules.minDealAmount || rules.thresholdAmount || 0;
  if (minAmount > 0 && dealValue < minAmount) return null;

  return {
    reason: rules.reason || `Approval required for ${channel} messages`,
    approverRoles: rules.approverRoles || ['admin', 'owner', 'CLIENT_ADMIN'],
    sequential: rules.sequential !== false,
    parallel: rules.parallel === true,
  };
}

export function pickAbVariant(sequence) {
  if (!sequence?.abTest?.enabled || !sequence.abTest.variants?.length) {
    return { variantId: null, nodes: sequence.nodes, edges: sequence.edges };
  }

  const variants = sequence.abTest.variants;
  const totalWeight = variants.reduce((s, v) => s + (v.weight || 1), 0);
  let r = Math.random() * totalWeight;

  for (const v of variants) {
    r -= v.weight || 1;
    if (r <= 0) {
      return {
        variantId: v.id,
        nodes: v.nodes?.length ? v.nodes : sequence.nodes,
        edges: v.edges?.length ? v.edges : sequence.edges,
      };
    }
  }

  const fallback = variants[0];
  return {
    variantId: fallback.id,
    nodes: fallback.nodes?.length ? fallback.nodes : sequence.nodes,
    edges: fallback.edges?.length ? fallback.edges : sequence.edges,
  };
}

export function compareAbVariants(analyticsByVariant = []) {
  if (analyticsByVariant.length < 2) return null;

  const scored = analyticsByVariant.map((v) => {
    const replyRate = v.replies / Math.max(1, v.sent);
    const conversionRate = v.conversions / Math.max(1, v.enrolled);
    const score = replyRate * 0.4 + conversionRate * 0.4 + (v.revenue / Math.max(1, v.enrolled)) * 0.2;
    return { ...v, score, replyRate, conversionRate };
  });

  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0];
  const runner = scored[1];
  const lift = runner.score > 0 ? ((winner.score - runner.score) / runner.score) * 100 : 100;

  return {
    winner: winner.variantId,
    winnerName: winner.name,
    liftPercent: Math.round(lift),
    comparison: scored,
    autoSelect: lift > 10,
  };
}
