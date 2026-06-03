'use client';

import React, { useState } from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import Heading from '@/app/components/ui/Heading';
import { Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CONTACT_FORM_TOKEN, getFormSubmitUrl } from '@/lib/publicForms';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const formData = new FormData(form);

    const payload = {
      token: CONTACT_FORM_TOKEN,
      name: formData.get('name')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim() || '',
      company: formData.get('company')?.toString().trim() || '',
      serviceInterest: formData.get('subject')?.toString().trim() || 'General Inquiry',
      message: formData.get('message')?.toString().trim(),
    };

    try {
      const res = await fetch(getFormSubmitUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Thank you! We will get back to you soon.');
        setSubmitted(true);
        form.reset();
        toast.success('Message sent — our team will follow up soon.');
      } else {
        toast.error(result.error || 'Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingLayout
      title="Let's Talk Growth"
      subtitle="Have questions about our agency operating system? Our team is here to help you scale."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-12">
          <div>
            <Heading level={2} className="text-3xl mb-6 text-slate-900 dark:text-white">Contact Information</Heading>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
              Whether you&apos;re a solo freelancer or a global agency, we&apos;d love to hear from you.
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
                  +91 8810 873 052<br />
                  +91 8076 772 797
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <Heading level={3} className="text-2xl mb-4 text-white">Are you an Agency?</Heading>
              <p className="opacity-90 mb-6 font-light">
                Ask about our White-Label solutions and Agency-only pricing tiers.
              </p>
              <button type="button" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition" onClick={() => { window.location.href = '/#pricing'; }}>
                View Agency Plans
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-[40px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 relative">
          {submitted ? (
            <div className="text-center py-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <Heading level={3} className="text-3xl mb-4">Message Sent!</Heading>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-sm">
                {successMessage}
              </p>
              <button
                type="button"
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
                  <label htmlFor="contact-name" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Your Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    required
                    type="email"
                    placeholder="john@agency.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-phone" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Phone (optional)</label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-company" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Company / Agency Name</label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  placeholder="LFG Agency"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Subject</label>
                <select
                  id="contact-subject"
                  name="subject"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none font-bold"
                >
                  <option>General Inquiry</option>
                  <option>Sales & Demo</option>
                  <option>Agency White-Label</option>
                  <option>Technical Support</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest pl-1">Your Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your agency goals..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 dark:text-white outline-none resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? 'Sending…' : <>Send Message <Send className="w-5 h-5" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
