import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Contact from '@/models/automation/Contact';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { logTimelineEvent } from '@/lib/crm/timeline';
import { findDuplicateContacts } from '@/lib/crm/duplicateDetection';

const MAX_IMPORT_ROWS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const { contacts, skipDuplicates = true } = await request.json();
    if (!Array.isArray(contacts) || !contacts.length) {
      return NextResponse.json({ success: false, error: 'contacts array required' }, { status: 400 });
    }
    if (contacts.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { success: false, error: `Imports are limited to ${MAX_IMPORT_ROWS} contacts per request` },
        { status: 400 }
      );
    }

    await dbConnect();
    const created = [];
    const errors = [];
    let skipped = 0;

    for (const row of contacts) {
      try {
        if (!row.firstName) { errors.push({ row, error: 'firstName required' }); continue; }
        if (row.email && !EMAIL_RE.test(row.email)) {
          errors.push({ row, error: 'Invalid email' });
          continue;
        }

        if (skipDuplicates && (row.email || row.phone)) {
          const duplicates = await findDuplicateContacts(tenant.business._id, {
            phones: row.phone ? [row.phone] : [],
            emails: row.email ? [row.email] : [],
          });
          if (duplicates?.length) {
            skipped += 1;
            continue;
          }
        }

        const contact = await Contact.create({
          businessId: tenant.business._id,
          firstName: row.firstName,
          lastName: row.lastName || '',
          type: row.type || 'personal',
          phones: row.phone ? [{ number: row.phone, primary: true }] : [],
          emails: row.email ? [{ address: row.email, primary: true }] : [],
          jobTitle: row.jobTitle,
          source: 'import',
          ownerId: tenant.user._id,
          createdBy: tenant.user._id,
        });
        created.push(contact);
      } catch (e) {
        errors.push({ row, error: e.message });
      }
    }

    if (created.length) {
      await logTimelineEvent({
        businessId: tenant.business._id,
        entityType: 'contact',
        entityId: created[0]._id,
        type: 'contact_created',
        description: `Bulk import: ${created.length} contacts created`,
        performedBy: tenant.user._id,
      });
    }

    return NextResponse.json({ success: true, data: { created: created.length, skipped, errors } });
  } catch (error) {
    console.error('[Contacts Import]', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
});
