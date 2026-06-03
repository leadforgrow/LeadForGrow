/**
 * Billing plan catalog — maps to Stripe/Razorpay price IDs via env.
 */
export const BILLING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    priceInr: 0,
    priceUsd: 0,
    quotas: {
      maxLeadsPerMonth: 50,
      maxForms: 1,
      maxTeamMembers: 1,
      maxAutomationRules: 3,
      maxWhatsappConversations: 100,
      maxAiCredits: 10,
      maxAutomationRuns: 50,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceInr: 1499,
    priceUsd: 19,
    stripePriceEnv: 'STRIPE_PRICE_GROWTH',
    razorpayPlanEnv: 'RAZORPAY_PLAN_GROWTH',
    quotas: {
      maxLeadsPerMonth: 500,
      maxForms: 3,
      maxTeamMembers: 3,
      maxAutomationRules: 15,
      maxWhatsappConversations: 2000,
      maxAiCredits: 100,
      maxAutomationRuns: 500,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceInr: 4999,
    priceUsd: 59,
    stripePriceEnv: 'STRIPE_PRICE_PRO',
    razorpayPlanEnv: 'RAZORPAY_PLAN_PRO',
    quotas: {
      maxLeadsPerMonth: 2000,
      maxForms: 7,
      maxTeamMembers: 7,
      maxAutomationRules: 30,
      maxWhatsappConversations: 10000,
      maxAiCredits: 500,
      maxAutomationRuns: 2000,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    priceInr: 14999,
    priceUsd: 179,
    stripePriceEnv: 'STRIPE_PRICE_AGENCY',
    razorpayPlanEnv: 'RAZORPAY_PLAN_AGENCY',
    quotas: {
      maxLeadsPerMonth: 999999,
      maxForms: 999999,
      maxTeamMembers: 25,
      maxAutomationRules: 999999,
      maxWhatsappConversations: 999999,
      maxAiCredits: 2000,
      maxAutomationRuns: 999999,
    },
  },
};

export function getBillingPlan(planId) {
  return BILLING_PLANS[planId] || BILLING_PLANS.free;
}

export function getStripePriceId(planId) {
  const plan = getBillingPlan(planId);
  if (!plan.stripePriceEnv) return null;
  return process.env[plan.stripePriceEnv] || null;
}
