import AboutUsPage from '@/app/components/landing/AboutUsPage';

export const metadata = {
  title: 'About Us | LeadForGrow — Built by Scaledesk Technology',
  description:
    'Meet the LeadForGrow founders — Saurabh Singh (Co-Founder & CTO), Himanshu Singh, and Shashank Singh Chauhan. AI-powered CRM and sales automation by Scaledesk Technology.',
  openGraph: {
    title: 'About LeadForGrow',
    description: 'Turning leads into customers with AI-powered CRM and automation.',
  },
};

export default function AboutPage() {
  return <AboutUsPage />;
}
