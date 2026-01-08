import MarketingLayout from '@/app/components/MarketingLayout';

export default function AboutPage() {
  const benefits = [
    {
      title: "Eliminate Revenue Leakage",
      text: "We believe no business should lose a deal because they were 'too busy' to answer a WhatsApp message or an email inquiry."
    },
    {
      title: "Empower Small Teams",
      text: "Our mission is to give solo founders and small agencies the same technological leverage as global corporations."
    },
    {
      title: "Trust & Transparency",
      text: "We build systems that create clear accountability between businesses and their leads, fostering long-term trust."
    },
    {
      title: "Relentless Innovation",
      text: "The lead management landscape changes every day. We stay ahead of the curve so our partners don't have to."
    }
  ];

  const whoIsThisFor = [
    "Mission-driven Founders scaling their impact",
    "Ethical Agencies building long-term client value",
    "Service Providers who care about every inquiry",
    "Growth Hackers who value systems over hustle"
  ];

  const whyItMatters = [
    "LeadForGrow was born out of the frustration of seeing great businesses fail due to poor follow-up systems.",
    "We aren't just a software company; we are an infrastructure partner for the next generation of agencies.",
    "Our goal is to turn lead management from a manual chore into a predictable, automated growth engine.",
    "When you join LeadForGrow, you're joining a movement toward professional, efficient business growth."
  ];

  return (
    <MarketingLayout 
      title="Our Mission: Bridging the Gap Between Hustle and Growth." 
      subtitle="We're on a mission to simplify the agency business model through powerful, unified automation and lead management technology. Because every inquiry deserves a professional response."
      benefits={benefits}
      whoIsThisFor={whoIsThisFor}
      whyItMatters={whyItMatters}
      ctaText="Join the Movement"
    />
  );
}
