"use strict";

"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Layout,
  Globe,
  Users,
  Target,
  Briefcase,
  Rocket,
  Building2
} from 'lucide-react';
import UserNavbar from '../../user/Header';

function TemplatesContent() {
  const searchParams = useSearchParams();
  const goal = searchParams.get('goal') || 'leads';
  const router = useRouter();

  const contentMap = {
    leads: {
      title: 'Best templates to capture more leads',
      templates: [
        {
          id: 'leadboost-funnel',
          name: 'LeadBoost Funnel',
          tag: 'Recommended',
          description: 'High-conversion funnel designed to capture quality leads.',
          bestFor: ['Service businesses', 'Agencies', 'Consultants'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <path d="M12 28 L20 18 L28 28" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="24" r="4" fill="#22D3EE" />
            </svg>
          )
        },
        {
          id: 'quicklead-page',
          name: 'QuickLead Page',
          description: 'Simple one-page website to get inquiries fast.',
          bestFor: ['Local businesses', 'Solo founders', 'Quick launches'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <rect x="12" y="10" width="3" height="14" fill="#3B82F6" rx="1" />
              <rect x="20" y="6" width="3" height="22" fill="#F43F5E" rx="1" />
              <rect x="28" y="14" width="3" height="10" fill="#F472B6" rx="1" />
            </svg>
          )
        }
      ]
    },
    service: {
      title: 'Best templates to promote your service',
      templates: [
        {
          id: 'servicepro-website',
          name: 'ServicePro Website',
          tag: 'Recommended',
          description: 'Professional website to showcase services and collect inquiries.',
          bestFor: ['Service providers', 'Consultants', 'Freelancers'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <path d="M14 14 H26 L30 20 L26 26 H14 L10 20 Z" stroke="#22D3EE" strokeWidth="2.5" />
              <path d="M10 18 H6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 20 H6" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 22 H6" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )
        },
        {
          id: 'localbiz-website',
          name: 'LocalBiz Website',
          description: 'Clean business website with service details and contact form.',
          bestFor: ['Local businesses', 'Small companies'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <circle cx="15" cy="20" r="4" fill="#22D3EE" />
              <circle cx="25" cy="20" r="4" fill="#10B981" />
              <path d="M18 20 H22" stroke="#FBBF24" strokeWidth="2" />
            </svg>
          )
        }
      ]
    },
    product: {
      title: 'Best templates for product launches',
      templates: [
        {
          id: 'launchflow-funnel',
          name: 'LaunchFlow Funnel',
          tag: 'Recommended',
          description: 'Product launch funnel built to drive signups and conversions.',
          bestFor: ['Product launches', 'Campaigns', 'Marketing teams'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <rect x="12" y="10" width="3" height="20" fill="#22D3EE" rx="1.5" />
              <rect x="20" y="10" width="3" height="20" fill="#F472B6" rx="1.5" />
              <rect x="28" y="10" width="3" height="20" fill="#FBBF24" rx="1.5" />
            </svg>
          )
        },
        {
          id: 'waitlistpro-page',
          name: 'WaitlistPro Page',
          description: 'Email capture page to build early interest before launch.',
          bestFor: ['Startups', 'MVP launches'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <rect x="14" y="24" width="2" height="6" fill="#22D3EE" />
              <rect x="19" y="18" width="2" height="12" fill="#F472B6" />
              <rect x="24" y="22" width="2" height="8" fill="#FBBF24" />
              <rect x="29" y="16" width="2" height="14" fill="#3B82F6" />
            </svg>
          )
        }
      ]
    },
    agency: {
      title: 'Best templates for agencies & companies',
      templates: [
        {
          id: 'agencyprime-website',
          name: 'AgencyPrime Website',
          tag: 'Recommended',
          description: 'Agency-focused website with services, case studies & contact flow.',
          bestFor: ['Marketing agencies', 'Creative studios'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <circle cx="15" cy="20" r="5" fill="#22D3EE" />
              <circle cx="25" cy="20" r="5" fill="#10B981" />
              <rect x="18" y="19" width="4" height="2" fill="white" />
            </svg>
          )
        },
        {
          id: 'businessbrand-website',
          name: 'BusinessBrand Website',
          description: 'Company profile website with branding, pages & lead capture.',
          bestFor: ['Companies', 'Corporate teams'],
          icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 group-hover:scale-110 transition-transform duration-500">
              <path d="M10 20 H30" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="10" cy="20" r="3" fill="#F43F5E" />
              <circle cx="30" cy="20" r="3" fill="#10B981" />
            </svg>
          )
        }
      ]
    }
  };

  const currentContent = contentMap[goal] || contentMap.leads;

  const handleUseTemplate = (templateId) => {
    router.push(`/website-funnel/details?goal=${goal}&templateId=${templateId}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden font-sans flex flex-col pt-24 pb-12 px-6 lg:px-12">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 "></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
          <div className="text-center lg:text-left flex-1">
            <h1 className="text-4xl lg:text-6xl font-medium text-slate-900 leading-tight mb-4 tracking-tight">
              {currentContent.title}
            </h1>
            <p className="text-slate-500 text-lg lg:text-xl font-medium max-w-2xl">
              We’ve selected the best options for you. <br className="hidden lg:block" />
              Choose one to continue your journey.
            </p>
          </div>

          {/* Teacher Guy Illustration explaining */}
          <div className="relative w-full max-w-xs group">
            <div className="relative z-10 animate-float">
               <img 
                  src="/illustrations/teacher_guy.png" 
                  alt="Teacher" 
                  className="w-full h-auto drop-shadow-2xl"
                />
            </div>
            
            {/* Tooltip speech bubble */}
            <div className="absolute -top-4 -right-10 bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl rotate-6 animate-bounce z-20">
              <span className="font-medium text-sm">Perfect for you! 🌟</span>
            </div>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {currentContent.templates.map((template, idx) => (
            <div 
              key={idx}
              className="group relative bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2"
            >
              {template.tag && (
                <div className="absolute -top-4 left-8 bg-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest flex items-center gap-2 shadow-xl">
                  <Sparkles className="w-3 h-3" />
                  {template.tag}
                </div>
              )}

              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-slate-50">
                <div className="p-3 bg-slate-50 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  {template.icon}
                </div>
                <div className="flex flex-col pt-1">
                  <h3 className="text-xl font-medium text-slate-900 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">Best for:</p>
                {template.bestFor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-500" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-slate-700 font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleUseTemplate(template.id)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300 active:scale-95"
              >
                Use this template <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-slate-400 font-medium hover:text-slate-900 transition-colors flex items-center gap-2 uppercase text-xs tracking-widest"
          >
            ← Change your goal
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-12 h-1.5 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}
              ></div>
            ))}
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Step 2 of 4</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        body {
          background-color: white;
        }
      `}</style>
    </div>
  );
}

export default function WebsiteFunnelTemplatesPage() {
  return (
    <>
      <UserNavbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <TemplatesContent />
      </Suspense>
    </>
  );
}
