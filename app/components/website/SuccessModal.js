"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  X, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, websiteUrl, websiteName }) {
  const [showDomainUI, setShowDomainUI] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 motion-reduce:animate-none">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!showDomainUI ? (
          <div className="p-8 lg:p-12 text-center">
            {/* Success Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
              <div className="relative flex items-center justify-center w-full h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-md animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Your Site is Live!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Congratulations! <span className="text-indigo-600 font-bold">{websiteName}</span> has been successfully published to the web.
            </p>

            {/* Link Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between gap-4 mb-10 border border-slate-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-600 truncate">{websiteUrl}</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(websiteUrl);
                  // Optional: add a tiny toast or state change here
                }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href={`${websiteUrl}?mode=public`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <ExternalLink className="w-4 h-4" /> View Site
              </a>
              <button 
                onClick={() => setShowDomainUI(true)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" /> Connect Domain
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-12">
            <button 
              onClick={() => setShowDomainUI(false)}
              className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to stats
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Connect Custom Domain</h2>
            <p className="text-slate-500 font-medium mb-8 text-sm">Make your brand stand out with a professional URL.</p>

            <div className="space-y-4">
              <div className="p-5 border-2 border-indigo-50 bg-indigo-50/30 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Premium Feature</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Custom domains are available on our Pro plan. Launch with a professional .com, .io, or .ai address.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-slate-400 mb-4 italic uppercase tracking-widest text-[10px]">Coming Very Soon</p>
                <button 
                  disabled
                  className="w-full py-4 bg-slate-200 text-slate-400 rounded-2xl font-bold text-sm cursor-not-allowed"
                >
                  Configure DNS Settings
                </button>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-6 py-4 text-slate-400 font-bold text-sm hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
