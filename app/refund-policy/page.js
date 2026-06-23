import LegalPageLayout, { LegalSection } from '@/app/components/marketing/LegalPage';

export const metadata = { title: 'Refund Policy | LeadForGrow' };

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="June 2026">
      <LegalSection title="Free trial">
        <p>All plans include a 14-day free trial. No charge until the trial ends unless you choose to subscribe early.</p>
      </LegalSection>
      <LegalSection title="Refunds">
        <p>Monthly subscriptions: contact support within 7 days of charge for eligible refunds. Annual plans: pro-rated refunds considered case-by-case within 30 days.</p>
      </LegalSection>
      <LegalSection title="Cancellation">
        <p>Cancel anytime from billing settings. Access continues until the end of the billing period.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
