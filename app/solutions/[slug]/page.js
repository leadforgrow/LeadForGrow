import { notFound } from 'next/navigation';
import { SOLUTION_PAGES } from '@/lib/marketing/pageContent/products';
import { SolutionPageRenderer } from '@/app/components/marketing/PageRenderers';

export async function generateStaticParams() {
  return Object.keys(SOLUTION_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = SOLUTION_PAGES[slug];
  if (!page?.meta) return {};
  return { title: page.meta.title, description: page.meta.description };
}

export default async function SolutionPage({ params }) {
  const { slug } = await params;
  const page = SOLUTION_PAGES[slug];
  if (!page) notFound();
  return <SolutionPageRenderer page={page} />;
}
