/**
 * Repoints the public contact-form token to a valid local Business.
 *
 * Why: the seeded CONTACT_FORM_TOKEN in lib/publicForms.js maps to a Business
 * that may not exist in your local Mongo (imported from a different env). The
 * public /api/forms/submit endpoint then throws "Workspace not found".
 *
 * Usage:
 *   node scripts/fix-contact-form.mjs
 *   node scripts/fix-contact-form.mjs --business=<businessId>
 *   node scripts/fix-contact-form.mjs --owner=leadforgrow@gmail.com
 *   node scripts/fix-contact-form.mjs --token=lfg_form_xxx
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

function loadEnvFile(fileName) {
  const p = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(p)) return false;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
  return true;
}
// Next.js loads .env.local first, then .env — mirror that precedence here.
loadEnvFile('.env.local');
loadEnvFile('.env');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const DEFAULT_TOKEN =
  process.env.NEXT_PUBLIC_CONTACT_FORM_TOKEN ||
  'lfg_form_cc85630e9faab53e1c3c61921d7d4e2f3ed64869f499b07e8bbb4f27c3073c27';

const token = args.token || DEFAULT_TOKEN;

const { default: Form } = await import('@/models/Form');
const { default: Business } = await import('@/models/Business');
const { default: User } = await import('@/models/User');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set. Add it to .env.local first.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

// 1. Pick a target Business
// Default = the LeadForGrow business (owner email leadforgrow@gmail.com or
// LEADFORGROW_OWNER_EMAIL), because that is who the master CONTACT_FORM_TOKEN
// belongs to. --business / --owner flags override for other environments.
const DEFAULT_OWNER_EMAIL =
  process.env.LEADFORGROW_OWNER_EMAIL || 'leadforgrow@gmail.com';

async function findOrHealBusinessForOwner(ownerEmail, { createIfMissing }) {
  const owner = await User.findOne({ email: new RegExp(`^${ownerEmail}$`, 'i') });
  if (!owner) return { owner: null, business: null };

  let business =
    (await Business.findOne({ ownerId: owner._id, status: 'active' })) ||
    (await Business.findOne({ ownerId: owner._id }));

  // User row references a Business that no longer exists — repair.
  if (!business && owner.businessId) {
    const orphaned = await Business.findById(owner.businessId);
    if (orphaned) business = orphaned;
  }

  if (!business && createIfMissing) {
    console.log(
      `No Business owned by ${ownerEmail} — creating a fresh one and linking the user.`
    );
    business = await Business.create({
      businessName: 'LeadForGrow',
      ownerId: owner._id,
      status: 'active',
      plan: 'enterprise',
    });
    owner.businessId = business._id;
    await owner.save();
  } else if (business && String(owner.businessId || '') !== String(business._id)) {
    console.log(`Repairing ${ownerEmail}.businessId → ${business._id}`);
    owner.businessId = business._id;
    await owner.save();
  }

  return { owner, business };
}

let targetBusiness = null;
if (args.business) {
  targetBusiness = await Business.findById(args.business);
  if (!targetBusiness) throw new Error(`Business ${args.business} not found`);
} else if (args.owner) {
  const { owner, business } = await findOrHealBusinessForOwner(args.owner, {
    createIfMissing: true,
  });
  if (!owner) throw new Error(`User with email ${args.owner} not found`);
  targetBusiness = business;
  if (!targetBusiness) throw new Error(`Could not resolve a business for ${args.owner}`);
} else {
  const { business } = await findOrHealBusinessForOwner(DEFAULT_OWNER_EMAIL, {
    createIfMissing: true,
  });
  targetBusiness = business;
  if (!targetBusiness) {
    console.warn(
      `No business owned by ${DEFAULT_OWNER_EMAIL} — falling back to the first active business in the DB.`
    );
    targetBusiness =
      (await Business.findOne({ status: 'active' })) || (await Business.findOne({}));
  }
  if (!targetBusiness) throw new Error('No Business exists in this DB. Create one first.');
}

console.log(`Target business: ${targetBusiness.businessName} (${targetBusiness._id})`);

// 2. Find or create the contact form
let form = await Form.findOne({ token });
if (form) {
  console.log(`Found existing form "${form.name}" — repointing businessId & activating.`);
  form.businessId = targetBusiness._id;
  form.active = true;
  await form.save();
} else {
  console.log('No form with that token — creating a new "Website Contact" form.');
  form = await Form.create({
    businessId: targetBusiness._id,
    name: 'Website Contact',
    token,
    active: true,
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: false },
    ],
  });
}

console.log('Done. Form is now:');
console.log({
  _id: String(form._id),
  name: form.name,
  token: form.token,
  businessId: String(form.businessId),
  active: form.active,
});

await mongoose.disconnect();
