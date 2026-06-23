import LegalPageLayout, { LegalSection } from '@/app/components/marketing/LegalPage';

export const metadata = { title: 'Cookie Policy | LeadForGrow' };

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="June 2026">
      <LegalSection title="What we use cookies for">
        <p>Essential cookies keep you signed in. Analytics cookies help us understand usage (only with consent). Marketing cookies are not used without explicit opt-in.</p>
      </LegalSection>
      <LegalSection title="Managing cookies">
        <p>Use our cookie consent banner to accept or reject non-essential cookies. You can also clear cookies via your browser settings.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
