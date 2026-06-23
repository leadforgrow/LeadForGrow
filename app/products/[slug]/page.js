import { notFound, redirect } from 'next/navigation';
import { PRODUCT_PAGES } from '@/lib/marketing/pageContent/products';
import { ProductPageRenderer } from '@/app/components/marketing/PageRenderers';

export async function generateStaticParams() {
  return Object.keys(PRODUCT_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = PRODUCT_PAGES[slug];
  if (!page?.meta) return {};
  return { title: page.meta.title, description: page.meta.description };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const page = PRODUCT_PAGES[slug];
  if (!page) notFound();
  if (page.redirect) redirect(page.redirect);
  return <ProductPageRenderer page={page} />;
}
