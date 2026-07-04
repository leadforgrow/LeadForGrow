#!/usr/bin/env node
/**
 * Seed meeting schedule for dashboard calendar (current month).
 * Usage: node --use-system-ca scripts/seed-demo-meetings.js [email]
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';

const root = process.cwd();
const envLocal = path.join(root, '.env.local');
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const EMAIL = (process.argv[2] || 'contact@leadforgrow.com').toLowerCase().trim();
const SEED_TAG = 'seed-demo-meetings';

const MEETING_TITLES = [
  'Product Demo Call',
  'Weekly Pipeline Review',
  'CRM Onboarding Session',
  'Sales Discovery Call',
  'WhatsApp Automation Walkthrough',
  'Pricing Discussion',
  'Implementation Kickoff',
  'Quarterly Business Review',
  'Lead Qualification Sync',
  'Proposal Walkthrough',
  'Technical Integration Call',
  'Account Strategy Meeting',
  'Demo Follow-up',
  'Contract Review',
  'Growth Planning Session',
];

const PLATFORMS = [
  { name: 'Google Meet', link: () => `https://meet.google.com/${randomUUID().slice(0, 3)}-${randomUUID().slice(0, 4)}-${randomUUID().slice(0, 3)}` },
  { name: 'Zoom', link: () => `https://zoom.us/j/${Math.floor(10000000000 + Math.random() * 89999999999)}` },
  { name: 'Slack', link: () => `https://app.slack.com/huddle/${randomUUID().slice(0, 8)}` },
];

function atDay(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ email: EMAIL });
  if (!user) {
    console.error(`User not found: ${EMAIL}`);
    process.exit(1);
  }

  let businessId = user.businessId;
  if (!businessId) {
    const biz = await db.collection('businesses').findOne({ ownerId: user._id });
    businessId = biz?._id;
  }
  if (!businessId) {
    console.error('No business for user');
    process.exit(1);
  }

  const ownerId = user._id;
  const leads = await db.collection('leads')
    .find({ businessId, archived: { $ne: true } })
    .project({ _id: 1, name: 1, email: 1, phone: 1 })
    .limit(40)
    .toArray();

  if (!leads.length) {
    console.error('No leads found — run seed-demo-crm-data.js first');
    process.exit(1);
  }

  const companies = await db.collection('companies')
    .find({ businessId })
    .project({ name: 1 })
    .limit(20)
    .toArray();

  // Meeting type
  let meetingType = await db.collection('meetingtypes').findOne({
    businessId,
    $or: [{ tags: SEED_TAG }, { tags: 'seed-demo' }, { bookingSlug: { $regex: /^seed-/ } }],
  });

  if (!meetingType) {
    const typeId = new mongoose.Types.ObjectId();
    await db.collection('meetingtypes').insertOne({
      _id: typeId,
      businessId,
      title: 'Sales Meeting',
      description: 'Demo schedule meetings',
      category: 'sales_call',
      durationMinutes: 45,
      bookingSlug: `seed-schedule-${String(businessId).slice(-6)}`,
      status: 'published',
      ownerId,
      hostIds: [ownerId],
      assignmentMode: 'fixed',
      tags: [SEED_TAG],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    meetingType = { _id: typeId };
  }

  // Clear previous schedule seed only
  const del = await db.collection('meetingbookings').deleteMany({
    businessId,
    $or: [
      { 'guest.notes': SEED_TAG },
      { source: 'seed-schedule' },
    ],
  });
  // Also clear older seed meetings that may have inactive statuses
  await db.collection('meetingbookings').deleteMany({
    businessId,
    notes: { $regex: /Seed meeting|Demo with/i },
  });
  console.log(`Cleared ${del.deletedCount} previous schedule meetings`);

  // Spread meetings across current month: today, nearby days, and rest of month
  const scheduleSlots = [
    // Today — several meetings so schedule looks full
    { day: 0, hour: 9, min: 0, duration: 60, status: 'confirmed' },
    { day: 0, hour: 10, min: 0, duration: 40, status: 'scheduled' },
    { day: 0, hour: 11, min: 0, duration: 60, status: 'confirmed' },
    { day: 0, hour: 14, min: 30, duration: 45, status: 'scheduled' },
    { day: 0, hour: 16, min: 0, duration: 30, status: 'confirmed' },
    // Tomorrow
    { day: 1, hour: 9, min: 30, duration: 45, status: 'scheduled' },
    { day: 1, hour: 11, min: 0, duration: 60, status: 'confirmed' },
    { day: 1, hour: 15, min: 0, duration: 30, status: 'scheduled' },
    // Day after
    { day: 2, hour: 10, min: 0, duration: 45, status: 'confirmed' },
    { day: 2, hour: 13, min: 0, duration: 60, status: 'scheduled' },
    // Rest of week / month
    { day: 3, hour: 9, min: 0, duration: 30, status: 'scheduled' },
    { day: 3, hour: 16, min: 30, duration: 45, status: 'confirmed' },
    { day: 4, hour: 11, min: 0, duration: 60, status: 'scheduled' },
    { day: 5, hour: 10, min: 0, duration: 45, status: 'confirmed' },
    { day: 6, hour: 14, min: 0, duration: 30, status: 'scheduled' },
    { day: -1, hour: 10, min: 0, duration: 45, status: 'confirmed' },
    { day: -2, hour: 15, min: 0, duration: 30, status: 'scheduled' },
    { day: 7, hour: 9, min: 0, duration: 60, status: 'scheduled' },
    { day: 8, hour: 11, min: 30, duration: 45, status: 'confirmed' },
    { day: 10, hour: 10, min: 0, duration: 30, status: 'scheduled' },
    { day: 12, hour: 14, min: 0, duration: 60, status: 'confirmed' },
    { day: 14, hour: 9, min: 30, duration: 45, status: 'scheduled' },
    { day: 16, hour: 16, min: 0, duration: 30, status: 'confirmed' },
    { day: 18, hour: 11, min: 0, duration: 45, status: 'scheduled' },
    { day: 20, hour: 10, min: 0, duration: 60, status: 'confirmed' },
  ];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const docs = [];
  for (let i = 0; i < scheduleSlots.length; i++) {
    const slot = scheduleSlots[i];
    const start = atDay(slot.day, slot.hour, slot.min);
    // Keep only meetings that fall in current calendar month (dashboard filter)
    if (start < monthStart || start >= monthEnd) continue;

    const lead = leads[i % leads.length];
    const company = companies[i % Math.max(companies.length, 1)];
    const platform = PLATFORMS[i % PLATFORMS.length];
    const title = MEETING_TITLES[i % MEETING_TITLES.length];
    const end = new Date(start.getTime() + slot.duration * 60000);

    docs.push({
      _id: new mongoose.Types.ObjectId(),
      businessId,
      meetingTypeId: meetingType._id,
      leadId: lead._id,
      assignedTo: ownerId,
      guest: {
        name: lead.name,
        email: lead.email || `${lead.name.split(' ')[0].toLowerCase()}@example-demo.test`,
        phone: lead.phone || '',
        whatsapp: lead.phone || '',
        company: company?.name || 'Demo Co',
        notes: SEED_TAG,
      },
      startTime: start,
      endTime: end,
      timezone: 'Asia/Kolkata',
      source: 'seed-schedule',
      status: slot.status,
      meetingLink: platform.link(),
      revenueValue: [25000, 45000, 75000, 120000, 180000][i % 5],
      notes: title,
      whatsappConfirmationSent: true,
      emailConfirmationSent: true,
      remindersScheduled: true,
      createdAt: start,
      updatedAt: start,
    });
  }

  if (!docs.length) {
    console.error('No meetings generated for current month');
    process.exit(1);
  }

  await db.collection('meetingbookings').insertMany(docs);

  const byDay = {};
  for (const m of docs) {
    const key = m.startTime.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
  }

  console.log(`Inserted ${docs.length} meetings for ${EMAIL}`);
  console.log('By date:', byDay);
  console.log('Refresh /automation — Calendar schedule should show meetings for today and this month');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});
