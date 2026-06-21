'use client';

import { Suspense, useCallback } from 'react';
import { SMART_VIEWS } from '../components/leads/constants';
import { useLeadsWorkspace } from '../hooks/useLeadsWorkspace';
import LeadsHeader from '../components/leads/LeadsHeader';
import CRMFilterBar from '../components/leads/CRMFilterBar';
import BulkActionsBar from '../components/leads/BulkActionsBar';
import LeadTable from '../components/leads/LeadTable';
import CRMKanban from '../components/leads/CRMKanban';
import LeadDrawer from '../components/leads/LeadDrawer';
import LeadsPagination from '../components/leads/LeadsPagination';
import MobileLeadCard from '../components/leads/MobileLeadCard';
import LeadsSkeleton from '../components/leads/LeadsSkeleton';

function LeadsWorkspaceContent() {
  const ws = useLeadsWorkspace();

  const handleSearch = useCallback((value) => ws.setSearchInput(value), [ws]);

  if (ws.loading) return <LeadsSkeleton />;

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8">
        <LeadsHeader
          search={ws.searchInput}
          onSearchChange={handleSearch}
          total={ws.pagination.total}
          refreshing={ws.refreshing}
          onRefresh={ws.refresh}
          viewMode={ws.viewMode}
          onViewModeChange={ws.setViewMode}
          onExport={ws.exportLeads}
        />

        <div className="mt-4 mb-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <CRMFilterBar
            filters={ws.filters}
            onFilterChange={ws.updateFilter}
            smartViews={SMART_VIEWS}
            savedViews={ws.savedViews}
            onSaveView={ws.saveCurrentView}
            onApplySavedView={ws.applySavedView}
            teamMembers={ws.teamMembers}
          />
        </div>

        <BulkActionsBar
          count={ws.selectedIds.length}
          teamMembers={ws.teamMembers}
          onAssign={ws.bulkAssign}
          onDelete={ws.bulkDelete}
          onExport={() => ws.exportLeads('excel')}
        />

        {ws.viewMode === 'table' ? (
          <>
            <div className="hidden lg:block">
              <LeadTable
                leads={ws.leads}
                selectedIds={ws.selectedIds}
                onToggleSelect={ws.toggleSelect}
                onToggleSelectAll={ws.toggleSelectAll}
                onOpenDrawer={ws.setDrawerLeadId}
                teamMembers={ws.teamMembers}
                onAssign={ws.assignLead}
                onStatusChange={ws.updateLeadStatus}
                onCall={ws.initiateCall}
                onRowColorChange={ws.updateLeadRowColor}
                sortField={ws.sortField}
                sortDir={ws.sortDir}
                onSort={ws.toggleSort}
              />
            </div>
            <div className="lg:hidden space-y-3">
              {ws.leads.map((lead) => (
                <MobileLeadCard
                  key={lead._id}
                  lead={lead}
                  selected={ws.selectedIds.includes(lead._id)}
                  onSelect={ws.toggleSelect}
                  onOpen={ws.setDrawerLeadId}
                />
              ))}
              {ws.leads.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-12">No leads match your filters.</p>
              )}
            </div>
          </>
        ) : (
          <CRMKanban
            leads={ws.leads}
            onStatusChange={ws.updateLeadStatus}
            onOpenDrawer={ws.setDrawerLeadId}
          />
        )}

        <LeadsPagination
          pagination={ws.pagination}
          onPageChange={(page) => ws.updateFilter({ page })}
        />
      </div>

      <LeadDrawer
        leadId={ws.drawerLeadId}
        onClose={() => ws.setDrawerLeadId(null)}
        onStatusChange={ws.updateLeadStatus}
        onAssign={ws.assignLead}
        teamMembers={ws.teamMembers}
        onCall={ws.initiateCall}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsWorkspaceContent />
    </Suspense>
  );
}
