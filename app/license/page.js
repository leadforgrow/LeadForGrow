import LegalPageLayout, { LegalSection } from '@/app/components/marketing/LegalPage';

export const metadata = { title: 'License | LeadForGrow' };

export default function LicensePage() {
  return (
    <LegalPageLayout title="Software License" lastUpdated="June 2026">
      <LegalSection title="Grant of license">
        <p>LeadForGrow grants you a limited, non-exclusive, non-transferable license to use the platform per your subscription plan and our Terms of Service.</p>
      </LegalSection>
      <LegalSection title="Restrictions">
        <p>You may not reverse engineer, resell access, or use the platform for unlawful purposes. API usage is subject to rate limits defined in your plan.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
