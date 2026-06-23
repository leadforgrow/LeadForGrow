import AboutPageContent from '@/app/components/marketing/AboutPageContent';

export const metadata = {
  title: 'About Us | LeadForGrow — Built by Scaledesk Technology',
  description:
    'Meet the LeadForGrow team. AI-powered CRM and sales automation by Scaledesk Technology — mission, vision, values, and journey.',
  openGraph: {
    title: 'About LeadForGrow',
    description: 'Turning leads into customers with AI-powered CRM and automation.',
  },
  alternates: {
    canonical: 'https://leadforgrow.com/about',
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
