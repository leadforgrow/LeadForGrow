"use client";

import React from 'react';
import { Send, ArrowRight } from 'lucide-react';

export default function FormSection({ content }) {
  const { title, subtitle, buttonText, fields } = content;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight">
          {title}
        </h2>
        <p className="text-xl font-medium mb-12 opacity-70">
          {subtitle}
        </p>

        <form className="bg-white/5 backdrop-blur-3xl p-8 lg:p-16 rounded-[4rem] border border-white/10 shadow-2xl space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fields.map((field, index) => (
              <div key={index} className="text-left space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-2">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  className="w-full px-8 py-5 bg-black/5 border-2 border-transparent focus:border-indigo-400/30 rounded-[1.5rem] outline-none transition-all font-medium placeholder:opacity-40"
                />
              </div>
            ))}
          </div>
          <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 hover:bg-white hover:text-indigo-600 transition-all shadow-2xl active:scale-95 group">
            {buttonText} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  );
}
