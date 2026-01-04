"use client";

import React from 'react';
import { ArrowUpRight, ArrowRight, Briefcase, Users, Layout, Check, Menu, X } from 'lucide-react';

export default function ServiceProTemplate({ content, brandName }) {
  const { hero, services, steps, about, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#4f46e5";
  const accentColor = theme?.accentColor || "#10b981";
  const bgColor = theme?.backgroundColor || "#ffffff";
  const textColor = theme?.textColor || "#1e293b";

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: primaryColor }}>{brandName[0]}</div>
            <span className="text-xl font-bold tracking-tight" style={{ color: textColor }}>{brandName}</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          {(navbar?.links || []).map((link, i) => (
            <a key={i} href={link.href} className="text-sm font-bold opacity-50 hover:opacity-100 uppercase tracking-widest transition-opacity" style={{ '--hover-color': primaryColor }}>{link.label}</a>
          ))}
          <a href={navbar?.ctaHref || "#contact"}>
            <button 
              className="px-7 py-3 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-100"
              style={{ backgroundColor: primaryColor }}
            >
              {navbar?.ctaText || "Book a Call"}
            </button>
          </a>
        </div>
        <button className="lg:hidden" style={{ color: textColor }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
           {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Modern Split Hero */}
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-40 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
               <Briefcase className="w-3.5 h-3.5" /> Professional Services
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight" style={{ color: textColor }}>
               {hero.heading}
            </h1>
            <p className="text-xl font-medium mb-12 max-w-2xl leading-relaxed opacity-60">
               {hero.subheading}
            </p>
            <div className="flex items-center gap-6">
                <a href={hero.ctaHref || "#contact"}>
                  <button 
                    className="px-10 py-5 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                    style={{ backgroundColor: primaryColor }}
                  >
                     {hero.ctaText} <ArrowRight className="w-5 h-5" />
                  </button>
                </a>
                <div className="hidden sm:flex -space-x-4">
                    {[1,2,3].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200" />)}
                    <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>+10k</div>
                </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-xl relative">
             <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" style={{ backgroundColor: primaryColor }}></div>
             <img src={hero.visualUrl} className="w-full h-auto rounded-[3.5rem] shadow-2xl relative z-10" alt="Service Hero" />
             <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce relative z-20">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}><Check className="w-6 h-6" /></div>
                <div>
                    <div className="text-lg font-bold" style={{ color: textColor }}>Top Verified</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Network</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-24">
             <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">{services.title}</h2>
             <p className="text-lg font-medium opacity-50">We provide a full-spectrum of digital services to help your brand evolve.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.items.map((item, i) => (
              <div key={i} className="group p-1 bg-slate-100 rounded-[3rem] transition-all duration-700" style={{ ':hover': { backgroundColor: primaryColor } }}>
                 <div className="bg-white p-10 lg:p-14 rounded-[2.8rem] h-full transition-transform duration-700 group-hover:-translate-y-2 group-hover:translate-x-1">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 transition-colors group-hover:bg-indigo-500" style={{ '--hover-bg': primaryColor }}>
                        <ArrowUpRight className="w-7 h-7 text-indigo-600 transition-colors group-hover:text-white" style={{ '--primary': primaryColor }} />
                    </div>
                    <h3 className="text-3xl font-bold mb-6">{item.title}</h3>
                    <p className="text-lg font-medium leading-relaxed mb-10 opacity-40">{item.description}</p>
                    <button className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: primaryColor }}>Explore Service <ArrowRight className="w-4 h-4" /></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow - Steps */}
      <section id="workflow" className="py-24 lg:py-40 px-6 bg-slate-950 text-white rounded-[5rem] mx-6">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10 text-center lg:text-left">
              <h2 className="text-4xl lg:text-7xl font-bold tracking-tighter leading-none">{steps.title}</h2>
              <p className="opacity-50 text-lg font-medium max-w-md">Our methodology is designed for scalability and efficiency across all projects.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
             {steps.items.map((item, i) => (
               <div key={i} className="relative group">
                  <div className="text-8xl font-black text-white/5 absolute -top-10 -left-6 group-hover:text-white/10 transition-colors" style={{ '--hover-text': `${primaryColor}10` }}>{i+1}</div>
                  <div className="relative z-10">
                     <h3 className="text-2xl font-bold mb-6 transition-colors group-hover:text-indigo-400" style={{ '--hover-text': primaryColor }}>{item.title}</h3>
                     <p className="text-slate-500 text-lg font-medium leading-relaxed group-hover:text-slate-300 transition-colors">{item.description}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-40 px-6">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
               <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-10 -z-10" style={{ backgroundColor: primaryColor }}></div>
               <img src={about.visualUrl} className="w-full h-auto rounded-[3.5rem] shadow-2xl skew-y-1" alt="Our Team" />
            </div>
            <div>
               <h2 className="text-4xl lg:text-5xl font-bold mb-10 tracking-tight">{about.title}</h2>
               <p className="text-xl font-medium leading-relaxed opacity-60">{(about.text || "")}</p>
               <div className="mt-12 grid grid-cols-2 gap-10">
                  <div>
                    <div className="text-4xl font-black" style={{ color: primaryColor }}>99%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Client ROI</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black" style={{ color: primaryColor }}>500+</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Projects Done</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Corporate Form Section */}
      <section id="contact" className="py-24 lg:py-40 px-6 bg-slate-50 rounded-[5rem] mx-6">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-7xl font-bold mb-6 tracking-tighter" style={{ color: textColor }}>{form.title}</h2>
            <p className="text-lg font-medium mb-16 opacity-50">{form.subtitle}</p>
            <div className="bg-white p-8 lg:p-16 rounded-[4rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
               {form.fields.map((field, i) => (
                 <div key={i} className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">{field.label}</label>
                    <input type={field.type || "text"} placeholder={field.placeholder} className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-slate-100 rounded-2xl outline-none font-bold text-slate-700 transition-all" />
                 </div>
               ))}
               <button 
                 className="md:col-span-2 w-full py-6 text-white rounded-2xl font-black text-xl transition-active shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                 style={{ backgroundColor: primaryColor }}
               >
                  {form.buttonText} <ArrowRight className="w-6 h-6" />
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                <span className="text-lg font-bold" style={{ color: textColor }}>{brandName}</span>
            </div>
            <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: `${textColor}40` }}>
               {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="hover:opacity-100 transition-opacity" style={{ '--hover-color': primaryColor }}>{link.label}</a>)}
            </div>
            <div className="text-sm font-medium opacity-50 uppercase tracking-widest text-right">
               {footer.contactInfo?.email} <br />
               {footer.contactInfo?.phone}
            </div>
         </div>
      </footer>
    </div>
  );
}
