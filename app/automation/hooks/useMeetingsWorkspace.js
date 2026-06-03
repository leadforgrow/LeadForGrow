'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { authJson } from '@/lib/apiClient';
import toast from 'react-hot-toast';

const EMPTY_DRAFT = {
  title: '',
  description: '',
  category: 'sales_call',
  durationMinutes: 30,
  bookingSlug: '',
  assignmentMode: 'round_robin',
  availabilityRules: {
    timezone: 'Asia/Kolkata',
    workingDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    bufferAfterMinutes: 15,
    minNoticeHours: 2,
    dailyLimit: 0,
  },
  automationRules: {
    whatsappConfirmation: true,
    whatsappReminder: true,
    whatsappReminderMinutes: 30,
    emailReminder: true,
    triggerAutomationOnBook: true,
    leadStatusOnBook: 'interested',
  },
  branding: { accentColor: '#4338ca' },
};

export function useMeetingsWorkspace() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('dashboard');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authJson('/api/automation/meetings?view=dashboard');
      if (res.success) setDashboard(res.data);
    } catch (e) {
      toast.error('Failed to load revenue scheduling');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === '/automation/meetings') {
      load();
    }
  }, [load, pathname]);

  const startCreate = () => {
    setDraft({ ...EMPTY_DRAFT, title: '', bookingSlug: '' });
    setWizardStep(1);
    setMode('create');
  };

  const publishMeeting = async () => {
    setSaving(true);
    try {
      const slug =
        draft.bookingSlug ||
        draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const res = await authJson('/api/automation/meetings', {
        method: 'POST',
        body: JSON.stringify({ ...draft, bookingSlug: slug, status: 'published' }),
      });

      if (res.success) {
        toast.success('Revenue scheduling link published');
        setMode('dashboard');
        load();
      } else {
        toast.error(res.error || 'Failed to publish');
      }
    } catch (e) {
      toast.error('Failed to publish meeting');
    } finally {
      setSaving(false);
    }
  };

  const markNoShow = async (bookingId) => {
    try {
      const res = await authJson(`/api/automation/meetings/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'no_show' }),
      });
      if (res.success) {
        toast.success('No-show recovery triggered via WhatsApp');
        load();
      }
    } catch (e) {
      toast.error('Failed to mark no-show');
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      const res = await authJson(`/api/automation/meetings/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.success) {
        toast.success('Meeting marked complete');
        load();
      }
    } catch (e) {
      toast.error('Failed to update booking');
    }
  };

  return {
    loading,
    dashboard,
    mode,
    setMode,
    wizardStep,
    setWizardStep,
    draft,
    setDraft,
    saving,
    startCreate,
    publishMeeting,
    markNoShow,
    completeBooking,
    refresh: load,
  };
}

export function useMeetingsAnalytics(days = 30) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authJson(`/api/automation/meetings/analytics?days=${days}`);
        if (res.success) setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  return { loading, data };
}

export function useMeetingsTeam() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await authJson('/api/automation/meetings/team');
        if (res.success) setTeam(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, team };
}
