'use client';

import CrmPageHeader from '../crm/CrmPageHeader';

export default function ContactsHeader({ onCreate, ...props }) {
  return (
    <CrmPageHeader
      title="Contacts"
      subtitle="Manage people, relationships, and communication in one place."
      searchPlaceholder="Search name, email, phone, company…"
      primaryLabel="Add Contact"
      totalLabel="contacts total"
      onPrimaryClick={onCreate}
      {...props}
    />
  );
}
