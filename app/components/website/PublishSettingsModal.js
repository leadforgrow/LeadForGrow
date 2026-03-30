"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  X, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function PublishSettingsModal({ isOpen, onClose, onConfirm, initialWebsiteName }) {
  const [slug, setSlug] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [isPremiumMode, setIsPremiumMode] = useState(false);

  useEffect(() => {
    if (initialWebsiteName) {
      setSlug(initialWebsiteName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  }, [initialWebsiteName]);

  const checkAvailability = async (val) => {
    if (!val) {
      setIsAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const res = await fetch(`/api/websites/slug-check?slug=${val}`);
      const result = await res.json();
      setIsAvailable(result.available);
      if (!result.available) {
        setError('This name is already taken.');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Error checking availability');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) checkAvailability(slug);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 lg:p-10">
          {!isPremiumMode ? (
            <>
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Set Your URL Name</h2>
              <p className="text-slate-500 font-medium mb-8 text-sm">Choose a memorable name for your published website.</p>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <label>Website URL Name</label>
                    <span className={isAvailable === false ? 'text-rose-500' : isAvailable === true ? 'text-emerald-500' : ''}>
                      {isChecking ? 'Checking...' : isAvailable === false ? 'Taken' : isAvailable === true ? 'Available' : ''}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-medium text-sm transition-colors ${slug ? 'text-indigo-600' : ''}`}>
                      /s/
                    </div>
                    <input 
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-awesome-site"
                      className={`w-full pl-10 pr-12 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${
                        isAvailable === true ? 'border-emerald-100 bg-emerald-50/10 focus:border-emerald-500' : 
                        isAvailable === false ? 'border-rose-100 bg-rose-50/10 focus:border-rose-500' : 
                        'border-slate-100 focus:border-indigo-600'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {isChecking ? (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : isAvailable === true ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : isAvailable === false ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : null}
                    </div>
                  </div>
                  {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1">{error}</p>}
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-0.5">Custom Domain</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Want a professional .com? Click below to explore domain settings.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <button 
                    onClick={() => setIsPremiumMode(true)}
                    className="py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all"
                   >
                     Premium Domain?
                   </button>
                   <button 
                    disabled={!slug || !isAvailable || isChecking}
                    onClick={() => onConfirm(slug)}
                    className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Confirm & Publish <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsPremiumMode(false)}
                className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                <ArrowRight className="w-3 h-3 rotate-180" /> Back
              </button>

              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Connect Custom Domain</h2>
              <p className="text-slate-500 font-medium mb-8 text-sm">Professional brands use custom domains. This is a premium feature.</p>

              <div className="space-y-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-center border-dashed">
                    <Loader2 className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Coming Very Soon</h3>
                    <p className="text-xs text-slate-400 font-medium px-4">Our pro tier with custom domain support is currently in early access.</p>
                </div>

                <button 
                  onClick={() => setIsPremiumMode(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all mt-4"
                >
                  Continue with free URL
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
