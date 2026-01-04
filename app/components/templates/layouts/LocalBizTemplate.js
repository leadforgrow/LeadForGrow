"use client";

import React from 'react';
import { Phone, MapPin, Clock, Star, ArrowRight, Check, Menu, X } from 'lucide-react';

export default function LocalBizTemplate({ content, brandName }) {
  const { hero, about, services, location, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#059669";
  const accentColor = theme?.accentColor || "#fbbf24";
  const bgColor = theme?.backgroundColor || "#fffcf5";
  const textColor = theme?.textColor || "#292524";

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-100" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Friendly Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fffcf5]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 lg:px-12 flex items-center justify-between">
        <div className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>{brandName}</div>
        <div className="hidden lg:flex items-center gap-10">
          <div className="hidden md:flex items-center gap-8">
            {(navbar?.links || []).map((link, i) => (
              <a key={i} href={link.href} className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity" style={{ '--hover-color': primaryColor }}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: primaryColor }}>
             <Phone className="w-4 h-4" /> {footer.contactInfo?.phone}
          </div>
          <a href={navbar?.ctaHref || "#contact"}>
            <button 
              className="px-6 py-3 text-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              {navbar?.ctaText || "Book Appointment"}
            </button>
          </a>
        </div>
        <button className="lg:hidden" style={{ color: textColor }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
           {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Warm Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-6">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
               <span className="ml-2 text-sm font-bold text-stone-400 uppercase tracking-widest">5.0 Community Rated</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8" style={{ color: primaryColor }}>
               {hero.heading}
            </h1>
            <p className="text-xl font-medium mb-12 max-w-xl leading-relaxed opacity-60">
               {hero.subheading}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <a href={hero.ctaHref || "#contact"} className="w-full sm:w-auto">
                 <button 
                   className="w-full px-10 py-5 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                   style={{ backgroundColor: primaryColor }}
                 >
                    {hero.ctaText} <ArrowRight className="w-5 h-5" />
                 </button>
               </a>
               <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-stone-200 text-stone-600 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all">Our Story</button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-xl">
             <div className="relative p-4 bg-white rounded-[3rem] shadow-2xl rotate-2">
                <img src={hero.visualUrl} className="w-full h-auto rounded-[2.5rem]" alt="Local Hero" />
                <div 
                   className="absolute -bottom-8 -right-8 p-8 rounded-[2.5rem] shadow-xl font-black text-2xl -rotate-6"
                   style={{ backgroundColor: accentColor, color: 'white' }}
                >
                   EST. 1995
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Local Trust Grid */}
      <section className="py-20 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
           {[
             { icon: MapPin, title: "Locally Owned", desc: "Located in the heart of our city." },
             { icon: Clock, title: "Quick Service", desc: "We respect your time every day." },
             { icon: Check, title: "Guaranteed Work", desc: "100% satisfaction on every job." }
           ].map((item, i) => (
             <div key={i} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                   <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm font-medium opacity-50">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* About Local Biz */}
      <section className="py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-20">
          <div className="flex-1">
             <h2 className="text-4xl lg:text-5xl font-bold mb-10 tracking-tight" style={{ color: textColor }}>{about.title}</h2>
             <p className="text-xl font-medium leading-relaxed mb-10 opacity-60">{about.text}</p>
             <div className="space-y-4">
                {['Family Operated', 'Certified Technicians', 'Insured & Bonded'].map(c => (
                  <div key={c} className="flex items-center gap-3 font-bold uppercase text-xs tracking-widest" style={{ color: primaryColor }}>
                     <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}><Check className="w-3 h-3" /></div>
                     {c}
                  </div>
                ))}
             </div>
          </div>
          <div className="flex-1">
             <img src={about.visualUrl} className="w-full h-auto rounded-[3rem] shadow-xl border-8 border-white -rotate-2" alt="Our Shop" />
          </div>
        </div>
      </section>

      {/* Map/Location Section */}
      <section id="location" className="py-24 text-white rounded-[4rem] mx-6" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
             <h2 className="text-4xl lg:text-6xl font-bold mb-10 tracking-tight">{location.title}</h2>
             <div className="space-y-8">
                {(location.text || "").split('\n').map((l, i) => (
                  <div key={i} className="flex gap-4 text-xl text-stone-300 font-medium">
                     <MapPin className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                     {l}
                  </div>
                ))}
             </div>
             <button className="mt-12 px-8 py-4 bg-emerald-500 text-emerald-950 rounded-xl font-bold hover:bg-white transition-all uppercase tracking-widest text-xs">Get Directions</button>
          </div>
          <div className="flex-1 w-full h-[400px] bg-stone-800 rounded-[3rem] overflow-hidden grayscale border-4 border-emerald-800 shadow-2xl">
             <img src={location.visualUrl} className="w-full h-full object-cover opacity-60" alt="Map View" />
          </div>
        </div>
      </section>

      {/* Local Contact Form */}
      <section id="contact" className="py-24 lg:py-40 px-6">
         <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: textColor }}>{form.title}</h2>
            <p className="text-lg font-medium mb-12 opacity-50">{form.subtitle}</p>
            <form className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 space-y-6 text-left">
               {form.fields.map((f, i) => (
                 <div key={i} className="space-y-3 font-bold uppercase text-[10px] tracking-widest" style={{ color: `${textColor}40` }}>
                    <label className="ml-2">{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} className="w-full px-8 py-5 bg-stone-50 border-2 border-transparent focus:border-emerald-200 rounded-2xl outline-none text-stone-800 transition-all font-bold" />
                 </div>
               ))}
               <button 
                 className="w-full py-6 text-white rounded-2xl font-black text-xl hover:opacity-90 shadow-xl transition-all"
                 style={{ backgroundColor: primaryColor }}
               >
                  {form.buttonText}
               </button>
            </form>
         </div>
      </section>

      {/* Friendly Footer */}
      <footer className="py-16 bg-white border-t border-stone-100 text-center">
         <div className="text-2xl font-black mb-8 tracking-tighter uppercase" style={{ color: primaryColor }}>{brandName}</div>
         <p className="text-stone-400 font-bold uppercase text-[10px] tracking-[0.5em] mb-12">Building community since 1995</p>
         <div className="flex justify-center gap-6 mb-12">
            {(footer.links || []).map((link, i) => (
                <a key={i} href={link.href || "#"} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>
            ))}
         </div>
         <div className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.5em]">© {new Date().getFullYear()} {brandName.toUpperCase()} ALL RIGHTS RESERVED</div>
      </footer>
    </div>
  );
}
