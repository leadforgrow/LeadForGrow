"use client";

import React from 'react';
import { Quote } from 'lucide-react';

export default function TrustSection({ content, dark = false }) {
  const { title, type, items } = content;

  return (
    <section className={`py-24 px-6 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-12 ${dark ? 'text-white/40' : 'text-slate-400'}`}>
          {title}
        </h2>

        {type === 'logos' ? (
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-500">
            {items.map((logo, index) => (
              <img key={index} src={logo} alt="Client Logo" className={`h-8 lg:h-12 w-auto grayscale ${dark ? 'invert brightness-0' : ''}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {items.map((item, index) => (
              <div key={index} className={`p-8 rounded-[2rem] border relative overflow-hidden group ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                 <Quote className={`absolute -top-4 -right-4 w-24 h-24 -rotate-12 group-hover:rotate-0 transition-transform duration-700 ${dark ? 'text-white/5' : 'text-indigo-50/50'}`} />
                 <p className={`text-lg font-medium mb-8 relative z-10 ${dark ? 'text-white/80' : 'text-slate-600'}`}>"{item.text}"</p>
                 <div className="flex items-center gap-4 relative z-10">
                    <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full border-2 border-white/10 shadow-sm" />
                    <div>
                        <h4 className={`font-bold leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                        <p className={`text-xs font-medium mt-1 ${dark ? 'text-white/40' : 'text-slate-400'}`}>{item.role}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
