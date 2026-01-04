"use client";

import React from 'react';

export default function StepsSection({ content }) {
  const { title, items } = content;

  return (
    <section className="py-24 px-6 bg-slate-900 text-white rounded-[4rem] mx-6 lg:mx-12 my-20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold mb-20 tracking-tight text-center leading-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {items.map((item, index) => (
            <div key={index} className="relative group">
               {index < items.length - 1 && (
                 <div className="hidden lg:block absolute top-10 left-full w-full h-[2px] bg-slate-800 -translate-x-12 z-0"></div>
               )}
               <div className="relative z-10 flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 text-4xl font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                      {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed text-center md:text-left opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
