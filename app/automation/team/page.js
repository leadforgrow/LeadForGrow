'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, TrendingUp, CheckCircle2, UserCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/ui/Heading';

export default function TeamPage() {
  const [assignmentStrategy, setAssignmentStrategy] = useState('solo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', firstName: '', lastName: '', phone: '', password: '' });
  const [createdMemberInfo, setCreatedMemberInfo] = useState(null);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') || 'free';
    setUserPlan(plan);
  }, []);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userid');

      // Fetch settings
      const settingsRes = await fetch(`/api/business/settings?userId=${userId}`);
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setAssignmentStrategy(settingsData.data.settings?.assignmentStrategy || 'solo');
      }

      // Fetch team
      const teamRes = await fetch(`/api/automation/team?userId=${userId}`);
      const teamData = await teamRes.json();
      if (teamData.success) {
        setTeam(teamData.data);
      }

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleSaveOwnership = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { assignmentStrategy } })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment strategy updated!');
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
      setSaving(false);
    } catch (error) {
      setSaving(false);
      toast.error('Failed to save settings');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${userId}&memberId=${memberId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setTeam(team.filter(m => m._id !== memberId));
        toast.success('Member removed');
      } else {
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      toast.error('Error removing member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (userPlan === 'trial' && team.length >= 2) {
      toast.error('Maximum 2 team members allowed in free trial');
      return;
    }
    try {
      setSaving(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (data.success) {
        setTeam([...team, data.data]);
        const passwordToShow = data.data.temporaryPassword || newMember.password;
        setCreatedMemberInfo({ ...data.data, password: passwordToShow });
        setNewMember({ email: '', firstName: '', lastName: '', phone: '', password: '' });
        toast.success('Team member added successfully!');
      } else {
        toast.error(data.error || 'Failed to add member');
      }
      setSaving(false);
    } catch (error) {
      setSaving(false);
      toast.error('Error adding member');
    }
  };

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Team & Ownership</h1>
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Manage workspace members and lead assignment policies</p>
          </div>
        </div>
      </div>

      {/* Ownership Strategy Selection */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 mb-8">
        <Heading level={3} className="text-xl mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          Lead Assignment Strategy
        </Heading>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setAssignmentStrategy('solo')}
            className={`p-8 rounded-[32px] border-2 text-left transition-all ${assignmentStrategy === 'solo'
              ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
              : 'border-slate-100 bg-slate-50'
              }`}
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <UserCircle className={`w-7 h-7 ${assignmentStrategy === 'solo' ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <Heading level={3} className="text-xl mb-2">Only Me (Solo)</Heading>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every new lead will be assigned directly to you. Perfect if you handle sales personally.
            </p>
            {assignmentStrategy === 'solo' && (
              <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" /> Selected
              </div>
            )}
          </button>

          <button
            onClick={() => setAssignmentStrategy('round-robin')}
            className={`p-8 rounded-[32px] border-2 text-left transition-all ${assignmentStrategy === 'round-robin'
              ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
              : 'border-slate-100 bg-slate-50'
              }`}
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <RefreshCcw className={`w-7 h-7 ${assignmentStrategy === 'round-robin' ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <Heading level={3} className="text-xl mb-2">Round Robin (Team)</Heading>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically distribute leads equally among all active team members.
            </p>
            {assignmentStrategy === 'round-robin' && (
              <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" /> Selected
              </div>
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveOwnership}
            disabled={saving}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            {saving ? 'Saving...' : 'Save Ownership Settings'}
          </button>
        </div>
      </div>

      {/* Team Member Management */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <Heading level={3} className="text-xl flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Team Members
          </Heading>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {userPlan === 'trial' && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Free Trial: Limited to 2 team members</span>
            </div>
            <p className="text-xs text-blue-600 font-medium">{team.length} / 2 used</p>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse">Loading team members...</div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <Heading level={3}>No team members yet</Heading>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
              Add your sales staff or partners to start distributing leads automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member._id} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50/30 rounded-full blur-2xl group-hover:bg-indigo-100/40 transition-colors" />

                <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl shadow-inner border border-white">
                    {member.userId?.firstName?.charAt(0) || <UserCircle className="w-7 h-7 text-indigo-400" />}
                  </div>
                  <div>
                    <Heading level={3} className="text-lg leading-tight">
                      {member.userId?.firstName ? `${member.userId.firstName} ${member.userId.lastName || ''}` : member.role === 'owner' ? 'Business Owner' : member.userId?.email || 'Unnamed Member'}
                    </Heading>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                      {member.role === 'owner' ? 'Account Owner' : member.userId?.email ? 'Team Member' : 'Invitation Pending'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 relative z-10">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mb-2 tracking-widest">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-widest ${member.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {member.active ? 'Online' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mb-2 tracking-widest">Performance</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-bold text-slate-800">{member.metrics?.totalLeadsHandled || 0}</p>
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Leads</p>
                    </div>
                  </div>
                </div>

                {/* Quick actions that appear on hover */}
                <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{member.role?.replace('_', ' ') || 'Member'}</p>
                  <div className="flex items-center gap-3">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase transition-colors">
                      Settings →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                {createdMemberInfo ? 'Member Created!' : 'Add Team Member'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setCreatedMemberInfo(null); }} className="text-slate-400 hover:text-slate-900">
                <Shield className="w-6 h-6 rotate-45" />
              </button>
            </div>

            {createdMemberInfo ? (
              <div className="p-8 space-y-6">
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Access Credentials</h4>
                  <p className="text-sm text-slate-600 mb-6 font-medium">Share these details with {createdMemberInfo.userId.firstName} to let them log in.</p>

                  <div className="space-y-3 text-left">
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                        <p className="font-bold text-slate-900">{createdMemberInfo.userId.email}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</p>
                        <p className="font-bold text-slate-900">{createdMemberInfo.password}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Saved to database successfully</p>
                </div>

                <button
                  onClick={() => { setShowAddModal(false); setCreatedMemberInfo(null); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMember} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                    <input
                      required
                      type="text"
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                    <input
                      required
                      type="text"
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password (Optional)</label>
                  <input
                    type="text"
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 font-medium ml-1 italic">Leave empty to generate a random password</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="+91 91234 56789"
                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
