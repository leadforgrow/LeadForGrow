import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Contact from '@/models/automation/Contact';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { logTimelineEvent } from '@/lib/crm/timeline';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const { contacts } = await request.json();
    if (!Array.isArray(contacts) || !contacts.length) {
      return NextResponse.json({ success: false, error: 'contacts array required' }, { status: 400 });
    }

    await dbConnect();
    const created = [];
    const errors = [];

    for (const row of contacts) {
      try {
        if (!row.firstName) { errors.push({ row, error: 'firstName required' }); continue; }
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

    return NextResponse.json({ success: true, data: { created: created.length, errors } });
  } catch (error) {
    console.error('[Contacts Import]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
