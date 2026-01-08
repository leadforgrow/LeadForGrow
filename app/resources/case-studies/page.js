import MarketingLayout from '@/app/components/MarketingLayout';

export default function CaseStudiesPage() {
  const benefits = [
    {
      title: "200% Increase in Lead Capture",
      text: "How a local real estate agency doubled their monthly enquiries by switching from static forms to LeadForGrow widgets."
    },
    {
      title: "From 60-Minute to 5-Minute Response",
      text: "How a multi-location clinic used our automation to drastically reduce speed-to-lead and improve patient satisfaction."
    },
    {
      title: "Scaling to 50+ Clients Without New Staff",
      text: "How a boutique marketing agency used our multi-tenant platform to scale their fulfillment operations 5x."
    },
    {
      title: "35% Boost in Sales Conversions",
      text: "How a B2B sales team used our CRM and auto-followups to re-engage dead leads and turn them into won deals."
    }
  ];

  const whoIsThisFor = [
    "Strategic Founders looking for proof of ROI",
    "Decision Makers needing validation from similar peers",
    "Agencies wanting to see real-world platform performance",
    "Businesses planning their next major growth phase"
  ];

  const whyItMatters = [
    "Theories are good, but data and outcomes are better properly.",
    "Learning from others' success prevents you from making expensive mistakes.",
    "Clear ROI metrics help you justify the investment in your growth technology.",
    "LeadForGrow success stories are not just testimonials; they are blueprints for your growth."
  ];

  return (
    <MarketingLayout 
      title="Proven Outcomes. Real Growth. Real Data." 
      subtitle="Discover how agencies and businesses around the world use LeadForGrow to transform their lead management and close more deals."
      benefits={benefits}
      whoIsThisFor={whoIsThisFor}
      whyItMatters={whyItMatters}
      ctaText="View Success Stories"
    />
  );
}
