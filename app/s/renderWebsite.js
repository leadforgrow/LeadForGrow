"use client";

import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap,
  Lock,
  Loader2
} from 'lucide-react';

const DynamicIcon = ({ name, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.BookOpen || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

// Form Renderer Component
const FormRenderer = ({ formId, formToken, primaryColor }) => {
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (formToken) fetchFormConfig();
  }, [formToken]);

  const fetchFormConfig = async () => {
    try {
      const res = await fetch(`/api/forms/config?token=${formToken}`);
      const data = await res.json();
      if (data.success) {
        setFormConfig(data.data);
        const initial = {};
        data.data.fields.forEach(f => initial[f.name] = '');
        setFormData(initial);
      }
    } catch (err) {
      console.error("Form fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formToken, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        if (formConfig.redirectUrl) {
          setTimeout(() => window.location.href = formConfig.redirectUrl, 2000);
        }
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" /></div>;
  if (!formConfig) return <div className="p-8 bg-red-50 text-red-500 rounded-xl text-xs font-bold text-center">Form configuration missing</div>;

  if (status === 'success') {
    return (
      <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{formConfig.successMessage || 'Submission Received'}</h3>
        <p className="text-slate-500 font-medium text-sm">We've linked your inquiry to our system and will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formConfig.fields.map((field, idx) => (
        <div key={idx} className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
          {field.type === 'textarea' ? (
            <textarea
              required={field.required}
              className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm text-slate-900 placeholder:text-slate-300 resize-none h-24"
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
            />
          ) : (
            <input
              type={field.type}
              required={field.required}
              className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm text-slate-900 placeholder:text-slate-300"
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        style={{ backgroundColor: primaryColor }}
        className="w-full py-4 text-white rounded-xl font-bold text-base shadow-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative"
      >
        {submitting ? 'Sending Request...' : 'Confirm Appointment'}
      </button>
      <div className="flex items-center justify-center gap-2 mt-6">
         <Lock className="w-3 h-3 text-slate-300" />
         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Secure Data Gateway</span>
      </div>
    </form>
  );
};

export default function PublicWebsite({ website }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!website || website.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfe] flex-col p-8 text-center font-sans">
         <Globe className="w-12 h-12 text-slate-100 mb-6" />
         <h1 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">Access Restricted</h1>
         <p className="text-slate-400 max-w-sm font-normal text-sm">This website is currently in draft mode or the link is private.</p>
         <a href="/" className="mt-8 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95">Return Safely</a>
      </div>
    );
  }

  const { sections = [], settings = {}, primaryColor = '#4f46e5' } = website;
  const lightTemplates = ['Healthcare', 'Education', 'Professional Services', 'Local Services'];
  const firstSection = sections.find(s => s.active);
  const isHeroBackgroundImage = firstSection?.type === 'hero' && firstSection?.content?.backgroundType === 'image' && firstSection?.content?.backgroundImage;
  const isHeroDarkText = firstSection?.type === 'hero' && (firstSection?.content?.darkText || (!isHeroBackgroundImage && firstSection?.content?.darkText !== false && lightTemplates.includes(website.category)));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900" style={{ '--primary': primaryColor }}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm h-14' : 'bg-transparent h-20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ backgroundColor: primaryColor }}>
                {website.websiteName.charAt(0)}
              </div>
              <span className={`font-semibold text-lg tracking-tight ${!scrolled && !isMenuOpen && settings.navbar?.transparent ? (isHeroDarkText ? 'text-slate-900' : 'text-white') : 'text-slate-900'}`}>
                {website.websiteName}
              </span>
           </div>

           <div className="hidden md:flex items-center gap-10">
              {settings.navbar?.items?.map((item, idx) => (
                <a key={idx} href={item.link} className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${!scrolled && settings.navbar?.transparent ? (isHeroDarkText ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white') : 'text-slate-500 hover:text-indigo-600'}`}>
                  {item.text}
                </a>
              ))}
              <a 
                href={settings.navbar?.ctaLink || '#contact'} 
                className="px-5 py-2.5 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: settings.navbar?.ctaColor || primaryColor }}
              >
                {settings.navbar?.ctaText || 'Get Started'}
              </a>
           </div>

           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="md:hidden p-2 text-slate-900"
           >
             {isMenuOpen ? <LucideIcons.X className="w-6 h-6" /> : <LucideIcons.Menu className={`w-6 h-6 ${!scrolled && settings.navbar?.transparent ? 'text-white' : 'text-slate-900'}`} />}
           </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
             <div className="flex flex-col gap-4">
                {settings.navbar?.items?.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.link} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-bold text-slate-600 uppercase tracking-widest hover:text-indigo-600 px-2 py-4 border-b border-slate-50"
                  >
                    {item.text}
                  </a>
                ))}
             </div>
             <a 
                href={settings.navbar?.ctaLink || '#contact'} 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 text-center text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {settings.navbar?.ctaText || 'Get Started'}
              </a>
          </div>
        )}
      </nav>

      {/* Sections Renderer */}
      <main>
        {sections.filter(s => s.active).map((section) => {
          switch (section.type) {
            case 'hero':
              const isBackgroundImage = section.content.backgroundType === 'image' && section.content.backgroundImage;
              const isDark = section.content.darkText || (!isBackgroundImage && section.content.darkText !== false && lightTemplates.includes(website.category));
              return (
                <section key={section.id} className="relative min-h-screen flex items-center px-6 overflow-hidden">
                  {section.content.backgroundType === 'image' && section.content.backgroundImage ? (
                    <div className="absolute inset-0 z-0">
                      <img src={section.content.backgroundImage} className="w-full h-full object-cover scale-105 animate-pulse-slow" alt="Hero Background" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at top right, ${primaryColor}20, transparent), radial-gradient(circle at bottom left, ${primaryColor}10, transparent)` }}></div>
                  )}
                  
                   <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="max-w-3xl text-left">
                       {website.city && (
                        <div className={`inline-flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'} backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                          <LucideIcons.MapPin className="w-3.5 h-3.5 text-indigo-400" /> {website.city} {section.content.tagline || '• Premier Service'}
                        </div>
                       )}
                       {!website.city && section.content.tagline && (
                        <div className={`inline-flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white'} backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                          {section.content.tagline}
                        </div>
                       )}
                       <h1 className={`text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.95] ${isDark ? 'text-slate-900' : 'text-white'} animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
                         {section.content.headline}
                       </h1>
                       <p className={`text-xl md:text-2xl ${isDark ? 'text-slate-600' : 'text-white/80'} font-medium max-w-xl mb-14 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200`}>
                         {section.content.subheadline}
                       </p>
                       <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                          <a 
                           href={section.content.ctaLink} 
                           className={`px-12 py-5 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-none font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-indigo-600 hover:text-white active:scale-95 w-full sm:w-auto text-center`}
                         >
                            {section.content.ctaText}
                          </a>
                          {section.content.secondaryCtaText && (
                            <a 
                             href={section.content.secondaryCtaLink} 
                             className={`px-12 py-5 bg-transparent border-2 ${isDark ? 'border-slate-200 text-slate-900 hover:border-slate-900' : 'border-white/30 text-white hover:border-white'} rounded-none font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 w-full sm:w-auto text-center backdrop-blur-sm`}
                           >
                              {section.content.secondaryCtaText}
                            </a>
                          )}
                          {!section.content.secondaryCtaText && (
                            <div className={`flex items-center gap-4 ${isDark ? 'text-slate-400' : 'text-white/60'}`}>
                               <div className={`w-12 h-[1px] ${isDark ? 'bg-slate-200' : 'bg-white/20'}`}></div>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll to Explore</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                  
                  {/* Luxury Decorative Element */}
                  <div className="absolute bottom-20 right-20 hidden lg:block animate-in fade-in zoom-in duration-1000 delay-500">
                     <div className="w-40 h-40 border border-white/10 rounded-full flex items-center justify-center relative">
                        <div className="w-32 h-32 border border-white/20 rounded-full animate-spin-slow"></div>
                        <LucideIcons.ArrowDown className="absolute w-6 h-6 text-white/40" />
                     </div>
                  </div>
                </section>
              );

            case 'projects':
              return (
                <section key={section.id} id="projects" className="py-32 md:py-48 bg-white overflow-hidden">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
                      <div className="max-w-2xl">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">Portfolio</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">{section.content.title}</h2>
                      </div>
                      <p className="text-slate-400 text-lg font-medium max-w-xs">{section.content.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-slate-100 border border-slate-100">
                      {section.content.items?.map((project, idx) => (
                        <div key={idx} className="bg-white p-12 hover:bg-slate-50 transition-colors group cursor-pointer relative overflow-hidden">
                          <div className="aspect-[4/5] mb-10 overflow-hidden bg-slate-100 relative">
                             <img src={project.photo} className="w-full h-full object-cover grayscale-0 group-hover:scale-110 transition-transform duration-1000" alt={project.name} />
                             <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest">{project.status}</div>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{project.location}</p>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{project.name}</h3>
                          <p className="text-lg font-medium text-slate-600 mb-8">{project.price}</p>
                          <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all">
                             <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'gallery':
              return (
                <section key={section.id} id="gallery" className="py-24 bg-slate-900">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                      {section.content.items?.map((img, idx) => (
                        <div key={idx} className={`relative overflow-hidden group ${idx % 3 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                           <img src={img} className="w-full h-full object-cover aspect-square md:aspect-auto group-hover:scale-110 transition-transform duration-1000" />
                           <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <LucideIcons.Maximize2 className="w-8 h-8 text-white" />
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
              );

            case 'map':
              return (
                <section key={section.id} id="location" className="py-32 bg-white">
                   <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                      <div className="order-2 lg:order-1">
                         <div className="rounded-[40px] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 border-8 border-slate-50">
                             <iframe 
                               src={section.content.mapEmbed}
                               width="100%" 
                               height="500" 
                               style={{ border: 0 }} 
                               allowFullScreen="" 
                               loading="lazy"
                             ></iframe>
                         </div>
                      </div>
                      <div className="order-1 lg:order-2">
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">Location</p>
                         <h2 className="text-5xl font-black tracking-tighter text-slate-900 mb-8">{section.content.title}</h2>
                         <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">{section.content.address}</p>
                         
                         <div className="space-y-6">
                            {section.content.nearby?.map((place, idx) => (
                              <div key={idx} className="flex items-center justify-between py-6 border-b border-slate-100">
                                 <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">{place.name}</span>
                                 </div>
                                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{place.distance}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </section>
              );

            case 'courses':
            case 'services':
              return (
                <section key={section.id} id={section.type === 'courses' ? 'courses' : 'services'} className="py-24 md:py-32 bg-[#fafbfc] border-y border-slate-100">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{section.content.title}</h2>
                      <p className="text-slate-500 text-lg font-medium">{section.content.subtitle}</p>
                      <div className="w-12 h-1.5 mt-8 bg-indigo-100 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {section.content.items?.map((item, idx) => (
                        <div key={idx} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all group scale-100 ring-0 hover:ring-8 hover:ring-slate-50">
                          <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${primaryColor}08`, color: primaryColor }}>
                               <DynamicIcon name={item.icon} className="w-7 h-7" />
                            </div>
                            {item.duration && <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{item.duration}</span>}
                          </div>
                          <h3 className="text-xl font-bold mb-4 text-slate-900">{item.name}</h3>
                          <p className="text-slate-500 text-base leading-relaxed font-normal opacity-80">{item.description}</p>
                          {section.type === 'courses' && (
                            <button className="mt-8 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: primaryColor }}>
                               Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'features':
              return (
                <section key={section.id} id="about" className="py-24 md:py-32 bg-white">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">{section.content.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      {section.content.items?.map((feature, idx) => (
                        <div key={idx} className="text-center group">
                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-slate-100">
                             <DynamicIcon name={feature.icon} className="w-8 h-8 text-slate-900" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                          <p className="text-slate-500 leading-relaxed font-medium px-4">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faculty':
            case 'doctors':
              return (
                <section key={section.id} id={section.type === 'faculty' ? 'faculty' : 'doctors'} className="py-24 md:py-32 bg-[#fafbfc]">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{section.content.title}</h2>
                      <p className="text-slate-500 text-lg font-medium max-w-xl">{section.content.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {section.content.items?.map((member, idx) => (
                        <div key={idx} className="group flex flex-col bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                           <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 relative">
                              <img src={member.photo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={member.name} />
                           </div>
                           <div className="px-2 pb-4">
                             <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                             <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{member.designation}</p>
                             <div className="flex items-center gap-2 text-slate-400">
                                <DynamicIcon name="BookOpen" className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">{member.subject || member.experience}</span>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'testimonials':
              return (
                <section key={section.id} id="testimonials" className="py-24 md:py-32 bg-white overflow-hidden">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{section.content.title}</h2>
                      <p className="text-slate-500 text-lg font-medium">{section.content.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {section.content.items?.map((testimonial, idx) => (
                        <div key={idx} className="bg-slate-50 p-10 md:p-12 rounded-[3rem] relative">
                          <LucideIcons.Quote className="absolute top-10 right-10 w-12 h-12 text-slate-200" />
                          <p className="text-xl font-medium text-slate-700 leading-relaxed mb-10 relative z-10 italic">
                            "{testimonial.text}"
                          </p>
                          <div className="flex items-center gap-5">
                            <img src={testimonial.photo} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt={testimonial.name} />
                            <div>
                               <p className="font-bold text-slate-900">{testimonial.name}</p>
                               <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Alumni • Trusted Partner</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'agenda':
              return (
                <section key={section.id} id="agenda" className="py-24 md:py-32 bg-white">
                  <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20">
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{section.content.title}</h2>
                      <p className="text-slate-500 text-lg font-medium">{section.content.subtitle}</p>
                    </div>
                    <div className="space-y-12">
                      {section.content.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-8 group">
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap mb-2">{item.time}</div>
                            <div className="w-[2px] h-full bg-slate-100 group-last:bg-transparent"></div>
                          </div>
                          <div className="pb-12 group-last:pb-0">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'results':
              return (
                <section key={section.id} className="py-24 bg-slate-900 text-white">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                      {section.content.items?.map((stat, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="text-4xl md:text-6xl font-black text-indigo-400">{stat.value}</div>
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'form':
              return (
                <section key={section.id} id="contact" className="py-24 md:py-32 px-6 bg-slate-50">
                  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-24">
                    <div className="lg:w-1/2 lg:pt-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-8 text-emerald-600">
                         <Zap className="w-3.5 h-3.5 fill-current" /> Instant Response
                      </div>
                      <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-slate-900 leading-[1.1]">{section.content.title}</h2>
                      <p className="text-lg text-slate-500 font-medium leading-relaxed mb-12 max-w-md">
                        {section.content.subtitle}
                      </p>

                      <div className="space-y-6">
                         <div className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                               <Phone className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Primary Contact</p>
                               <p className="text-base font-bold text-slate-900">{website.phone || 'Available via Form'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                               <Mail className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Direct Email</p>
                               <p className="text-base font-bold text-slate-900 truncate">{website.email}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="lg:w-[500px] w-full bg-white rounded-[3rem] p-10 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100">
                       <FormRenderer formToken={section.content.formToken || section.content.formId} primaryColor={primaryColor} />
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base" style={{ backgroundColor: primaryColor }}>
               {website.websiteName.charAt(0)}
             </div>
             <span className="font-bold text-xl tracking-tight text-slate-900">{website.websiteName}</span>
          </div>

          <div className="flex gap-8">
             <DynamicIcon name="Twitter" className="w-5 h-5 text-slate-300 hover:text-indigo-600 transition-colors" />
             <DynamicIcon name="Instagram" className="w-5 h-5 text-slate-300 hover:text-indigo-600 transition-colors" />
             <DynamicIcon name="Linkedin" className="w-5 h-5 text-slate-300 hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </footer>

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
