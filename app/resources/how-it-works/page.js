import MarketingLayout from '@/app/components/MarketingLayout';

export default function HowItWorks() {
  const benefits = [
    {
      title: "1. Capture",
      text: "Visitors engage with your high-converting LeadForGrow website or an embedded widget on your legacy site. Our intelligent forms ensure no enquiry is missed."
    },
    {
      title: "2. Assign",
      text: "Leads are instantly routed to the right team member based on your custom assignment rules (Round-Robin, Expertise, or Territory)."
    },
    {
      title: "3. Engage",
      text: "The system triggers instant automated responses via Email and WhatsApp, keeping the prospect warm while your team prepares."
    },
    {
      title: "4. Close",
      text: "Manage the entire conversation and status within our simple CRM. Track won/lost leads and measure your team's closing efficiency."
    }
  ];

  const whoIsThisFor = [
    "Businesses looking for a documented, repeatable sales process",
    "Agencies wanting to show transparency to their clients",
    "Technical Founders who appreciate clean, logical workflows",
    "Sales Teams needing better structure and accountability"
  ];

  const whyItMatters = [
    "A clear process is the difference between a 'Hustle' and a 'Business'.",
    "Knowing exactly where a lead is in the funnel reduces stress and improves outcome.",
    "Documentation allows you to train new team members in hours, not weeks.",
    "LeadForGrow turns your vision for growth into a tangible, executable reality."
  ];

  return (
    <MarketingLayout 
      title="See LeadForGrow in Action." 
      subtitle="From the first click to a closed deal. Discover how our integrated platform handles the entire lead lifecycle on autopilot."
      benefits={benefits}
      whoIsThisFor={whoIsThisFor}
      whyItMatters={whyItMatters}
      ctaText="Start Free Trial"
    />
  );
}
