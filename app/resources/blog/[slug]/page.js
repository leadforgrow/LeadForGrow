import MarketingLayout from '@/app/components/MarketingLayout';
import { blogPosts } from '../blogs_data';
import { notFound } from 'next/navigation';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const post = blogPosts[params.slug];
  if (!post) return {};

  return {
    title: `${post.title} | LeadForGrow Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://leadforgrow.online/resources/blog/${params.slug}`
    }
  };
}

export default function BlogPost({ params }) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <MarketingLayout
      title={post.title}
      subtitle={post.description}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back to Blog */}
        <Link 
          href="/resources/blog" 
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-12 hover:-translate-x-2 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Growth Blog
        </Link>

        {/* Post Header Details */}
        <div className="flex flex-wrap items-center gap-8 mb-16 text-slate-400 font-medium pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" />
            <span className="uppercase tracking-widest text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {post.date}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {post.author}
          </div>
        </div>

        {/* Featured Image placeholder (visual hint for user) */}
        <div className="aspect-[21/9] rounded-[3rem] bg-slate-100 dark:bg-slate-800 overflow-hidden mb-20 border border-slate-200 dark:border-slate-700 relative group">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
        </div>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {post.content}
        </article>

        {/* Related Pillars / Internal Linking */}
        <div className="mt-32 p-12 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-bold mb-8">Continue Optimizing Your Sales Funnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/product/crm" className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
              <h4 className="font-bold text-indigo-600 mb-2">Lead Management CRM</h4>
              <p className="text-sm text-slate-500">Stop losing leads in spreadsheets. Centralize your enquiries today.</p>
            </Link>
            <Link href="/product/automation" className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
              <h4 className="font-bold text-indigo-600 mb-2">Sales Automation</h4>
              <p className="text-sm text-slate-500">Enable 24/7 follow-ups and never miss the Golden 5 Minute window.</p>
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
