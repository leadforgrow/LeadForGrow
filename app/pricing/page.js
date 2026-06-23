'use client';

import MarketingShell from '@/app/components/marketing/MarketingShell';
import PricingHero from '@/app/components/pricing/PricingHero';
import PricingPlans from '@/app/components/pricing/PricingPlans';
import ComparisonMatrix from '@/app/components/pricing/ComparisonMatrix';
import AddonsSection from '@/app/components/pricing/AddonsSection';
import RoiCalculator from '@/app/components/pricing/RoiCalculator';
import UsageLimitsSection from '@/app/components/pricing/UsageLimitsSection';
import OnboardingTimeline from '@/app/components/pricing/OnboardingTimeline';
import EnterpriseSection from '@/app/components/pricing/EnterpriseSection';
import PricingFAQ from '@/app/components/pricing/PricingFAQ';
import PricingFinalCTA from '@/app/components/pricing/PricingFinalCTA';

export default function PricingPage() {
  return (
    <MarketingShell>
      <main className="bg-white">
        <PricingHero />
        <PricingPlans />
        <ComparisonMatrix />
        <AddonsSection />
        <RoiCalculator />
        <UsageLimitsSection />
        <OnboardingTimeline />
        <EnterpriseSection />
        <PricingFAQ />
        <PricingFinalCTA />
      </main>
    </MarketingShell>
  );
}
