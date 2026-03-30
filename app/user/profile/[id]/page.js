"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  User, Mail, Phone, Shield, CreditCard, 
  CheckCircle, Edit3, Save, X, ArrowLeft,
  Loader2, Camera, LogOut, ChevronRight,
  Plus, Layout, Sparkles, Globe, Briefcase,
  TrendingUp, Activity, BarChart3, Settings
} from "lucide-react";
import UserNavbar from "../../Header";
import { useTheme } from "../../../components/ThemeContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    industry: "",
    businessWebsite: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/profile/${id}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUserData(data);
      setEditData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        businessName: data.business?.name || "",
        industry: data.business?.industry || "",
        businessWebsite: data.business?.website || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/user/profile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Update failed");
      
      await fetchProfile(); // Refresh data
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const leadsQuota = userData?.business?.quotas?.maxLeadsPerMonth || 100;
  const leadsUsed = userData?.business?.usage?.leadsThisMonth || 0;
  const leadProgress = Math.min((leadsUsed / leadsQuota) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#050505] transition-colors duration-500 pb-20 font-sans">
      <UserNavbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-4xl font-serif font-bold text-slate-300 dark:text-slate-600 select-none">
                  {userData.name.charAt(0)}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-900 text-slate-400 rounded-lg shadow-sm hover:text-indigo-600 transition border border-slate-100 dark:border-slate-800">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                  {userData.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  {userData.business?.plan || "Free"} Member
                </span>
              </div>
              <p className="text-slate-500 font-medium text-lg opacity-70">
                {userData.business?.name || "Settings Dashboard"}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${isEditing ? 'bg-indigo-50 text-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
              >
                {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Settings className="w-4 h-4" /> Settings</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Identity Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
               <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Profile Identity</h2>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md">
                 <CheckCircle className="w-3 h-3" /> Verified Account
               </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Information</p>
                    <div className="space-y-4">
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">First Name</label>
                        <input 
                          value={editData.firstName}
                          onChange={e => setEditData({...editData, firstName: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">Last Name</label>
                        <input 
                          value={editData.lastName}
                          onChange={e => setEditData({...editData, lastName: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">Phone Number</label>
                        <input 
                          value={editData.phone}
                          onChange={e => setEditData({...editData, phone: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Details</p>
                    <div className="space-y-4">
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">Business Name</label>
                        <input 
                          value={editData.businessName}
                          onChange={e => setEditData({...editData, businessName: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">Industry</label>
                        <input 
                          value={editData.industry}
                          onChange={e => setEditData({...editData, industry: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                       <div className="group">
                        <label className="text-xs text-slate-400 mb-1 block ml-1">Website URL</label>
                        <input 
                          value={editData.businessWebsite}
                          onChange={e => setEditData({...editData, businessWebsite: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white text-sm"
                        />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile Details</>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Full Name</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{userData.name}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email Connection</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{userData.email}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Managed ID</p>
                    <p className="text-sm font-mono text-slate-400">{userData._id}</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Organization</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{userData.business?.name || "Independent Account"}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Business Domain</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{userData.business?.website || "Domain pending"}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phone Contact</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{userData.phone || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Security Overview */}
          <section className="space-y-6 pt-12 border-t border-slate-50 dark:border-slate-900">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Security & Privacy</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <Shield className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Two-Factor Auth</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-bold uppercase">Disabled</span>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">API Access Key</span>
                   </div>
                   <span className="text-indigo-600 font-bold text-xs">Reveal</span>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Subtle Stats Sidebar */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Activity Snapshot</h4>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-500">Leads Captured</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{userData.stats?.totalLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-500">Active Websites</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{userData.stats?.websiteCount || 0}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800">
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Plan Usage</span>
                        <span>{leadsUsed}/{leadsQuota}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${leadProgress}%` }}></div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                className="w-full py-4 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Sign Out Securely
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
