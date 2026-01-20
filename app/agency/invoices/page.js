'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Check, Clock, AlertCircle, Ban, Loader2, Settings } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    currency: 'INR',
    billingPeriod: { startDate: '', endDate: '' },
    notes: '',
    dueDate: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const [invRes, cliRes] = await Promise.all([
        fetch('/api/agency/invoices', { headers: { 'x-user-id': userId } }),
        fetch('/api/agency/clients', { headers: { 'x-user-id': userId } })
      ]);
      const invData = await invRes.json();
      const cliData = await cliRes.json();
      
      if (invData.success) setInvoices(invData.invoices);
      if (cliData.success) setClients(cliData.clients.filter(c => c.status === 'active'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch('/api/agency/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setInvoices([data.invoice, ...invoices]);
        setShowModal(false);
        setFormData({ clientId: '', amount: '', currency: 'INR', billingPeriod: { startDate: '', endDate: '' }, notes: '', dueDate: '' });
      } else {
        setError(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/agency/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(invoices.map(inv => inv._id === invoiceId ? data.invoice : inv));
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientId?.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesClient = filterClient === 'all' || invoice.clientId?._id === filterClient;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const stats = {
    total: filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    paid: filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0),
    pending: filteredInvoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, inv) => sum + (inv.amount || 0), 0)
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Invoices</h1>
          <p className="text-[13px] text-slate-500 mt-1">Financial ledger for {invoices.length} transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-[13px] font-bold active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-[100px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Invoiced</p>
            <h3 className="text-[20px] font-bold text-slate-900">₹{stats.total.toLocaleString()}</h3>
         </div>
         <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-[100px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-emerald-600">Total Collected</p>
            <h3 className="text-[20px] font-bold text-emerald-600">₹{stats.paid.toLocaleString()}</h3>
         </div>
         <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between h-[100px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-amber-600">Outstanding</p>
            <h3 className="text-[20px] font-bold text-amber-600">₹{stats.pending.toLocaleString()}</h3>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 outline-none">
              <option value="all">Any Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
           </select>
           <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 outline-none">
              <option value="all">All Clients</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
           </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descriptor</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Released</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13px]">
            {filteredInvoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4">
                   <p className="font-bold text-slate-900">{inv.clientId?.clientName || 'Deleted Client'}</p>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-900">₹{inv.amount?.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                      inv.status === 'overdue' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-500'
                   }`}>
                      {inv.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-[12px]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status === 'draft' && <button onClick={() => handleStatusChange(inv._id, 'sent')} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-all"><FileText className="w-4 h-4" /></button>}
                      {inv.status === 'sent' && <button onClick={() => handleStatusChange(inv._id, 'paid')} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition-all"><Check className="w-4 h-4" /></button>}
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md transition-all"><Settings className="w-4 h-4" /></button>
                   </div>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic font-medium tracking-tight">No financial records matching criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-[18px] font-semibold text-slate-900">New Financial Document</h2>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>

              {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[12px] font-medium">{error}</div>}

              <form onSubmit={handleCreate} className="space-y-6">
                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recipient Client *</label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none"
                    >
                      <option value="">Select recipient...</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount *</label>
                       <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px]" />
                    </div>
                    <div>
                       <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Currency</label>
                       <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px]">
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Period Start</label>
                       <input type="date" required value={formData.billingPeriod.startDate} onChange={(e) => setFormData({...formData, billingPeriod: {...formData.billingPeriod, startDate: e.target.value}})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px]" />
                    </div>
                    <div>
                       <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Period End</label>
                       <input type="date" required value={formData.billingPeriod.endDate} onChange={(e) => setFormData({...formData, billingPeriod: {...formData.billingPeriod, endDate: e.target.value}})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px]" />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-lg text-[13px] font-bold border border-slate-200">Cancel</button>
                    <button type="submit" disabled={creating} className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-[13px] font-bold active:scale-95 disabled:opacity-50">{creating ? 'Processing...' : 'Issue Document'}</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

