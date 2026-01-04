"use client";

import React from 'react';

export default function AboutSection({ content }) {
  const { title, text, reversed, visualUrl } = content;

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className={`max-w-7xl mx-auto flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
            {title}
          </h2>
          <div className="space-y-6 text-lg text-slate-500 font-medium leading-relaxed opacity-90">
            {text.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {visualUrl && (
          <div className="flex-1 w-full max-w-xl">
             <div className="relative group">
                <div className="absolute -inset-2 bg-indigo-50 rounded-[3rem] blur-xl opacity-40 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                <img 
                    src={visualUrl} 
                    alt={title} 
                    className="w-full h-auto rounded-[2.5rem] border-8 border-slate-50 shadow-2xl transition-transform duration-700 hover:rotate-2"
                />
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
