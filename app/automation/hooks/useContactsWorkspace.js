'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

export function useContactsWorkspace() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', type: 'personal', jobTitle: '' });

  const fetchContacts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const params = new URLSearchParams({ page: pagination.page, limit: '50' });
      if (search) params.set('search', search);
      const res = await authFetch(`/api/automation/contacts?${params}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, pagination.page]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const createContact = async () => {
    if (!form.firstName) { toast.error('First name is required'); return; }
    const body = {
      firstName: form.firstName,
      lastName: form.lastName,
      type: form.type,
      jobTitle: form.jobTitle,
      phones: form.phone ? [{ number: form.phone, primary: true }] : [],
      emails: form.email ? [{ address: form.email, primary: true }] : [],
    };
    const res = await authFetch('/api/automation/contacts', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) {
      toast.success('Contact created');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', type: 'personal', jobTitle: '' });
      fetchContacts(true);
      if (data.duplicates?.length) toast(`Found ${data.duplicates.length} possible duplicate(s)`, { icon: '⚠️' });
    } else toast.error(data.error || 'Failed to create');
  };

  const archiveContact = async (id) => {
    const res = await authFetch(`/api/automation/contacts/${id}`, { method: 'PUT', body: JSON.stringify({ archived: true }) });
    const data = await res.json();
    if (data.success) { toast.success('Contact archived'); fetchContacts(true); }
    else toast.error(data.error);
  };

  return { contacts, loading, refreshing, search, setSearch, pagination, showModal, setShowModal, form, setForm, fetchContacts, createContact, archiveContact };
}
