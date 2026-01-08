'use client';

import React, { useState } from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Message sent successfully!");
    }, 1500);
  };

  return (
    <MarketingLayout 
      title="Let's Talk Growth" 
      subtitle="Have questions about our agency operating system? Our team is here to help you scale."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Side: Contact Info */}
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
              Whether you're a solo freelancer or a global agency, we'd love to hear from you. 
              Our experts are ready to show you how LeadForGrow can transform your operations.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                <a href="mailto:sales@leadforgrow.online" className="text-xl font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                  sales@leadforgrow.online
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  +91 8810 873 052
                  +91 8076 772 797
                </p>
              </div>
            </div>

          
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Are you an Agency?</h3>
              <p className="opacity-90 mb-6 font-light">
                Ask about our White-Label solutions and Agency-only pricing tiers.
              </p>
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition" onClick={() => window.location.href = "/#pricing"}>
                View Agency Plans
              </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[40px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 relative">
          {submitted ? (
            <div className="text-center py-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Message Sent!</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-sm">
                Thank you for reaching out. One of our growth specialists will get back to you within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="john@agency.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company / Agency Name</label>
                <input 
                  type="text" 
                  placeholder="LFG Agency"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none">
                  <option>General Inquiry</option>
                  <option>Sales & Demo</option>
                  <option>Agency White-Label</option>
                  <option>Technical Support</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Message</label>
                <textarea 
                  required
                  rows="5"
                  placeholder="Tell us about your agency goals..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none resize-none" 
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    Send Message <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
