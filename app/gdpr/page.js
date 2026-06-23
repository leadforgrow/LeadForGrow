import LegalPageLayout, { LegalSection } from '@/app/components/marketing/LegalPage';

export const metadata = { title: 'GDPR | LeadForGrow', description: 'How LeadForGrow complies with GDPR.' };

export default function GDPRPage() {
  return (
    <LegalPageLayout title="GDPR Compliance" lastUpdated="June 2026">
      <LegalSection title="Data controller">
        <p>ScaleDesk Technology operates LeadForGrow as the data controller for account and platform data. Customer data processed on behalf of users is handled as a data processor.</p>
      </LegalSection>
      <LegalSection title="Your rights">
        <p>Under GDPR you have the right to access, rectify, erase, restrict processing, data portability, and object to processing. Contact privacy@leadforgrow.com to exercise these rights.</p>
      </LegalSection>
      <LegalSection title="Data processing">
        <p>We process data only for providing the service, improving the platform, and legal compliance. Sub-processors are listed in our DPA.</p>
      </LegalSection>
      <LegalSection title="International transfers">
        <p>Data may be processed in India and other regions where our infrastructure providers operate, with appropriate safeguards in place.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
