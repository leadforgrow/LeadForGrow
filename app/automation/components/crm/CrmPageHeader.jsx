'use client';

import {
  Search,
  RefreshCw,
  Plus,
  Filter,
  ArrowUpDown,
  Upload,
  Download,
} from 'lucide-react';

function ToolbarButton({ active, onClick, icon: Icon, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border rounded-lg whitespace-nowrap transition-colors shrink-0 ${
        active
          ? 'bg-white border-[#D0D5DD] text-[#344054] shadow-sm'
          : 'bg-white border-[#E5E7EB] text-[#475467] hover:bg-[#F9FAFB]'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}

export default function CrmPageHeader({
  title,
  subtitle,
  total,
  totalLabel = 'total',
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  primaryLabel,
  onPrimaryClick,
  showFilters,
  onToggleFilters,
  showSort,
  onToggleSort,
  onImport,
  onExport,
  refreshing,
  onRefresh,
  toolbarStart,
  toolbarEnd,
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold text-[#101828] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#667085] mt-1">{subtitle}</p>}
        </div>

        {primaryLabel && onPrimaryClick && (
          <button
            type="button"
            onClick={onPrimaryClick}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#101828] hover:bg-[#1F2937] rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {primaryLabel}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 bg-[#FAFBFC] border border-[#E5E7EB] rounded-xl">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3] pointer-events-none" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#101828]/10 focus:border-[#D0D5DD] transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 lg:pb-0 shrink-0">
          {toolbarStart}

          {onToggleFilters && (
            <ToolbarButton active={showFilters} onClick={onToggleFilters} icon={Filter}>
              Filter
            </ToolbarButton>
          )}

          {onToggleSort && (
            <ToolbarButton active={showSort} onClick={onToggleSort} icon={ArrowUpDown}>
              Sort
            </ToolbarButton>
          )}

          {(onImport || onExport) && (onToggleFilters || onToggleSort) && (
            <div className="hidden sm:block w-px h-6 bg-[#E5E7EB] shrink-0 mx-0.5" aria-hidden />
          )}

          {onImport && (
            <ToolbarButton onClick={onImport} icon={Upload}>
              Import
            </ToolbarButton>
          )}

          {onExport && (
            <ToolbarButton onClick={onExport} icon={Download}>
              Export
            </ToolbarButton>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh"
              className="p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#475467] hover:bg-[#F9FAFB] disabled:opacity-50 transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {toolbarEnd}
        </div>
      </div>

      {total > 0 && (
        <p className="text-[12px] text-[#98A2B3] mt-3">
          {total.toLocaleString()} {totalLabel}
        </p>
      )}
    </header>
  );
}

export { ToolbarButton };
