"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { 
  Save, 
  Globe, 
  Settings, 
  Eye, 
  ChevronLeft,
  Layout,
  Type,
  Image as ImageIcon,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Check,
  TrendingUp,
  ShieldCheck,
  Zap,
  Palette,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Stethoscope,
  Heart,
  Baby,
  PlusCircle,
  Menu,
  MoreVertical,
  MousePointer2,
  Lock,
  Loader2,
  RefreshCw,
  Wand2,
  Sparkles,
  PartyPopper,
  LayoutDashboard,
  ArrowRight,
  PlusSquare,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  Phone,
  Mail,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserNavbar from '../../../user/Header';
import PublicWebsite from '../../../s/renderWebsite';
import { defaultContent } from '../../../components/templates/content/defaultContent';

const DynamicIcon = ({ name, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

export default function WebsiteEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [website, setWebsite] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [forms, setForms] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  useEffect(() => {
    fetchWebsite();
    fetchForms();
  }, [id]);

  const fetchWebsite = async () => {
    try {
      const res = await fetch(`/api/website-funnel/${id}`);
      const data = await res.json();
      if (data.success) {
        let websiteData = data.website;
        
        // AUTO-REPAIR: If website has no sections, inject default based on category
        if (!websiteData.sections || websiteData.sections.length === 0) {
          const defaults = defaultContent[websiteData.category] || defaultContent['Healthcare'];
          websiteData.sections = defaults.sections;
          websiteData.settings = defaults.settings;
          toast.success(`Applied ${websiteData.category} template defaults`);
        }

        setWebsite(websiteData);
        if (websiteData.sections?.length > 0) setExpandedSection(websiteData.sections[0].id);
      } else {
        toast.error('Failed to load website');
      }
    } catch (error) {
      console.error("Fetch error", error);
      toast.error('Error loading website');
    } finally {
      setLoading(false);
    }
  };

  const fetchForms = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/forms?userId=${userId}`);
      const data = await res.json();
      if (data.success) setForms(data.data);
    } catch (err) {
      console.error("Forms fetch fail", err);
    }
  };

  const handleSave = async (isPublish = false) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/website-funnel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          websiteId: id, 
          ...website,
          status: isPublish ? 'published' : website.status
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isPublish ? 'Website Published Live!' : 'Changes Saved');
        setWebsite(data.website);
        if (isPublish) setShowPublishSuccess(true);
      }
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateSectionContent = (sectionId, field, value) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, [field]: value } } 
          : s
      )
    }));
  };

  const updateNavbar = (field, value) => {
    setWebsite(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        navbar: { ...prev.settings.navbar, [field]: value }
      }
    }));
  };

  const moveSection = (index, direction) => {
    const newSections = [...website.sections];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setWebsite({ ...website, sections: newSections });
  };

  const addServiceItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), { name: 'New Service', description: '', icon: 'Stethoscope' }] } } 
          : s
      )
    }));
  };

  const addDoctorItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), { name: 'Dr. New', designation: '', photo: '', experience: '' }] } } 
          : s
      )
    }));
  };

  const addProjectItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), { name: 'Project Name', location: 'City', price: 'Price', status: 'Upcoming', photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' }] } } 
          : s
      )
    }));
  };

  const addGalleryItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'] } } 
          : s
      )
    }));
  };

  const addNearbyItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, nearby: [...(s.content.nearby || []), { name: 'New Landmark', distance: '10 Mins' }] } } 
          : s
      )
    }));
  };

  const addAgendaItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), { title: 'New Session', time: '10:00 AM', description: 'Session details...' }] } } 
          : s
      )
    }));
  };

  const addResultItem = (sectionId) => {
    setWebsite(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, items: [...(s.content.items || []), { label: 'New Stat', value: '100+' }] } } 
          : s
      )
    }));
  };

  if (loading || !website) return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waking up the engine...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden font-sans transition-colors duration-300">
      {/* Top Header */}
      <div className="h-16 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/website-funnel')} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 group transition-all">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none mb-1.5 flex items-center gap-2">
              {website.websiteName}
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] rounded-md font-black tracking-widest uppercase">Editor</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
               {website.category} Infrastructure • {website.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[14px] font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 border border-transparent dark:border-slate-700"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Progress
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] font-bold text-xs shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Globe className="w-4 h-4" /> Go Live Now
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Editor) */}
        <div className="w-[340px] bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden relative transition-colors">
          <div className="px-6 py-4 flex gap-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
             {[
               { id: 'sections', icon: Layout, label: 'Content' },
               { id: 'config', icon: Palette, label: 'Design' },
               { id: 'hosting', icon: Globe, label: 'Hosting' }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#1C2539] shadow-lg shadow-slate-200/50 dark:shadow-none text-indigo-600 dark:text-indigo-400 ring-1 ring-slate-100 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <tab.icon className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-8">
             {activeTab === 'sections' && (
               <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Funnel Sections</h3>
                    <div className="p-1 px-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                       <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">{website.sections?.length || 0} Layers</p>
                    </div>
                  </div>

                  {(website.sections || []).map((section, idx) => (
                    <div key={section.id} className={`rounded-[22px] border transition-all duration-300 ${expandedSection === section.id ? 'border-indigo-600 bg-slate-50/50 dark:bg-slate-900/30 ring-1 ring-indigo-100 dark:ring-indigo-900/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:scale-[1.01]'}`}>
                      <div 
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                               <Layout className={`w-4 h-4 ${expandedSection === section.id ? 'text-indigo-600' : 'text-slate-300'}`} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{section.type}</span>
                         </div>
                         <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => moveSection(idx, -1)} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ChevronUp className="w-3.5 h-3.5 text-slate-400" /></button>
                            <button onClick={() => moveSection(idx, 1)} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ChevronDown className="w-3.5 h-3.5 text-slate-400" /></button>
                         </div>
                      </div>

                      {expandedSection === section.id && (
                        <div className="p-5 pt-0 space-y-5 animate-in slide-in-from-top-2 duration-300">
                           {/* Hero Content Editor */}
                           {section.type === 'hero' && (
                             <>
                                <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-indigo-600/10 rounded-2xl transition-all">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tagline / Location</label>
                                  <input 
                                    className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border-none text-xs font-black text-indigo-600 shadow-sm"
                                    value={section.content.tagline || ''}
                                    placeholder="e.g. • Premier Service"
                                    onChange={(e) => updateSectionContent(section.id, 'tagline', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-indigo-600/10 rounded-2xl transition-all">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Hero Title</label>
                                  <textarea 
                                    className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border-none text-xs font-bold text-slate-900 dark:text-white shadow-sm resize-none h-24"
                                    value={section.content.headline}
                                    onChange={(e) => updateSectionContent(section.id, 'headline', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-indigo-600/10 rounded-2xl transition-all">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Description</label>
                                  <textarea 
                                    className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border-none text-xs text-slate-500 font-medium shadow-sm h-32 resize-none"
                                    value={section.content.subheadline}
                                    onChange={(e) => updateSectionContent(section.id, 'subheadline', e.target.value)}
                                  />
                                </div>
                                 <div className="space-y-3">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Banner Image Link</label>
                                   <input 
                                     type="text"
                                     className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600/10 text-[10px] font-medium text-slate-400"
                                     value={section.content.image}
                                     onChange={(e) => updateSectionContent(section.id, 'image', e.target.value)}
                                     placeholder="Paste image URL here..."
                                   />
                                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                      {[
                                        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
                                        'https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=400',
                                        'https://images.unsplash.com/photo-1538108197017-c1a966bd3203?auto=format&fit=crop&q=80&w=400',
                                        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400',
                                        'https://images.unsplash.com/photo-1502740479796-6199bf37f315?auto=format&fit=crop&q=80&w=400'
                                      ].map((img, i) => (
                                        <button 
                                          key={i} 
                                          onClick={() => updateSectionContent(section.id, 'image', img)}
                                          className={`w-12 h-12 rounded-xl border-2 shrink-0 transition-all overflow-hidden ${section.content.image === img ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                          <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                      ))}
                                   </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5 flex-1">
                                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Button text</label>
                                       <input 
                                         type="text"
                                         className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600/10 text-xs font-bold"
                                         value={section.content.ctaText}
                                         onChange={(e) => updateSectionContent(section.id, 'ctaText', e.target.value)}
                                       />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Button Link</label>
                                       <input 
                                         type="text"
                                         className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600/10 text-xs font-bold text-indigo-500"
                                         value={section.content.ctaLink || '#contact'}
                                         onChange={(e) => updateSectionContent(section.id, 'ctaLink', e.target.value)}
                                       />
                                    </div>
                                 </div>
                                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-4">
                                     <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Background Image</label>
                                        <button 
                                          onClick={() => updateSectionContent(section.id, 'backgroundType', section.content.backgroundType === 'image' ? 'gradient' : 'image')}
                                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${section.content.backgroundType === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                                        >
                                          {section.content.backgroundType === 'image' ? 'Active' : 'Enable'}
                                        </button>
                                     </div>
                                     {section.content.backgroundType === 'image' && (
                                        <input 
                                           type="text"
                                           className="w-full bg-white dark:bg-slate-800 p-2 rounded-xl border-none text-[9px] font-medium"
                                           placeholder="Background Image URL..."
                                           value={section.content.backgroundImage || ''}
                                           onChange={(e) => updateSectionContent(section.id, 'backgroundImage', e.target.value)}
                                        />
                                     )}
                                     
                                     <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                           <LucideIcons.Type className="w-3.5 h-3.5 text-slate-400" />
                                           <label className="text-[9px] font-black text-slate-400 uppercase">Dark Text Mode</label>
                                        </div>
                                        <button 
                                          onClick={() => updateSectionContent(section.id, 'darkText', !section.content.darkText)}
                                          className={`w-10 h-5 rounded-full relative transition-all ${section.content.darkText ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                           <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${section.content.darkText ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                     </div>
                                 </div>
                             </>
                           )}

                            {/* Courses Editor */}
                            {section.type === 'courses' && (
                              <div className="space-y-5">
                                 <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Section Header</label>
                                   <input 
                                     className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                     value={section.content.title}
                                     onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-3">
                                   {section.content.items?.map((item, idy) => (
                                     <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 group/item">
                                        <div className="flex items-center justify-between">
                                           <input 
                                             className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 dark:text-white focus:ring-0"
                                             value={item.name}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].name = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           <input 
                                             className="w-20 bg-indigo-50 dark:bg-slate-800 px-2 py-1 rounded-lg text-[9px] font-black text-indigo-600 focus:ring-0 text-right"
                                             placeholder="Duration"
                                             value={item.duration}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].duration = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           <button onClick={() => {
                                             const newItems = section.content.items.filter((_, i) => i !== idy);
                                             updateSectionContent(section.id, 'items', newItems);
                                           }} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <textarea 
                                           className="w-full bg-transparent border-none p-0 text-[11px] text-slate-500 font-medium focus:ring-0 resize-none h-14"
                                           value={item.description}
                                           onChange={(e) => {
                                             const newItems = [...section.content.items];
                                             newItems[idy].description = e.target.value;
                                             updateSectionContent(section.id, 'items', newItems);
                                           }}
                                         />
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => {
                                       const newItems = [...(section.content.items || []), { name: 'New Program', duration: '1 Year', description: 'Program description...', icon: 'BookOpen' }];
                                       updateSectionContent(section.id, 'items', newItems);
                                     }}
                                     className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-200 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                                   >
                                     <Plus className="w-4 h-4" /> Add Program Card
                                   </button>
                                 </div>
                              </div>
                            )}

                            {/* Features Editor */}
                            {section.type === 'features' && (
                              <div className="space-y-5">
                                 <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Section Title</label>
                                   <input 
                                     className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                     value={section.content.title}
                                     onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-3">
                                   {section.content.items?.map((feature, idy) => (
                                     <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                              <DynamicIcon name={feature.icon} className="w-4 h-4 text-slate-400" />
                                           </div>
                                           <input 
                                             className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 focus:ring-0"
                                             value={feature.title}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].title = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                        </div>
                                        <textarea 
                                           className="w-full bg-transparent border-none p-0 text-[10px] text-slate-500 font-medium focus:ring-0 resize-none h-12"
                                           value={feature.description}
                                           onChange={(e) => {
                                             const newItems = [...section.content.items];
                                             newItems[idy].description = e.target.value;
                                             updateSectionContent(section.id, 'items', newItems);
                                           }}
                                         />
                                     </div>
                                   ))}
                                 </div>
                              </div>
                            )}

                            {/* Faculty Editor (Generic Team) */}
                            {(section.type === 'faculty' || section.type === 'doctors') && (
                              <div className="space-y-4">
                                 <div className="space-y-1.5 mb-4">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Section Headline</label>
                                   <input 
                                     className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                     value={section.content.title}
                                     onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-3">
                                   {section.content.items?.map((item, idy) => (
                                     <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 gap-4 flex items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                           <img src={item.photo} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                           <div className="flex items-center justify-between">
                                              <input 
                                                className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 dark:text-white focus:ring-0"
                                                value={item.name}
                                                onChange={(e) => {
                                                  const newItems = [...section.content.items];
                                                  newItems[idy].name = e.target.value;
                                                  updateSectionContent(section.id, 'items', newItems);
                                                }}
                                              />
                                              <button onClick={() => {
                                                const newItems = section.content.items.filter((_, i) => i !== idy);
                                                updateSectionContent(section.id, 'items', newItems);
                                              }} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                           </div>
                                           <input 
                                             className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-indigo-500 uppercase tracking-wider focus:ring-0"
                                             value={item.designation}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].designation = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           {section.type === 'faculty' && (
                                              <input 
                                                className="w-full bg-transparent border-none p-0 text-[9px] font-black text-slate-400 uppercase focus:ring-0"
                                                placeholder="Subject Expertise..."
                                                value={item.subject || ''}
                                                onChange={(e) => {
                                                  const newItems = [...section.content.items];
                                                  newItems[idy].subject = e.target.value;
                                                  updateSectionContent(section.id, 'items', newItems);
                                                }}
                                              />
                                           )}
                                           <input 
                                             className="w-full bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-[8px] text-slate-400 focus:ring-0 mt-2"
                                             placeholder="Photo URL..."
                                             value={item.photo}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].photo = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                        </div>
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => {
                                       const newItems = [...(section.content.items || []), { name: 'Member Name', designation: 'Role', subject: 'Specialty', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' }];
                                       updateSectionContent(section.id, 'items', newItems);
                                     }}
                                     className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2 hover:border-indigo-200 hover:text-indigo-500 transition-all"
                                   >
                                      <Plus className="w-4 h-4" /> Add Team Member
                                   </button>
                                 </div>
                              </div>
                            )}

                            {/* Testimonials Editor */}
                            {section.type === 'testimonials' && (
                              <div className="space-y-5">
                                <div className="space-y-3">
                                  {section.content.items?.map((item, idy) => (
                                    <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 space-y-3">
                                      <div className="flex items-center gap-3">
                                         <img src={item.photo} className="w-10 h-10 rounded-full object-cover" />
                                         <input 
                                           className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 focus:ring-0"
                                           value={item.name}
                                           onChange={(e) => {
                                             const newItems = [...section.content.items];
                                             newItems[idy].name = e.target.value;
                                             updateSectionContent(section.id, 'items', newItems);
                                           }}
                                         />
                                         <button onClick={() => {
                                           const newItems = section.content.items.filter((_, i) => i !== idy);
                                           updateSectionContent(section.id, 'items', newItems);
                                         }}><Trash2 className="w-3.5 h-3.5 text-slate-300" /></button>
                                      </div>
                                      <textarea 
                                         className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-none text-[10px] text-slate-500 font-medium focus:ring-0 resize-none h-20"
                                         value={item.text}
                                         onChange={(e) => {
                                           const newItems = [...section.content.items];
                                           newItems[idy].text = e.target.value;
                                           updateSectionContent(section.id, 'items', newItems);
                                         }}
                                       />
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => {
                                      const newItems = [...(section.content.items || []), { name: 'Student Name', text: 'Success story text...', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' }];
                                      updateSectionContent(section.id, 'items', newItems);
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2 hover:border-indigo-200 hover:text-indigo-500 transition-all"
                                  >
                                     <PlusCircle className="w-4 h-4" /> Add Testimonial
                                  </button>
                                </div>
                              </div>
                            )}

                             {/* Real Estate Projects Editor */}
                             {section.type === 'projects' && (
                               <div className="space-y-5">
                                 <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Projects Title</label>
                                   <input 
                                     className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                     value={section.content.title}
                                     onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-3">
                                   {(section.content.items || []).map((item, idy) => (
                                     <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-center gap-3">
                                           <img src={item.photo} className="w-10 h-10 rounded-xl object-cover" />
                                           <input 
                                             className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 focus:ring-0"
                                             value={item.name}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].name = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           <button onClick={() => {
                                             const newItems = section.content.items.filter((_, i) => i !== idy);
                                             updateSectionContent(section.id, 'items', newItems);
                                           }}><Trash2 className="w-3.5 h-3.5 text-slate-300" /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                           <input 
                                             className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-[9px] font-bold text-slate-500"
                                             placeholder="Location"
                                             value={item.location}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].location = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           <input 
                                             className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-[9px] font-bold text-indigo-600"
                                             placeholder="Price"
                                             value={item.price}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].price = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                        </div>
                                     </div>
                                   ))}
                                   <button onClick={() => addProjectItem(section.id)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                      <Plus className="w-4 h-4" /> Add Project Card
                                   </button>
                                 </div>
                               </div>
                             )}

                             {/* Real Estate Gallery Editor */}
                             {section.type === 'gallery' && (
                               <div className="space-y-5">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Gallery Visuals</label>
                                  <div className="grid grid-cols-2 gap-3">
                                     {(section.content.items || []).map((img, idy) => (
                                       <div key={idy} className="relative aspect-square rounded-2xl overflow-hidden group">
                                          <img src={img} className="w-full h-full object-cover" />
                                          <button 
                                            onClick={() => {
                                              const newItems = section.content.items.filter((_, i) => i !== idy);
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                            className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                          >
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                       </div>
                                     ))}
                                     <button onClick={() => addGalleryItem(section.id)} className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-indigo-500 transition-all">
                                        <Plus className="w-5 h-5" />
                                        <span className="text-[9px] font-black uppercase">Add Media</span>
                                     </button>
                                  </div>
                               </div>
                             )}

                             {/* Real Estate Map Editor */}
                             {section.type === 'map' && (
                               <div className="space-y-6">
                                  <div className="space-y-4">
                                     <div className="space-y-1.5">
                                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Site Address</label>
                                       <textarea 
                                         className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold h-24 resize-none"
                                         value={section.content.address}
                                         onChange={(e) => updateSectionContent(section.id, 'address', e.target.value)}
                                       />
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nearby connectivity points</label>
                                     {(section.content.nearby || []).map((place, idy) => (
                                       <div key={idy} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                          <input 
                                            className="flex-1 bg-transparent border-none p-0 text-[10px] font-bold text-slate-900"
                                            value={place.name}
                                            onChange={(e) => {
                                              const newNearby = [...section.content.nearby];
                                              newNearby[idy].name = e.target.value;
                                              updateSectionContent(section.id, 'nearby', newNearby);
                                            }}
                                          />
                                          <button onClick={() => {
                                            const newNearby = section.content.nearby.filter((_, i) => i !== idy);
                                            updateSectionContent(section.id, 'nearby', newNearby);
                                          }}><Trash2 className="w-3.5 h-3.5 text-slate-300" /></button>
                                       </div>
                                     ))}
                                     <button onClick={() => addNearbyItem(section.id)} className="w-full py-3 border border-dashed border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-400 flex items-center justify-center gap-2">
                                        <Plus className="w-3.5 h-3.5" /> Add Point
                                     </button>
                                  </div>
                               </div>
                             )}

                             {/* Agenda Editor */}
                             {section.type === 'agenda' && (
                               <div className="space-y-6">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Agenda Title</label>
                                    <input 
                                      className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                      value={section.content.title}
                                      onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-4">
                                     {(section.content.items || []).map((item, idy) => (
                                       <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 space-y-3">
                                          <div className="flex items-center justify-between">
                                             <input 
                                               className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 focus:ring-0"
                                               value={item.title}
                                               onChange={(e) => {
                                                 const newItems = [...section.content.items];
                                                 newItems[idy].title = e.target.value;
                                                 updateSectionContent(section.id, 'items', newItems);
                                               }}
                                             />
                                             <button onClick={() => {
                                               const newItems = section.content.items.filter((_, i) => i !== idy);
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}><Trash2 className="w-3.5 h-3.5 text-slate-300" /></button>
                                          </div>
                                          <input 
                                            className="w-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-black text-indigo-600 uppercase"
                                            value={item.time}
                                            onChange={(e) => {
                                              const newItems = [...section.content.items];
                                              newItems[idy].time = e.target.value;
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                          />
                                          <textarea 
                                            className="w-full bg-transparent border-none p-0 text-[10px] text-slate-500 font-medium h-16 resize-none focus:ring-0"
                                            value={item.description}
                                            onChange={(e) => {
                                              const newItems = [...section.content.items];
                                              newItems[idy].description = e.target.value;
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                          />
                                       </div>
                                     ))}
                                     <button onClick={() => addAgendaItem(section.id)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Add Session
                                     </button>
                                  </div>
                               </div>
                             )}

                             {/* Results/Stats Editor */}
                             {section.type === 'results' && (
                               <div className="space-y-4">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Performance Stats</label>
                                  <div className="grid grid-cols-2 gap-3">
                                     {(section.content.items || []).map((stat, idy) => (
                                       <div key={idy} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative group">
                                          <button 
                                            onClick={() => {
                                              const newItems = section.content.items.filter((_, i) => i !== idy);
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                          <input 
                                            className="w-full bg-transparent border-none p-0 text-xl font-black text-indigo-400 focus:ring-0 text-center"
                                            value={stat.value}
                                            onChange={(e) => {
                                              const newItems = [...section.content.items];
                                              newItems[idy].value = e.target.value;
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                          />
                                          <input 
                                            className="w-full bg-transparent border-none p-0 text-[10px] font-black text-slate-400 focus:ring-0 text-center uppercase tracking-widest mt-1"
                                            value={stat.label}
                                            onChange={(e) => {
                                              const newItems = [...section.content.items];
                                              newItems[idy].label = e.target.value;
                                              updateSectionContent(section.id, 'items', newItems);
                                            }}
                                          />
                                       </div>
                                     ))}
                                     <button onClick={() => addResultItem(section.id)} className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-indigo-500 transition-all">
                                        <Plus className="w-5 h-5" />
                                        <span className="text-[9px] font-black uppercase">Add Stat</span>
                                     </button>
                                  </div>
                               </div>
                             )}

                            {/* Services Editor */}
                            {section.type === 'services' && (
                              <div className="space-y-5">
                                 <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Section Header</label>
                                   <input 
                                     className="w-full bg-slate-900 text-white p-4 rounded-2xl border-none text-xs font-bold"
                                     value={section.content.title}
                                     onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-3">
                                   {section.content.items?.map((item, idy) => (
                                     <div key={idy} className="p-4 bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 group/item">
                                        <div className="flex items-center justify-between">
                                           <input 
                                             className="flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-900 dark:text-white focus:ring-0"
                                             value={item.name}
                                             onChange={(e) => {
                                               const newItems = [...section.content.items];
                                               newItems[idy].name = e.target.value;
                                               updateSectionContent(section.id, 'items', newItems);
                                             }}
                                           />
                                           <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <textarea 
                                           className="w-full bg-transparent border-none p-0 text-[11px] text-slate-500 font-medium focus:ring-0 resize-none h-14"
                                           value={item.description}
                                           onChange={(e) => {
                                             const newItems = [...section.content.items];
                                             newItems[idy].description = e.target.value;
                                             updateSectionContent(section.id, 'items', newItems);
                                           }}
                                         />
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => addServiceItem(section.id)}
                                     className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-200 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                                   >
                                     <Plus className="w-4 h-4" /> Add Experience Card
                                   </button>
                                 </div>
                              </div>
                            )}

                            {/* Form Picker Editor */}
                            {section.type === 'form' && (
                              <div className="space-y-4">
                                 <div className="p-5 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-200 dark:shadow-none space-y-4">
                                     <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                                        <h4 className="text-sm font-black uppercase tracking-widest">Lead capture</h4>
                                     </div>
                                     <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-wider">Connect a lead magnet form from your platform to this funnel section.</p>
                                     
                                     <select 
                                       className="w-full bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl border border-white/20 text-xs font-bold appearance-none cursor-pointer focus:ring-0"
                                       value={section.content.formToken}
                                       onChange={(e) => updateSectionContent(section.id, 'formToken', e.target.value)}
                                     >
                                       <option value="" className="text-slate-900">Select Funnel Form...</option>
                                       {forms.map(f => <option key={f._id} value={f.token} className="text-slate-900">{f.name}</option>)}
                                     </select>
                                 </div>
                                 
                                 <button onClick={() => router.push('/automation/forms')} className="w-full py-3 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-50 rounded-xl transition-all">
                                    <PlusCircle className="w-4 h-4" /> Create new lead form 
                                 </button>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mt-10">
                    <Plus className="w-5 h-5" /> Add Funnel Layer
                  </button>
               </div>
             )}

             {activeTab === 'config' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Visuals</h3>
                    <div className="flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/10">
                       <input 
                         type="color" 
                         className="w-14 h-14 rounded-2xl cursor-pointer border-none bg-transparent"
                         value={website.primaryColor}
                         onChange={(e) => setWebsite({...website, primaryColor: e.target.value})}
                       />
                       <div>
                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Main Glow Color</p>
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">{website.primaryColor}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation Center</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow animate-pulse"></div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 shadow-sm space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CTA text</label>
                              <input 
                                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                 value={website.settings.navbar.ctaText}
                                 onChange={(e) => updateNavbar('ctaText', e.target.value)}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CTA Link</label>
                              <input 
                                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 transition-all text-indigo-600"
                                 value={website.settings.navbar.ctaLink}
                                 onChange={(e) => updateNavbar('ctaLink', e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-2">Menu items</p>
                           {website.settings.navbar.items.map((item, idx) => (
                             <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group relative">
                                <button 
                                  onClick={() => {
                                    const newItems = website.settings.navbar.items.filter((_, i) => i !== idx);
                                    updateNavbar('items', newItems);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <input 
                                  className="w-full bg-transparent border-none p-0 text-xs font-black text-slate-800 dark:text-white focus:ring-0 uppercase tracking-tighter"
                                  placeholder="Link Label"
                                  value={item.text}
                                  onChange={(e) => {
                                    const newItems = [...website.settings.navbar.items];
                                    newItems[idx].text = e.target.value;
                                    updateNavbar('items', newItems);
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                   <input 
                                     className="flex-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-bold text-indigo-500 border border-transparent focus:border-indigo-100 transition-all"
                                     placeholder="Target Link (e.g. #services)"
                                     value={item.link}
                                     onChange={(e) => {
                                       const newItems = [...website.settings.navbar.items];
                                       newItems[idx].link = e.target.value;
                                       updateNavbar('items', newItems);
                                     }}
                                   />
                                </div>
                             </div>
                           ))}
                           <button 
                             onClick={() => {
                               const newItems = [...website.settings.navbar.items, { text: 'New Link', link: '#' }];
                               updateNavbar('items', newItems);
                             }}
                             className="w-full py-3 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-400 transition-all"
                           >
                             + Add Link
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'hosting' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Infrastructure</h3>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Funnel Subdomain</label>
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                             <span className="text-[10px] font-bold text-slate-400">/s/</span>
                             <input 
                                className="flex-1 bg-transparent border-none p-0 text-xs font-bold text-slate-900 dark:text-white focus:ring-0"
                                value={website.slug}
                                onChange={(e) => setWebsite({...website, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                             />
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 mt-2 px-1 leading-relaxed">This is your internal access point. Changing this will update the public URL of your funnel.</p>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Custom Domain (Web 3.0)</label>
                          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-none opacity-50 relative group">
                             <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />
                             <input 
                                disabled
                                className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-400 focus:ring-0"
                                placeholder="e.g. www.yourbusiness.com"
                                value={website.customDomain || ''}
                             />
                             <p className="text-[8px] font-black text-indigo-500 uppercase mt-2">Premium Feature Locked</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Live Preview (Right Side) */}
        <div className="flex-1 bg-slate-100 dark:bg-[#020617] p-10 flex flex-col relative overflow-hidden transition-all duration-700">
           {/* Background Grid Accent */}
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${website.primaryColor} 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
           
           <div className="w-full max-w-6xl mx-auto flex-1 bg-white dark:bg-white rounded-[40px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 relative group animate-in zoom-in-98 duration-1000">
              {/* Browser Control Bar */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-8 gap-10 z-50">
                 <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 bg-red-200 rounded-full"></div>
                    <div className="w-3.5 h-3.5 bg-amber-200 rounded-full"></div>
                    <div className="w-3.5 h-3.5 bg-emerald-200 rounded-full"></div>
                 </div>
                 
                 <div className="flex-1 flex justify-center">
                    <div className="bg-white/80 border border-slate-100 px-10 py-2 rounded-[14px] text-[10px] font-black text-slate-300 flex items-center gap-4 min-w-[400px] shadow-sm">
                      <Lock className="w-4 h-4 text-indigo-400/20" /> 
                      <span className="flex-1 text-center truncate">{website.slug}.growfunnel.co/live-preview</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-px h-6 bg-slate-200"></div>
                    <Menu className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
                 </div>
              </div>

              {/* Dynamic Preview Container */}
              <div className="absolute inset-0 pt-16 overflow-y-auto no-scrollbar scroll-smooth">
                 {/* This renders the ACTUAL public-facing component */}
                 <div className="transform scale-[0.85] md:scale-[0.95] origin-top h-full w-full">
                    <PublicWebsite website={{...website, status: 'published'}} />
                 </div>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white px-10 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-50 border border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                 <div className="relative">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full block"></span>
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute top-0 left-0 animate-ping"></span>
                 </div>
                 Infrastructure Live • Active Funnel Engaged
              </div>
           </div>

           {/* Quick Action Side Buttons */}
           <div className="absolute top-10 right-10 flex flex-col gap-3">
              <button className="w-12 h-12 bg-white dark:bg-slate-800 shadow-xl rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all"><MousePointer2 className="w-5 h-5" /></button>
              <button className="w-12 h-12 bg-indigo-600 shadow-xl rounded-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"><Layout className="w-5 h-5" /></button>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-glow { box-shadow: 0 0 15px currentColor; }
      `}</style>

      {/* Congratulations Popup */}
      {showPublishSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0B1120] rounded-[40px] shadow-3xl max-w-md w-full p-10 text-center relative overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 dark:shadow-none animate-bounce-slow">
                 <PartyPopper className="w-10 h-10 text-indigo-600 animate-in zoom-in spin-in-12 duration-1000" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-none uppercase">You're Live!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-8 leading-relaxed px-4">
                 Your High-Converting Funnel is now active and ready to capture leads.
              </p>

              <div className="space-y-4">
                 <a 
                    href={`/s/${website.slug}`} 
                    target="_blank"
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <Globe className="w-5 h-5" /> Visit Live Site
                 </a>
                 <button 
                  onClick={() => router.push('/website-funnel')}
                  className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[24px] font-black text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <LayoutDashboard className="w-5 h-5" /> View All Funnels
                 </button>
                 <button 
                  onClick={() => setShowPublishSuccess(false)}
                  className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-600 pt-4"
                 >
                    Continue Editing
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-glow { box-shadow: 0 0 15px currentColor; }
      `}</style>
    </div>
  );
}
