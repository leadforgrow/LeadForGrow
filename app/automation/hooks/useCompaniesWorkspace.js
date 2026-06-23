'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

export function useCompaniesWorkspace() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '', employeeCount: '' });

  const fetchCompanies = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const params = new URLSearchParams({ page: pagination.page, limit: '50' });
      if (search) params.set('search', search);
      const res = await authFetch(`/api/automation/companies?${params}`);
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, pagination.page]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const createCompany = async () => {
    if (!form.name) { toast.error('Company name is required'); return; }
    const res = await authFetch('/api/automation/companies', { method: 'POST', body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) {
      toast.success('Company created');
      setShowModal(false);
      setForm({ name: '', industry: '', website: '', email: '', phone: '', employeeCount: '' });
      fetchCompanies(true);
    } else toast.error(data.error || 'Failed to create');
  };

  return { companies, loading, refreshing, search, setSearch, pagination, showModal, setShowModal, form, setForm, fetchCompanies, createCompany };
}
