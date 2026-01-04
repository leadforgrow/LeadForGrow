"use client";

import React from 'react';

export default function FooterSection({ content }) {
  const { companyName, links, contactInfo } = content;

  return (
    <footer className="py-16 px-6 bg-slate-50 border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            {companyName}
          </h2>
          <p className="text-slate-400 font-medium text-sm">© {new Date().getFullYear()} All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-10">
          {links.map((link, index) => (
            <a key={index} href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="text-center md:text-right">
          <p className="text-slate-900 font-bold mb-1">{contactInfo.email}</p>
          <p className="text-slate-500 font-medium text-sm">{contactInfo.phone}</p>
        </div>
      </div>
    </footer>
  );
}
