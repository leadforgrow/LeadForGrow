import { notFound } from 'next/navigation';
import { industries } from '../data';
import IndustryTemplate from '../../components/IndustryTemplate';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = industries[slug];

  if (!data) {
    return {
      title: 'Industry Solution - LeadForGrow',
      description: 'LeadForGrow automated solutions for various industries.'
    };
  }

  return {
    title: `${data.name} Automation - LeadForGrow`,
    description: data.hero.subheadline
  };
}

export default async function IndustryPage({ params }) {
  const { slug } = await params;
  const data = industries[slug];

  if (!data) {
    notFound();
  }

  return <IndustryTemplate data={data} />;
}

export async function generateStaticParams() {
  return Object.keys(industries).map((slug) => ({
    slug: slug,
  }));
}
