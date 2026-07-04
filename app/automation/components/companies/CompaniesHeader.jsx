'use client';

import { Layers } from 'lucide-react';
import CrmPageHeader, { ToolbarButton } from '../crm/CrmPageHeader';

export default function CompaniesHeader({ onCreate, showGroup, onToggleGroup, ...props }) {
  return (
    <CrmPageHeader
      title="Companies"
      subtitle="Accounts, ownership, and revenue in one workspace."
      searchPlaceholder="Search company, domain, industry…"
      primaryLabel="Add Company"
      totalLabel="companies total"
      onPrimaryClick={onCreate}
      toolbarEnd={
        onToggleGroup ? (
          <ToolbarButton active={showGroup} onClick={onToggleGroup} icon={Layers}>
            Group
          </ToolbarButton>
        ) : null
      }
      {...props}
    />
  );
}
