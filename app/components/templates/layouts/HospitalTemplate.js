"use client";

import React, { useState } from 'react';
import { 
  Phone, 
  Calendar, 
  User, 
  Stethoscope, 
  Activity, 
  Heart, 
  Clock, 
  MapPin, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck,
  Star,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Check
} from 'lucide-react';

export default function HospitalTemplate({ content, brandName }) {
  const { 
    hero, 
    services, 
    booking, 
    doctors, 
    footer, 
    navbar, 
    theme 
  } = content;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  // Styling helpers
  const primaryColor = theme?.primaryColor || "#0ea5e9";
  const bodyFont = theme?.bodyFont || "Inter";

  return (
    <div 
      className="min-h-screen bg-white selection:bg-sky-50 selection:text-sky-900"
      style={{ fontFamily: `'${bodyFont}', sans-serif` }}
    >
      {/* Trust-Focused Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-100">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900 uppercase">{brandName}</span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {(navbar?.links || []).map((link, i) => (
            <a key={i} href={link.href} className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors uppercase tracking-[0.15em]">{link.label}</a>
          ))}
          <a href={navbar?.ctaHref || "#booking"}>
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold text-[11px] uppercase tracking-wider hover:bg-sky-600 transition-all active:scale-95 shadow-md">
              {navbar?.ctaText || "Book Now"}
            </button>
          </a>
        </div>

        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Hero Section - Medical Excellence */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-full text-sky-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              <ShieldCheck className="w-4 h-4" /> Leading Medical Center
            </div>
            <h1 className="text-4xl lg:text-7xl font-semibold text-slate-900 leading-[1.15] mb-8 tracking-tight uppercase">
              {hero.heading}
            </h1>
            <p className="text-sm lg:text-lg text-slate-500 font-medium mb-12 max-w-xl leading-relaxed italic">
              {hero.subheading}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 lg:justify-start">
              <a href={hero.ctaHref || "#booking"} className="w-full sm:w-auto">
                <button className="w-full px-8 py-5 bg-sky-600 text-white rounded-full font-semibold text-sm uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-sky-100 active:scale-95">
                  {hero.ctaText} <Calendar className="w-5 h-5" />
                </button>
              </a>
              <div className="flex items-center gap-3 px-4 py-2 lg:border-l border-slate-100">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />)}
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80 underline decoration-sky-100 underline-offset-4">Join 15K+ Patients</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-square lg:aspect-auto">
            <div className="absolute -inset-10 bg-sky-200/20 rounded-full blur-[120px] -z-10" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl skew-x-1 group">
               <img src={hero.visualUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Hospital Hero" />
               <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl flex items-center gap-4 border border-white/50 animate-in zoom-in-95 duration-700">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check className="w-5 h-5 stroke-[3]" /></div>
                  <div className="text-left">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Emergency Status</p>
                     <p className="text-xs font-semibold text-slate-900 uppercase">Available 24/7 Today</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Services Area */}
      <section id="services" className="py-24 lg:py-32 px-6 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-2xl lg:text-5xl font-semibold text-slate-900 mb-6 uppercase tracking-tight">{services.title}</h2>
            <div className="w-12 h-1 bg-sky-600 mx-auto mb-6" />
            <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Pioneering Clinical Excellence for over 25 years</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {(services.items || []).map((item, i) => (
              <div key={i} className="p-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-10 group-hover:bg-sky-500 transition-colors">
                  <Stethoscope className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 font-medium text-[13px] leading-relaxed mb-8 opacity-80">{item.description}</p>
                <div className="w-0 group-hover:w-full h-0.5 bg-sky-500/20 transition-all duration-700 mb-6" />
                <button className="flex items-center gap-2 text-sky-600 font-bold text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                  Consult Now <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Booking Module */}
      <section id="booking" className="py-24 lg:py-32 px-6 relative overflow-hidden">
         <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] p-10 lg:p-20 text-white overflow-hidden relative shadow-3xl">
            <div className="absolute top-0 right-0 p-20 opacity-5 -scale-x-100">
               <Activity className="w-96 h-96" />
            </div>
            {!booked ? (
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div>
                    <span className="text-sky-400 font-bold text-[11px] uppercase tracking-[0.4em] block mb-6 px-1">Digital Concierge</span>
                    <h2 className="text-3xl lg:text-6xl font-semibold mb-8 uppercase tracking-tighter leading-[1.1]">{booking.title}</h2>
                    <p className="text-slate-400 text-base lg:text-lg mb-12 font-medium italic opacity-70 leading-relaxed">{booking.subtitle}</p>
                    <div className="flex flex-col gap-6">
                       <div className="flex items-center gap-5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500 transition-colors"><Phone className="w-5 h-5 text-sky-400 group-hover:text-white" /></div>
                          <div><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Clinic Hotline</p><p className="font-semibold text-lg tracking-tight uppercase">+1 (555) HEALTH</p></div>
                       </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-[2.5rem] border border-white/10 shadow-inner">
                    <div className="space-y-6">
                       {(booking.fields || []).map((f, i) => (
                         <div key={i} className="space-y-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 italic">{f.label}</label>
                            <input 
                              type={f.type || "text"} 
                              placeholder={f.placeholder} 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-medium text-sm text-white placeholder:text-slate-600 appearance-none" 
                            />
                         </div>
                       ))}
                       <button 
                        onClick={() => setBooked(true)}
                        className="w-full py-5 lg:py-6 bg-sky-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-2xl active:scale-[0.98] mt-4"
                       >
                         {booking.buttonText}
                       </button>
                    </div>
                  </div>
               </div>
            ) : (
               <div className="relative z-10 text-center py-10 lg:py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-emerald-500/30">
                    <ShieldCheck className="w-10 h-10 lg:w-14 lg:h-14 stroke-[2]" />
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-semibold mb-6 uppercase tracking-tight">Request Received</h2>
                  <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 italic">One of our medical coordinators will contact you within 20 minutes.</p>
                  <button onClick={() => setBooked(false)} className="px-10 py-4 border border-white/10 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-white hover:text-black transition-all">New Appointment</button>
               </div>
            )}
         </div>
      </section>

      {/* Specialist Directory */}
      <section id="doctors" className="py-24 lg:py-32 px-6 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
               <div className="max-w-2xl">
                  <span className="text-sky-500 font-bold text-[10px] uppercase tracking-[0.4em] block mb-4">Board Certified Experts</span>
                  <h2 className="text-3xl lg:text-6xl font-semibold text-slate-900 mb-8 uppercase tracking-tight leading-none">{doctors.title}</h2>
                  <p className="text-slate-500 font-medium text-base lg:text-lg leading-relaxed italic opacity-80">Our clinical team embodies excellence, passion, and years of specialized surgical experience.</p>
               </div>
               <button className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg active:scale-95">Directory Access</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
               {(doctors.items || []).map((doc, i) => (
                 <div key={i} className="group relative">
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-xl relative bg-slate-100">
                       <img src={doc.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] grayscale-[0.2] group-hover:grayscale-0" alt={doc.name} />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-10 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">Available for Consultation</p>
                          <div className="flex gap-2">
                             {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                          </div>
                       </div>
                    </div>
                    <div className="text-center lg:text-left px-4">
                       <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight uppercase mb-2">{doc.name}</h3>
                       <p className="text-sky-600 font-bold text-[10px] uppercase tracking-[0.3em]">{doc.role}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Stylish Medical Footer */}
      <footer className="bg-slate-50 py-24 lg:py-32 px-6 lg:px-12 border-t border-slate-100 mt-20">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
            <div className="lg:col-span-1">
               <div className="flex items-center gap-3 mb-10">
                  <div className="p-1.5 bg-sky-500 rounded-lg shadow-lg shadow-sky-100"><Activity className="w-4 h-4 text-white" /></div>
                  <span className="text-lg font-semibold text-slate-900 tracking-tight uppercase leading-none">{brandName}</span>
               </div>
               <p className="text-slate-500 font-medium text-[13px] leading-relaxed mb-10 opacity-80 italic">Setting the global standard for surgical precision and compassionate healthcare since 1998.</p>
               <div className="flex gap-4">
                  {[Instagram, Facebook, Linkedin].map((Social, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-sky-500 hover:bg-white transition-all group cursor-pointer shadow-sm">
                       <Social className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-10 underline underline-offset-8 decoration-slate-200">Patient Resources</p>
               <div className="space-y-5">
                  {(footer?.links || []).map((l, i) => (
                     <a key={i} href={l.href} className="block text-slate-900 font-semibold text-[11px] uppercase tracking-widest hover:text-sky-600 transition-colors">{l.label}</a>
                  ))}
               </div>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-10 underline underline-offset-8 decoration-slate-200">Our Location</p>
               <div className="flex gap-4 mb-8 group">
                  <MapPin className="w-5 h-5 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-slate-600 font-medium text-[13px] leading-relaxed uppercase tracking-tight">Suite 400, Clinical Tower B<br />Metro Health Plaza, SC 54321</p>
               </div>
               <div className="flex gap-4">
                  <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">ER OPEN 24/7</p>
                    <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest italic leading-none">Main Clinic: 08:00 - 20:00</p>
                  </div>
               </div>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-10 underline underline-offset-8 decoration-slate-200">Tele-Health</p>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[11px] font-semibold text-slate-900 mb-6 uppercase tracking-wider italic">Sign up for medical news</p>
                  <div className="flex gap-2">
                     <input type="email" placeholder="Email" className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold focus:border-sky-500 outline-none transition-all appearance-none" />
                     <button className="p-2.5 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all"><ChevronRight className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">© 2026 {brandName} Medical Group. Worldwide.</p>
            <div className="flex items-center gap-6 opacity-30">
               <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
               <Activity className="w-6 h-6 stroke-[1.5]" />
            </div>
         </div>
      </footer>
      
      <style jsx global>{`
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15); }
      `}</style>
    </div>
  );
}
