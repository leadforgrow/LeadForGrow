'use client';

import { useState } from 'react';
import {
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  Building2,
  Briefcase,
  PieChart,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RevenueIntelligenceConfig() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    // Business Value
    avgDealValue: {
      min: '',
      typical: '',
      high: '',
      currency: 'INR'
    },
    serviceValues: [],

    // Sales Process
    sla: {
      firstResponseMinutes: 15,
      followupMinutes: 60
    },
    workingHours: {
      days: [1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Kolkata'
    },

    // Conversion Truth
    conversionRate: {
      low: 5,
      avg: 10,
      high: 20
    },

    // Lead Sources
    sources: [
      { name: 'WhatsApp', weight: 0.8, avgConversion: 15 },
      { name: 'Google Ads', weight: 0.6, avgConversion: 10 },
      { name: 'Manual Entry', weight: 0.4, avgConversion: 5 }
    ],

    // Follow-up
    followup: {
      maxAttempts: 5,
      gapMinutes: 1440
    },
    preferredChannels: ['call', 'whatsapp'],

    // Team
    teamRoles: [],

    // Legal
    estimationAcknowledged: false
  });

  const steps = [
    {
      id: 'value',
      title: 'Deal Value',
      subtitle: 'Help us understand your revenue',
      icon: DollarSign
    },
    {
      id: 'sales',
      title: 'Sales Process',
      subtitle: 'Response times & working hours',
      icon: Clock
    },
    {
      id: 'conversion',
      title: 'Conversion Reality',
      subtitle: 'Historical performance data',
      icon: Target
    },
    {
      id: 'sources',
      title: 'Lead Sources',
      subtitle: 'Prioritize your channels',
      icon: TrendingUp
    },
    {
      id: 'followup',
      title: 'Follow-up Strategy',
      subtitle: 'Contact preferences',
      icon: Users
    },
    {
      id: 'confirm',
      title: 'Review & Confirm',
      subtitle: 'Finalize your settings',
      icon: CheckCircle2
    }
  ];

  const handleSave = async () => {
    if (!config.avgDealValue?.typical) {
      toast.error('Please enter a typical deal value');
      if (currentStep !== 0) setCurrentStep(0);
      return;
    }

    if (!config.estimationAcknowledged) {
      toast.error('Please acknowledge the estimation disclaimer');
      return;
    }

    setSaving(true);
    try {
      // Prepare payload with correct types to satisfy backend schema
      const payload = {
        ...config,
        avgDealValue: {
          ...config.avgDealValue,
          min: config.avgDealValue.min ? parseFloat(config.avgDealValue.min) : undefined,
          typical: parseFloat(config.avgDealValue.typical),
          high: config.avgDealValue.high ? parseFloat(config.avgDealValue.high) : undefined
        },
        serviceValues: config.serviceValues.map(s => ({
          ...s,
          value: parseFloat(s.value)
        })),
        sla: {
          firstResponseMinutes: parseInt(config.sla.firstResponseMinutes),
          followupMinutes: parseInt(config.sla.followupMinutes)
        },
        conversionRate: {
          low: parseFloat(config.conversionRate.low),
          avg: parseFloat(config.conversionRate.avg),
          high: parseFloat(config.conversionRate.high)
        },
        sources: config.sources.map(s => ({
          ...s,
          weight: parseFloat(s.weight),
          avgConversion: parseFloat(s.avgConversion)
        })),
        followup: {
          maxAttempts: parseInt(config.followup.maxAttempts),
          gapMinutes: parseInt(config.followup.gapMinutes)
        }
      };

      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/revenue-config?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Revenue intelligence configured successfully!');
        // Redirect to dashboard to show populated data
        setTimeout(() => {
          router.push('/automation');
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Revenue Intelligence Setup</h1>
                <p className="text-sm text-slate-500">Configure your business metrics</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-300 scale-110'
                      : isCompleted
                        ? 'bg-green-500 shadow-md'
                        : 'bg-slate-200'
                      }`}>
                      <Icon className={`w-6 h-6 ${isActive || isCompleted ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-6 left-[60%] right-[-40%] h-0.5 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
          {currentStep === 0 && <DealValueStep config={config} setConfig={setConfig} />}
          {currentStep === 1 && <SalesProcessStep config={config} setConfig={setConfig} />}
          {currentStep === 2 && <ConversionStep config={config} setConfig={setConfig} />}
          {currentStep === 3 && <SourcesStep config={config} setConfig={setConfig} />}
          {currentStep === 4 && <FollowupStep config={config} setConfig={setConfig} />}
          {currentStep === 5 && <ConfirmStep config={config} setConfig={setConfig} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-300 transition-all flex items-center gap-2"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !config.estimationAcknowledged}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Deal Value
function DealValueStep({ config, setConfig }) {
  const addService = () => {
    setConfig({
      ...config,
      serviceValues: [...config.serviceValues, { name: '', value: '' }]
    });
  };

  const updateService = (idx, field, value) => {
    const newServices = [...config.serviceValues];
    newServices[idx][field] = value;
    setConfig({ ...config, serviceValues: newServices });
  };

  const removeService = (idx) => {
    setConfig({
      ...config,
      serviceValues: config.serviceValues.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">What is the average value of one successful lead?</h2>
        <p className="text-slate-600">This powers our revenue risk and recovery calculations.</p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Why we ask this</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Understanding your deal values helps us calculate revenue at risk, prioritize high-value leads, and show you exactly how much money you're recovering through better follow-up.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Selector */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          Currency
        </label>
        <select
          value={config.avgDealValue.currency}
          onChange={(e) => setConfig({
            ...config,
            avgDealValue: { ...config.avgDealValue, currency: e.target.value }
          })}
          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-900"
        >
          <option value="INR">₹ Indian Rupee (INR)</option>
          <option value="USD">$ US Dollar (USD)</option>
          <option value="EUR">€ Euro (EUR)</option>
          <option value="GBP">£ British Pound (GBP)</option>
        </select>
      </div>

      {/* Deal Value Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Minimum Deal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              {config.avgDealValue.currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              value={config.avgDealValue.min}
              onChange={(e) => setConfig({
                ...config,
                avgDealValue: { ...config.avgDealValue, min: e.target.value }
              })}
              placeholder="5,000"
              className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Typical Deal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              {config.avgDealValue.currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              value={config.avgDealValue.typical}
              onChange={(e) => setConfig({
                ...config,
                avgDealValue: { ...config.avgDealValue, typical: e.target.value }
              })}
              placeholder="15,000"
              className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-900 shadow-sm"
            />
          </div>
          <p className="text-xs text-slate-500">Most common deal size</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">High-Value Deal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              {config.avgDealValue.currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              value={config.avgDealValue.high}
              onChange={(e) => setConfig({
                ...config,
                avgDealValue: { ...config.avgDealValue, high: e.target.value }
              })}
              placeholder="50,000"
              className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Service-wise Values (Optional) */}
      <div className="pt-6 border-t-2 border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Service-wise Deal Values (Optional)</h3>
            <p className="text-sm text-slate-600">Different services have different values</p>
          </div>
          <button
            onClick={addService}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm"
          >
            + Add Service
          </button>
        </div>

        <div className="space-y-3">
          {config.serviceValues.map((service, idx) => (
            <div key={idx} className="flex gap-3">
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(idx, 'name', e.target.value)}
                placeholder="Service name (e.g., SEO Package)"
                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
              <div className="relative w-48">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {config.avgDealValue.currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  value={service.value}
                  onChange={(e) => updateService(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>
              <button
                onClick={() => removeService(idx)}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: Sales Process
function SalesProcessStep({ config, setConfig }) {
  const daysOfWeek = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' }
  ];

  const toggleDay = (dayId) => {
    const days = config.workingHours.days;
    if (days.includes(dayId)) {
      setConfig({
        ...config,
        workingHours: {
          ...config.workingHours,
          days: days.filter(d => d !== dayId)
        }
      });
    } else {
      setConfig({
        ...config,
        workingHours: {
          ...config.workingHours,
          days: [...days, dayId].sort()
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Define Your Sales Response Standards</h2>
        <p className="text-slate-600">Help us understand when leads should be contacted and when your team is available.</p>
      </div>

      {/* Response Time SLA */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6">
        <div className="flex gap-4 items-start mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Ideal Response Time (SLA)</h4>
            <p className="text-sm text-slate-700">Within how many minutes should a lead ideally be contacted?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">First Response (minutes)</label>
            <select
              value={config.sla.firstResponseMinutes}
              onChange={(e) => setConfig({
                ...config,
                sla: { ...config.sla, firstResponseMinutes: parseInt(e.target.value) }
              })}
              className="w-full px-5 py-4 bg-white border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold text-slate-900"
            >
              <option value={2}>2 minutes (Real Estate)</option>
              <option value={5}>5 minutes (Agency)</option>
              <option value={15}>15 minutes (SMB)</option>
              <option value={30}>30 minutes (Relaxed)</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Follow-up Response (minutes)</label>
            <select
              value={config.sla.followupMinutes}
              onChange={(e) => setConfig({
                ...config,
                sla: { ...config.sla, followupMinutes: parseInt(e.target.value) }
              })}
              className="w-full px-5 py-4 bg-white border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold text-slate-900"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Business Working Hours
        </h3>

        {/* Days of Week */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-3 block">Working Days</label>
          <div className="flex gap-2 flex-wrap">
            {daysOfWeek.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${config.workingHours.days.includes(day.id)
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Start Time</label>
            <input
              type="time"
              value={config.workingHours.startTime}
              onChange={(e) => setConfig({
                ...config,
                workingHours: { ...config.workingHours, startTime: e.target.value }
              })}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-slate-900"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">End Time</label>
            <input
              type="time"
              value={config.workingHours.endTime}
              onChange={(e) => setConfig({
                ...config,
                workingHours: { ...config.workingHours, endTime: e.target.value }
              })}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Timezone</label>
          <select
            value={config.workingHours.timezone}
            onChange={(e) => setConfig({
              ...config,
              workingHours: { ...config.workingHours, timezone: e.target.value }
            })}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-slate-900"
          >
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="America/New_York">US Eastern</option>
            <option value="America/Los_Angeles">US Pacific</option>
            <option value="Europe/London">UK</option>
            <option value="Australia/Sydney">Australia</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Step 3: Conversion Reality
function ConversionStep({ config, setConfig }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">What's Your Realistic Conversion Rate?</h2>
        <p className="text-slate-600">No guesses needed - just give us a rough range based on your experience.</p>
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Out of 100 leads, roughly how many convert?</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              This helps us calculate revenue recovery confidence. Be realistic - lower is better than optimistic guessing.
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Rate Selector */}
      <div className="space-y-4">
        {[
          { range: '1-5%', low: 1, avg: 3, high: 5, label: 'Very competitive / High-ticket', color: 'red' },
          { range: '5-10%', low: 5, avg: 7, high: 10, label: 'Standard B2B / Services', color: 'orange' },
          { range: '10-20%', low: 10, avg: 15, high: 20, label: 'Strong pipeline / Warm leads', color: 'green' },
          { range: '20%+', low: 20, avg: 25, high: 30, label: 'Exceptional / Referral-based', color: 'blue' }
        ].map(option => {
          const isSelected = config.conversionRate.avg === option.avg;

          return (
            <button
              key={option.range}
              onClick={() => setConfig({
                ...config,
                conversionRate: { low: option.low, avg: option.avg, high: option.high }
              })}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl font-bold ${isSelected ? `text-${option.color}-600` : 'text-slate-900'}`}>
                      {option.range}
                    </span>
                    {isSelected && (
                      <div className={`w-6 h-6 rounded-full bg-${option.color}-500 flex items-center justify-center`}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${isSelected ? `text-${option.color}-700` : 'text-slate-600'}`}>
                    {option.label}
                  </p>
                </div>
                <PieChart className={`w-8 h-8 ${isSelected ? `text-${option.color}-500` : 'text-slate-300'}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Note:</strong> These ranges power our AI's confidence scoring. Lower conversion rates = more conservative revenue estimates = better decision making.
        </p>
      </div>
    </div>
  );
}

// Step 4: Lead Sources
function SourcesStep({ config, setConfig }) {
  const updateSource = (idx, field, value) => {
    const newSources = [...config.sources];
    newSources[idx][field] = field === 'weight' ? parseFloat(value) : value;
    setConfig({ ...config, sources: newSources });
  };

  const addSource = () => {
    setConfig({
      ...config,
      sources: [...config.sources, { name: '', weight: 0.5, avgConversion: 0 }]
    });
  };

  const removeSource = (idx) => {
    setConfig({
      ...config,
      sources: config.sources.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Which Lead Sources Convert Better?</h2>
        <p className="text-slate-600">Different channels have different quality - help us prioritize the right leads.</p>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Source Quality Matters</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              A WhatsApp lead might be worth 3x more than a form fill. Weight helps us show you the real revenue at risk.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {config.sources.map((source, idx) => (
          <div key={idx} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-slate-600 mb-2 block">Source Name</label>
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => updateSource(idx, 'name', e.target.value)}
                  placeholder="WhatsApp, Google Ads, etc."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-600 mb-2 block">Quality Weight</label>
                <select
                  value={source.weight}
                  onChange={(e) => updateSource(idx, 'weight', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  <option value={0.3}>Low (30%)</option>
                  <option value={0.5}>Medium (50%)</option>
                  <option value={0.7}>High (70%)</option>
                  <option value={0.9}>Very High (90%)</option>
                  <option value={1.0}>Premium (100%)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-600 mb-2 block">Avg Conversion %</label>
                <input
                  type="number"
                  value={source.avgConversion}
                  onChange={(e) => updateSource(idx, 'avgConversion', e.target.value)}
                  placeholder="10"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-transparent mb-2 block select-none">&nbsp;</label>
                <button
                  onClick={() => removeSource(idx)}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 border-2 border-transparent rounded-xl hover:bg-red-100 transition-all font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSource}
        className="w-full px-6 py-4 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-all border-2 border-blue-200"
      >
        + Add Another Source
      </button>
    </div>
  );
}

// Step 5: Follow-up Strategy
function FollowupStep({ config, setConfig }) {
  const channels = [
    {
      id: 'call',
      label: 'Phone Call',
      icon: (
        <img
          src="/images/logo/phonecall.png"
          alt="Phone"
          className="w-12 h-12 object-contain drop-shadow-md"
        />
      ),
      activeColor: 'border-blue-500 bg-blue-50'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <img
          src="/images/logo/whatsapp.png"
          alt="WhatsApp"
          className="w-12 h-12 object-contain drop-shadow-md"
        />
      ),
      activeColor: 'border-emerald-500 bg-emerald-50'
    },
    {
      id: 'email',
      label: 'Email',
      icon: (
        <img
          src="/images/logo/gmail.png"
          alt="Gmail"
          className="w-12 h-12 object-contain drop-shadow-md"
        />
      ),
      activeColor: 'border-rose-500 bg-rose-50'
    }
  ];

  const toggleChannel = (channelId) => {
    const channels = config.preferredChannels;
    if (channels.includes(channelId)) {
      setConfig({
        ...config,
        preferredChannels: channels.filter(c => c !== channelId)
      });
    } else {
      setConfig({
        ...config,
        preferredChannels: [...channels, channelId]
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">How Do You Follow Up With Leads?</h2>
        <p className="text-slate-600">Define your follow-up persistence and preferred contact methods.</p>
      </div>

      {/* Follow-up Attempts */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
        <div className="flex gap-4 items-start mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Follow-up Persistence</h4>
            <p className="text-sm text-slate-700">After how many attempts do you usually stop following a lead?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Max Follow-up Attempts</label>
            <select
              value={config.followup.maxAttempts}
              onChange={(e) => setConfig({
                ...config,
                followup: { ...config.followup, maxAttempts: parseInt(e.target.value) }
              })}
              className="w-full px-5 py-4 bg-white border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-900"
            >
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
              <option value={7}>7 attempts</option>
              <option value={10}>10 attempts</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Time Gap Between Attempts</label>
            <select
              value={config.followup.gapMinutes}
              onChange={(e) => setConfig({
                ...config,
                followup: { ...config.followup, gapMinutes: parseInt(e.target.value) }
              })}
              className="w-full px-5 py-4 bg-white border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-900"
            >
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={720}>12 hours</option>
              <option value={1440}>1 day</option>
              <option value={2880}>2 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferred Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Which channels work best to close deals?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map(channel => {
            const isSelected = config.preferredChannels.includes(channel.id);

            return (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`p-8 rounded-3xl border-2 transition-all group relative ${isSelected
                  ? channel.activeColor + ' shadow-xl scale-[1.02]'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {channel.icon}
                  </div>
                  <div className="text-center">
                    <span className={`block font-black text-lg ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                      {channel.label}
                    </span>
                    {isSelected && (
                      <div className="mt-2 flex justify-center">
                        <div className="bg-slate-900 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 6: Confirm
function ConfirmStep({ config, setConfig }) {
  const formatCurrency = (value) => {
    const symbol = config.avgDealValue.currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(value || 0).toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Your Configuration</h2>
        <p className="text-slate-600">Please verify all settings before activating revenue intelligence.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Deal Values</h4>
              <p className="text-sm text-slate-600">Typical: {formatCurrency(config.avgDealValue.typical)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Response SLA</h4>
              <p className="text-sm text-slate-600">First: {config.sla.firstResponseMinutes} min</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Conversion Rate</h4>
              <p className="text-sm text-slate-600">Average: {config.conversionRate.avg}%</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Lead Sources</h4>
              <p className="text-sm text-slate-600">{config.sources.length} configured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-3">Important Legal Disclaimer</h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.estimationAcknowledged}
                  onChange={(e) => setConfig({ ...config, estimationAcknowledged: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-2 border-yellow-500 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">
                  I understand that all revenue insights, estimates, and "revenue at risk" calculations are
                  <strong> probability-based projections</strong>, not guaranteed income. These metrics are
                  designed to help prioritize leads and measure team performance, but actual conversion and
                  revenue may vary significantly based on many factors outside the system's control.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {!config.estimationAcknowledged && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700 font-semibold">
              Please acknowledge the disclaimer above to complete setup
            </p>
          </div>
        </div>
      )}
    </div>
  );
}