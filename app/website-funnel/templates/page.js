"use strict";

"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowRight,
  Globe,
  Settings,
  Construction
} from 'lucide-react';
import UserNavbar from '../../user/Header';

function TemplatesContent() {
  const searchParams = useSearchParams();
  const goal = searchParams.get('goal') || 'leads';
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden font-sans flex flex-col pt-24 pb-12 px-6 lg:px-12">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 "></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8 text-center lg:text-left">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-6xl font-medium text-slate-900 leading-tight mb-4 tracking-tight">
              System Preparation
            </h1>
            <p className="text-slate-500 text-lg lg:text-xl font-medium max-w-2xl">
              We are building the core infrastructure for your {goal} funnel. <br className="hidden lg:block" />
              Pre-built templates have been cleared to focus on custom system design.
            </p>
          </div>

          <div className="relative w-full max-w-xs group">
            <div className="relative z-10 animate-float flex justify-center">
               <Construction className="w-48 h-48 text-indigo-600 drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Message Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-12 border-2 border-slate-100 shadow-2xl text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Settings className="w-10 h-10 text-indigo-600 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core System Active</h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              We are currently in "System Mode". The underlying engine for website and funnel creation is active. 
              The next phase involves configuring custom attributes and routes before design templates are re-introduced.
            </p>

            <button 
              onClick={() => router.push('/website-funnel')}
              className="px-10 py-4 bg-slate-900 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all duration-300 mx-auto"
            >
              Back to Goals <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-12 h-1.5 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}
              ></div>
            ))}
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Step 2 of 4 • Infrastructure Check</p>
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
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
