import MarketingLayout from '@/app/components/MarketingLayout';

export default function UseCases() {
  const benefits = [
    {
      title: "Modern Hospitals & Clinics",
      text: "Manage patient enquiries, appointment requests, and follow-ups securely. Ensure no patient is left waiting for a callback."
    },
    {
      title: "Real Estate & High-Ticket Sales",
      text: "Capture buyer intent from property pages and automate the initial nurturing process for your agents."
    },
    {
      title: "Multi-Client Marketing Agencies",
      text: "Standardize your fulfillment tech. Build, launch, and report on client leads from one unified agency command center."
    },
    {
      title: "Local Service Businesses",
      text: "HVAC, Plumbing, or Legal. Turn your local presence into a 24/7 lead machine that responds even when you're on a job."
    }
  ];

  const whoIsThisFor = [
    "Healthcare Providers needing better patient inquiry management",
    "Agencies looking for a competitive edge in fulfillment",
    "Local Service Business Owners tired of missing calls",
    "Professional Sales Teams handling complex B2B deals"
  ];

  const whyItMatters = [
    "Different industries have different pains, but 'Missed Leads' is a universal revenue killer.",
    "Tailored workflows mean you don't have to force your business into a generic tool.",
    "Sector-specific automation ensures you meet the unique expectations of your prospects.",
    "LeadForGrow is flexible enough to handle the most demanding industry requirements."
  ];

  return (
    <MarketingLayout 
      title="Tailored Solutions for Every Growth Stage." 
      subtitle="Discover how LeadForGrow solves industry-specific challenges for agencies, hospitals, and high-performance sales teams."
      benefits={benefits}
      whoIsThisFor={whoIsThisFor}
      whyItMatters={whyItMatters}
      ctaText="See My Industry's Solution"
    />
  );
}
