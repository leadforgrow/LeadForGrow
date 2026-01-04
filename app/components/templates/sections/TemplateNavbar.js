"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function TemplateNavbar({ brandName, dark = false, accentColor = 'indigo' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const accentClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    slate: 'bg-slate-900 hover:bg-slate-800',
    emerald: 'bg-emerald-600 hover:bg-emerald-700'
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <div className={`text-2xl font-bold tracking-tight ${dark && !isScrolled ? 'text-white' : 'text-slate-900'}`}>
          {brandName || 'Brand'}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Services', 'Pricing', 'About'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${dark && !isScrolled ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              {item}
            </a>
          ))}
          <button className={`px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-all shadow-lg active:scale-95 ${accentClasses[accentColor] || accentClasses.indigo}`}>
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className={dark && !isScrolled ? 'text-white' : 'text-slate-900'} /> : <Menu className={dark && !isScrolled ? 'text-white' : 'text-slate-900'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl animate-in slide-in-from-top duration-300">
           {['Features', 'Services', 'Pricing', 'About'].map((item) => (
            <a key={item} href="#" className="text-lg font-bold text-slate-800">{item}</a>
          ))}
          <button className={`w-full py-4 rounded-xl font-medium text-white ${accentClasses[accentColor] || accentClasses.indigo}`}>
            Contact Us
          </button>
        </div>
      )}
    </nav>
  );
}
