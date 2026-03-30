"use client";

import React from 'react';
import { Sparkles, Shield, Star, Rocket, Target } from 'lucide-react';

const icons = {
  Sparkles, Shield, Star, Rocket, Target
};

export default function FeaturesSection({ content }) {
  const { title, items } = content;

  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = icons[item.icon] || Sparkles;
            return (
              <div key={index} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Icon className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
