import LegalPageLayout, { LegalSection } from '@/app/components/marketing/LegalPage';

export const metadata = { title: 'Data Processing Agreement | LeadForGrow' };

export default function DPAPage() {
  return (
    <LegalPageLayout title="Data Processing Agreement" lastUpdated="June 2026" variant="dark">
      <LegalSection title="Scope">
        <p>This DPA applies when LeadForGrow processes personal data on your behalf as a data processor under applicable privacy laws.</p>
      </LegalSection>
      <LegalSection title="Processor obligations">
        <p>We process data only per your instructions, implement appropriate security measures, assist with data subject requests, and notify you of breaches without undue delay.</p>
      </LegalSection>
      <LegalSection title="Sub-processors">
        <p>We use cloud infrastructure, email delivery, and messaging providers. A current list is available on request at legal@leadforgrow.com.</p>
      </LegalSection>
      <LegalSection title="Request a signed DPA">
        <p>Enterprise customers may request a countersigned DPA by contacting sales@leadforgrow.com.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
