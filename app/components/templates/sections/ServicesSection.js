"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ServicesSection({ content }) {
  const { title, items } = content;

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-16 tracking-tight text-center lg:text-left max-w-2xl leading-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div key={index} className="group p-1 bg-slate-50 rounded-[2.5rem] hover:bg-slate-900 transition-all duration-500 shadow-sm border border-slate-100">
               <div className="bg-white p-10 rounded-[2.2rem] h-full flex flex-col items-start group-hover:-translate-y-2 group-hover:translate-x-1 transition-all duration-500">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-500 transition-colors">
                      <ArrowUpRight className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8 flex-grow">
                    {item.description}
                  </p>
                  <button className="text-indigo-600 font-bold uppercase text-xs tracking-widest hover:text-slate-900 flex items-center gap-2">
                    Learn More <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
