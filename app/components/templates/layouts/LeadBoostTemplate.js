"use client";

import React from 'react';
import { ArrowRight, Sparkles, Target, Shield, Zap, Quote, Menu, X } from 'lucide-react';

export default function LeadBoostTemplate({ content, brandName }) {
  const { hero, problemSolution, benefits, form, trust, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Fallback for missing configurations
  const navLinks = navbar?.links || [
    { label: "Benefits", href: "#benefits" },
    { label: "About", href: "#about" }
  ];
  const navCta = navbar?.ctaText || "Get Started";
  const navCtaHref = navbar?.ctaHref || "#contact";

  // Dynamic Styles
  const primaryBg = { backgroundColor: theme?.primaryColor || '#2563eb' };
  const primaryText = { color: theme?.primaryColor || '#2563eb' };
  const secondaryBg = { backgroundColor: theme?.secondaryColor || '#1d4ed8' };
  const accentText = { color: theme?.accentColor || '#f59e0b' };
  const textColor = theme?.textColor || '#1e293b';

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: theme?.backgroundColor || '#ffffff', color: textColor }}>
      {/* Custom Header for LeadBoost */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 flex items-center justify-between">
        <div className="text-2xl font-bold text-white tracking-tight">{brandName}</div>
        <div className="hidden md:flex items-center gap-8 text-white/80 font-medium text-sm uppercase tracking-widest">
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
          ))}
          <a href={navCtaHref}>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg" style={primaryText}>
              {navCta}
            </button>
          </a>
        </div>
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden" style={primaryBg}>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 -z-0"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              {hero.heading}
            </h1>
            <p className="text-xl text-blue-100 font-medium mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {hero.subheading}
            </p>
            <a href={hero.ctaHref || "#contact"}>
              <button className="px-10 py-5 bg-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0" style={primaryText}>
                {hero.ctaText} <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/20 rounded-[3rem] blur-3xl opacity-30 -z-10 group-hover:scale-110 transition-all duration-700"></div>
              <img 
                src={hero.visualUrl} 
                alt="Hero" 
                className="w-full h-auto rounded-[2.5rem] border-8 border-white/10 shadow-2xl relative z-10 group-hover:rotate-1 transition-transform duration-700" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-12 bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-10">{trust.title}</p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-30 grayscale saturate-0">
            {trust.items.map((logo, i) => (
              <img key={i} src={logo} className="h-8 w-auto hover:grayscale-0 transition-all duration-500" alt="Partner" />
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="about" className="py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-20">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight tracking-tight">
              {problemSolution.title}
            </h2>
            <div className="space-y-6 text-lg opacity-80 font-medium leading-relaxed">
              {(problemSolution.text || "").split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <img src={problemSolution.visualUrl} className="w-full h-auto rounded-[3rem] shadow-xl border-4 border-slate-50" alt="Strategy" />
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section id="benefits" className="py-24 lg:py-32 px-6 bg-slate-50 rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-20">{benefits.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.items.map((item, i) => {
              const Icon = { Zap, Target, Shield }[item.icon] || Zap;
              return (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transiton-all" style={{ backgroundColor: `${theme?.primaryColor}15` }}>
                    <Icon className="w-8 h-8 transition-colors" style={primaryText} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="opacity-70 font-medium leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="contact" className="py-24 lg:py-48 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-10 lg:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20" style={secondaryBg}></div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">{form.title}</h2>
              <p className="text-blue-100 opacity-60 text-lg font-medium mb-12">{form.subtitle}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {form.fields.map((field, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">{field.label}</label>
                    <input type={field.type || "text"} placeholder={field.placeholder} className="w-full px-8 py-5 bg-white/5 border-2 border-transparent focus:border-blue-500/50 rounded-2xl outline-none text-white transition-all font-medium" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-6 text-white rounded-2xl font-bold text-xl hover:bg-white transition-all flex items-center justify-center gap-3 hover:text-slate-900" style={primaryBg}>
                {form.buttonText} <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold">{brandName}</div>
          <div className="flex gap-8 text-sm font-bold opacity-40 uppercase tracking-widest">
            {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="hover:opacity-100 transition-colors" style={{ '--hover': theme?.primaryColor }}>{link.label}</a>)}
          </div>
          <div className="opacity-40 text-sm font-medium">© {new Date().getFullYear()} {brandName}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
