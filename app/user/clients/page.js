"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Clock, AlertCircle, 
  Search, Filter, Plus, ChevronRight,
  MoreVertical, Briefcase, DollarSign, Activity,
  Loader2, ExternalLink
} from "lucide-react";
import UserNavbar from "../Header";
import Link from "next/link";
import toast from "react-hot-toast";
import { authFetch } from "@/lib/apiClient";

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    activeClients: 0,
    monthlyRevenue: 0,
    inProgressServices: 0,
    tasksDueToday: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    primaryContact: { name: "", email: "", phone: "" },
    clientType: "Retainer",
    contractValue: { amount: 0, currency: "USD" },
    billingCycle: "Monthly"
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Client onboarded successfully!");
        setIsModalOpen(false);
        fetchClients();
        const clientData = await res.json();
        authFetch("/api/clients/automation/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ triggerType: "CLIENT_ONBOARDED", clientId: clientData.data._id })
        });
      }
    } catch (error) {
      toast.error("Error onboarding client");
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await authFetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const { data, meta } = await res.json();
      setClients(data);
      
      // Dynamic stat calculation using live API meta
      setStats({
        activeClients: data.filter(c => c.status === 'Active').length,
        monthlyRevenue: data.reduce((acc, c) => acc + (c.contractValue?.amount || 0), 0),
        inProgressServices: meta?.serviceCount || 0,
        tasksDueToday: meta?.taskCount || 0
      });
    } catch (error) {
      console.error(error);
      toast.error("Error loading clients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFFD] dark:bg-[#050505] transition-colors pb-20 font-sans">
      <UserNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 space-y-10">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Client Management</h1>
            <p className="text-slate-500 font-medium">Empower your agency with post-sales service excellence.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95"
          >
            <Plus className="w-5 h-5" /> Onboard New Client
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
               <div className="p-10 space-y-8">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Onboard Partner</h3>
                     <p className="text-slate-500 font-medium">Initialize the post-sales service delivery for a new client.</p>
                  </div>
                  
                  <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-6">
                     <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Name</label>
                        <input 
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                          placeholder="e.g. Acme Corp Operations"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Name</label>
                        <input 
                          required
                          value={formData.primaryContact.name}
                          onChange={(e) => setFormData({...formData, primaryContact: {...formData.primaryContact, name: e.target.value}})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Email</label>
                        <input 
                          required
                          type="email"
                          value={formData.primaryContact.email}
                          onChange={(e) => setFormData({...formData, primaryContact: {...formData.primaryContact, email: e.target.value}})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contract Amount ($)</label>
                        <input 
                          type="number"
                          value={formData.contractValue.amount}
                          onChange={(e) => setFormData({...formData, contractValue: {...formData.contractValue, amount: Number(e.target.value)}})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Billing Cycle</label>
                        <select 
                           value={formData.billingCycle}
                           onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                           className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                        >
                           <option>Monthly</option>
                           <option>Quarterly</option>
                           <option>One-time</option>
                        </select>
                     </div>
                     <div className="col-span-2 pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition">Complete Onboarding</button>
                     </div>
                  </form>
               </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Active Clients" 
            value={stats.activeClients} 
            icon={Users} 
            color="text-indigo-600" 
            bg="bg-indigo-50 dark:bg-indigo-900/10" 
          />
          <StatCard 
            label="MRR Visibility" 
            value={`$${stats.monthlyRevenue.toLocaleString()}`} 
            icon={DollarSign} 
            color="text-emerald-600" 
            bg="bg-emerald-50 dark:bg-emerald-900/10" 
          />
          <StatCard 
            label="Services In-Flight" 
            value={stats.inProgressServices} 
            icon={Briefcase} 
            color="text-amber-600" 
            bg="bg-amber-50 dark:bg-amber-900/10" 
          />
          <StatCard 
            label="Tasks Due Today" 
            value={stats.tasksDueToday} 
            icon={Activity} 
            color="text-rose-600" 
            bg="bg-rose-50 dark:bg-rose-900/10" 
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              placeholder="Search by company, contact or email..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
          <button className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50 transition">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        {/* Client List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Manager</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Value</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                      <p className="mt-4 text-slate-400 font-medium">Synchronizing client data...</p>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No active clients currently mapped to your agency.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 dark:border-indigo-800/50">
                            {client.companyName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{client.companyName}</p>
                            <p className="text-xs text-slate-400">{client.industry || "Strategic Partner"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600 dark:text-slate-400">{client.clientType}</td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {client.accountManager ? `${client.accountManager.firstName} ${client.accountManager.lastName}` : "Unassigned"}
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900 dark:text-white">${client.contractValue?.amount?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{client.billingCycle}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/user/clients/${client._id}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors block">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function getStatusStyles(status) {
  switch(status) {
    case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800';
    case 'On Hold': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800';
    case 'Churned': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800';
    default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800';
  }
}
