'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import UserNavbar from '../../../user/Header';
import Footer from '../../../components/Footer';
import { blogPosts } from '../blogData';
import { Calendar, User, Clock, ArrowLeft, Share2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 flex flex-col items-center justify-center p-8">
                <UserNavbar />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Story Not Found</h1>
                <p className="text-slate-500 mb-8">The story you're looking for doesn't exist.</p>
                <Link href="/resources/blog" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold">
                    Back to Stories
                </Link>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 flex flex-col">
            <UserNavbar />

            {/* Hero Section */}
            <div className="relative h-[60vh] w-full mt-20 flex flex-col justify-end pb-12 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-110"
                    style={{ backgroundImage: `url(${post.image})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-8 w-full">
                    <Link href="/resources/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Stories
                    </Link>
                    <div className="space-y-6">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {post.category}
                        </span>
                        <h1 className="text-4xl md:text-7xl font-serif text-white leading-tight animate-fade-in-up">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-light">
                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> {post.author}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {post.date}</span>
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {post.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-8 py-20 w-full flex-grow">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Main Text Content */}
                    <div className="flex-grow space-y-8">
                        <p className="text-2xl text-slate-600 dark:text-slate-300 font-light leading-relaxed italic border-l-4 border-indigo-500 pl-8">
                            {post.excerpt}
                        </p>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-400 leading-relaxed text-lg font-light">
                            <p>
                                Scaling a modern business in 2026 requires more than just traditional growth tactics.
                                It requires a deep understanding of data-driven attribution and automated fulfillment.
                                In this era of rapid technological advancement, speed is no longer just an advantage—it's a prerequisite for survival.
                            </p>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif pt-4">The Shift in Revenue Paradigms</h2>
                            <p>
                                For years, agencies operated on a 'wait-and-see' model. Leads would come in, sit in a CRM for hours or even days,
                                and by the time a representative reached out, the excitement had already cooled.
                                LeadForGrow was built to bridge this "Speed to Lead" gap.
                            </p>
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop"
                                alt="Analytics Dashboard"
                                className="w-full rounded-[2.5rem] shadow-2xl my-12"
                            />
                            <p>
                                By implementing zero-code automation and AI-driven scoring, we enable teams to focus their energy
                                only on high-intent customers, dramatically reducing the noise in the sales pipeline.
                                The result isn't just more leads—it's more revenue with less effort.
                            </p>
                        </div>

                        {/* Social Interaction Bar */}
                        <div className="pt-12 mt-12 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-bold">Comments</span>
                                </button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">Share Story</span>
                                </button>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    +12
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Author Info */}
                    <aside className="md:w-64 space-y-12 shrink-0">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden mb-4">
                                <img src="https://i.pravatar.cc/200?u=author" alt={post.author} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{post.author}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                Content Strategist at LeadForGrow. Helping modern agencies automate their revenue flow.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </div>
    );
}
