"use strict";

"use client";

import React, { useState } from 'react';
import { 
  Target, 
  Briefcase, 
  Rocket, 
  Building2, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserNavbar from '../user/Header';

export default function WebsiteFunnelPage() {
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    {
      id: 'leads',
      title: 'Get Leads / Inquiries',
      description: 'Capture, track & manage leads in one dashboard.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
          <path d="M12 28 L20 18 L28 28" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="24" r="4" fill="#22D3EE" />
        </svg>
      )
    },
    {
      id: 'service',
      title: 'Promote a Service or Business',
      description: 'Build landing pages, funnels & payment pages — fast.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
          <path d="M14 14 H26 L30 20 L26 26 H14 L10 20 Z" stroke="#22D3EE" strokeWidth="2.5" />
          <path d="M10 18 H6" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 20 H6" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 22 H6" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'product',
      title: 'Launch a Product or Campaign',
      description: 'Manage multiple clients with separate access & data.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
          <rect x="14" y="14" width="2" height="12" fill="#F43F5E" rx="1" />
          <rect x="19" y="10" width="2" height="16" fill="#3B82F6" rx="1" />
          <rect x="24" y="14" width="2" height="12" fill="#F472B6" rx="1" />
          <circle cx="15" cy="12" r="1.5" fill="#F43F5E" />
          <circle cx="20" cy="8" r="1.5" fill="#3B82F6" />
          <circle cx="25" cy="12" r="1.5" fill="#F472B6" />
        </svg>
      )
    },
    {
      id: 'agency',
      title: 'Build an Agency / Company Website',
      description: 'Custom domains, short links & campaign tracking.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
          <circle cx="15" cy="20" r="4" fill="#22D3EE" />
          <circle cx="25" cy="20" r="4" fill="#10B981" />
          <path d="M18 20 H22" stroke="#FBBF24" strokeWidth="2" />
        </svg>
      )
    }
  ];

  const router = useRouter();

  const handleSelect = (id) => {
    setSelectedOption(id);
  };

  const handleContinue = () => {
    if (selectedOption) {
      router.push(`/website-funnel/templates?goal=${selectedOption}`);
    }
  };

  return (
    <>
    <UserNavbar></UserNavbar>
    <div className="relative min-h-screen w-full bg-white overflow-hidden font-sans flex items-center justify-center p-6 lg:p-12 mt-14">
      
      {/* Premium Decorative Background */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-yellow-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 "></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-0 w-12 h-12 bg-emerald-400 rounded-full -translate-x-1/2"></div>
 
      <div className="relative z-10 max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
        
        {/* Left Side: Text + Thinking Guy Illustration */}
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="mb-8 relative">
            <h1 className="text-5xl lg:text-7xl font-medium text-slate-900 leading-[1.1] mb-6 tracking-tight">
              What do you <br />
              <span className="text-slate-800">want this <br />website to do?</span>
            </h1>
            
            {/* Premium 3D Thinking Guy Illustration */}
            <div className="relative w-full max-w-md mt-8 group">
              <div className="relative z-10 animate-float">
                <img 
                  src="/illustrations/thinking_guy_v2.png" 
                  alt="Thinking Person" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Decorative elements around the guy */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute top-1/2 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4 animate-bounce z-20">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 text-sm">HELP ME CHOOSE</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Select one goal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Options Grid */}
        <div className="lg:w-1/2 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`group relative p-7 bg-white rounded-[2.5rem] cursor-pointer transition-all duration-700 border-2
                  ${selectedOption === option.id 
                    ? 'border-indigo-500 ring-8 ring-indigo-50/30 shadow-[0_40px_80px_-20px_rgba(99,102,241,0.2)] scale-[1.03] z-20' 
                    : 'border-slate-50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_60px_-20px_rgba(0,0,0,0.08)] hover:scale-[1.01] hover:border-indigo-100'
                  }
                `}
              >
                <div className="mb-7 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-1">
                  {option.icon}
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                  {option.title}
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium opacity-80">
                  {option.description}
                </p>
                
                <div className={`mt-8 flex items-center gap-2 font-medium text-[10px] transition-all duration-500 ${selectedOption === option.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-60 group-hover:translate-y-0'}`}>
                  <span className="text-indigo-500 tracking-widest uppercase text-[9px]">Select this goal</span>
                  <div className="p-1.5 bg-indigo-50 rounded-full group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </div>
                </div>

                {/* Subtle background glow on selection */}
                {selectedOption === option.id && (
                  <div className="absolute inset-0 bg-indigo-50/10 rounded-[2.5rem] -z-10 animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-8 ">
            <button
              onClick={handleContinue}
              disabled={!selectedOption}
              className={`
                px-8 py-3 rounded-2xl font-medium text-l flex items-center gap-2 transition-all duration-500
                ${selectedOption 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-2 cursor-pointer active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }
              `}
            >
              Continue <span className="text-xl animate-pulse">👉</span>
            </button>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Step 1 of 4</p>
          </div>
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
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
        body {
          background-color: white;
        }
      `}</style>
    </div>
    </>
  );
}

