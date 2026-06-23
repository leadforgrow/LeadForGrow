import Lead from '@/models/automation/Lead';
import Contact from '@/models/automation/Contact';
import { dbConnect } from '@/lib/mongodb';

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Find duplicate leads by phone or email within a business.
 */
export async function findDuplicateLeads(businessId, { phone, email, excludeId = null }) {
  await dbConnect();

  const conditions = [];
  const normPhone = normalizePhone(phone);
  const normEmail = normalizeEmail(email);

  if (normPhone) {
    conditions.push({ phone: { $regex: normPhone.slice(-10), $options: 'i' } });
  }
  if (normEmail) {
    conditions.push({ email: normEmail });
  }

  if (!conditions.length) return [];

  const query = {
    businessId,
    archived: false,
    deletedAt: null,
    $or: conditions,
  };
  if (excludeId) query._id = { $ne: excludeId };

  return Lead.find(query).select('name email phone status assignedTo createdAt').limit(20).lean();
}

/**
 * Find duplicate contacts by phone or email.
 */
export async function findDuplicateContacts(businessId, { phones = [], emails = [], excludeId = null }) {
  await dbConnect();

  const conditions = [];
  for (const p of phones) {
    const norm = normalizePhone(p);
    if (norm) conditions.push({ 'phones.number': { $regex: norm.slice(-10), $options: 'i' } });
  }
  for (const e of emails) {
    const norm = normalizeEmail(e);
    if (norm) conditions.push({ 'emails.address': norm });
  }

  if (!conditions.length) return [];

  const query = { businessId, archived: false, deletedAt: null, $or: conditions };
  if (excludeId) query._id = { $ne: excludeId };

  return Contact.find(query).select('firstName lastName fullName emails phones companyId').limit(20).lean();
}

export default { findDuplicateLeads, findDuplicateContacts };
