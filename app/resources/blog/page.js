'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: "Agency Scaling: How to Reach $100k/mo in 2026",
      excerpt: "Discover the exact frameworks and automation triggers the top 1% of agencies use to scale without increasing headcount.",
      image: "/images/blog/scaling.png",
      date: "Jan 5, 2026",
      author: "Alex Rivera",
      category: "Scaling"
    },
    {
      title: "The Death of Manual Lead Entry",
      excerpt: "Why the manual lead sheet is hurting your ROI and how intelligent capture widgets are changing the game for local businesses.",
      image: "/images/blog/automation.png",
      date: "Jan 3, 2026",
      author: "Sarah Chen",
      category: "Automation"
    },
    {
      title: "Psychology of the 5-Minute Lead Follow-up",
      excerpt: "Research shows that follow-up time is the #1 factor in closing leads. Learn how to automate this critical window of opportunity.",
      image: "/images/blog/management.png",
      date: "Dec 28, 2025",
      author: "Marcus Thorne",
      category: "Lead Gen"
    }
  ];

  return (
    <MarketingLayout 
      title="The Growth Blog" 
      subtitle="Industry insights, scaling frameworks, and automation strategies for the modern agency."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post, idx) => (
          <article key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                  {post.category}
                </span>
              </div>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-light">
                {post.excerpt}
              </p>
              
              <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold group/btn">
                Read Article <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Section */}
      <div className="mt-32 bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">Get the Growth Newsletter</h2>
          <p className="text-indigo-100 text-lg font-light leading-relaxed">
            Join 12,000+ agency owners getting weekly automation templates and scaling tips delivered directly to their inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your professional email"
              className="flex-grow bg-white/10 border-white/20 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-indigo-200 outline-none focus:border-white transition-all backdrop-blur-sm"
            />
            <button className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition active:scale-95 shadow-xl">
              Subscribe Free
            </button>
          </form>
          <p className="text-xs text-indigo-200 opacity-80">No spam. Ever. Unsubscribe in one click.</p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
      </div>
    </MarketingLayout>
  );
}
