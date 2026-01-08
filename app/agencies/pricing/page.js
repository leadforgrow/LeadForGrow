'use client';

import MarketingLayout from '@/app/components/MarketingLayout';

export default function AgencyPricingPage() {
  const benefits = [
    {
      title: "Scalable Per-Account Pricing",
      text: "Stop paying per-seat. Our agency plans are designed to scale with your client load, ensuring your margins stay high."
    },
    {
      title: "High-Margin Bundling",
      text: "Bundle our world-class automation tech with your management services and charge a premium for a complete solution."
    },
    {
      title: "No Hidden Implementation Fees",
      text: "Transparent pricing includes all core builder and CRM features. Pay one flat monthly fee as your agency grows."
    },
    {
      title: "White-Label Upsell Potential",
      text: "Access white-labeling features that allow you to resell the platform as your own proprietary tech stack."
    }
  ];

  const whoIsThisFor = [
    "Growth-focused agencies managing 5+ clients",
    "Fulfillment teams looking for standardized pricing",
    "Solo freelancers wanting to look like a global agency",
    "SaaS resellers building custom lead gen bundles"
  ];

  const whyItMatters = [
    "Predictable costs are the foundation of a successful and profitable agency business model.",
    "Traditional enterprise software is too expensive for most agencies to build as a service.",
    "Standardized pricing allows you to quote clients faster and with more confidence.",
    "LeadForGrow gives you the elite technology you need at a price that respects your bottom line."
  ];

  return (
    <MarketingLayout 
      title="Scalable Pricing Built for Agency Profits." 
      subtitle="Elite technology shouldn't break your bank. Choose a plan that scales with your client base and unlocks recurring revenue."
      benefits={benefits}
      whoIsThisFor={whoIsThisFor}
      whyItMatters={whyItMatters}
      ctaText="View Agency Plans"
    />
  );
}
