#!/usr/bin/env node
/**
 * Full CRM demo seed — leads, contacts, companies, deals, notes, tasks,
 * activities, meetings, conversations, messages, comments, notifications.
 *
 * Usage: node --use-system-ca scripts/seed-demo-crm-data.js [email]
 * Default: contact@leadforgrow.com
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
const LEAD_COUNT = 60;
const DEAL_COUNT = 50;
const COMPANY_COUNT = 30;
const SEED_TAG = 'seed-demo';

const STAGES = [
  'new_lead', 'first_contact', 'qualified', 'demo_scheduled', 'demo_completed',
  'quotation_sent', 'follow_up', 'negotiation', 'decision_pending', 'payment_pending',
  'won', 'lost',
];

const STAGE_PROBABILITY = {
  new_lead: 5, first_contact: 15, qualified: 20, demo_scheduled: 30,
  demo_completed: 40, quotation_sent: 50, follow_up: 55, negotiation: 70,
  decision_pending: 80, payment_pending: 90, won: 100, lost: 0,
};

const LEAD_STATUSES = [...STAGES.filter((s) => s !== 'won'), 'won', 'converted'];

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Arjun', 'Isha', 'Karan', 'Meera',
  'Rahul', 'Sneha', 'Aditya', 'Pooja', 'Siddharth', 'Kavya', 'Nikhil', 'Divya', 'Amit', 'Riya',
  'James', 'Emily', 'Michael', 'Sophia', 'Daniel', 'Olivia', 'William', 'Ava', 'Lucas', 'Mia',
  'Chen', 'Yuki', 'Hans', 'Marie', 'Carlos', 'Sofia', 'Ahmed', 'Fatima', 'Liam', 'Nora',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Mehta', 'Kapoor', 'Nair', 'Joshi', 'Malhotra',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor',
  'Tanaka', 'Mueller', 'Silva', 'Hassan', 'Kim', 'Park', 'Nguyen', 'Costa', 'Ivanov', 'Andersen',
];

const COMPANY_NAMES = [
  'NovaTech Solutions', 'BrightPath Media', 'Orbit Retail', 'Summit Finance', 'GreenLeaf Organics',
  'Pulse Health', 'Skyline Builders', 'Quantum Labs', 'Harbor Logistics', 'Vertex Software',
  'Lumen Design', 'Apex Motors', 'Coral Hospitality', 'Nimbus Cloud', 'Forge Manufacturing',
  'Atlas Consulting', 'Beacon Education', 'Cedar Homes', 'Drift Commerce', 'Echo Analytics',
  'Flare Energy', 'Glacier Foods', 'Helix Biotech', 'Ivory Fashion', 'Jade Travel',
  'Kite Sports', 'Lotus Pharma', 'Maple Insurance', 'Nest Realty', 'Orbit Telecom',
];

const INDUSTRIES = [
  'SaaS', 'Retail', 'Healthcare', 'Finance', 'Manufacturing', 'Education',
  'Real Estate', 'Hospitality', 'Logistics', 'Marketing', 'Telecom', 'Energy',
];

const JOB_TITLES = [
  'Founder', 'CEO', 'Marketing Head', 'Sales Manager', 'Operations Lead',
  'CTO', 'Product Manager', 'Growth Lead', 'Owner', 'Director',
];

const SOURCES = [
  'website', 'form', 'whatsapp', 'referral', 'ad', 'call', 'manual', 'bulk',
  'instagram_ad', 'facebook_ad', 'meta_ads', 'other',
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const SERVICES = [
  'CRM Setup', 'SEO Package', 'WhatsApp Automation', 'Lead Generation',
  'Website Redesign', 'Email Marketing', 'Social Ads', 'Sales Pipeline',
  'Chatbot Setup', 'Analytics Dashboard', 'Inbound Funnel', 'Retargeting',
];

const LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560001' },
  { city: 'Delhi', state: 'Delhi', country: 'India', postalCode: '110001' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', postalCode: '500001' },
  { city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', postalCode: '600001' },
  { city: 'Singapore', state: '', country: 'Singapore', postalCode: '018956' },
  { city: 'Sydney', state: 'NSW', country: 'Australia', postalCode: '2000' },
  { city: 'London', state: 'England', country: 'United Kingdom', postalCode: 'EC1A' },
  { city: 'New York', state: 'NY', country: 'United States', postalCode: '10001' },
  { city: 'Toronto', state: 'ON', country: 'Canada', postalCode: 'M5H' },
  { city: 'Dubai', state: '', country: 'United Arab Emirates', postalCode: '00000' },
  { city: 'Berlin', state: '', country: 'Germany', postalCode: '10115' },
  { city: 'Paris', state: '', country: 'France', postalCode: '75001' },
  { city: 'Tokyo', state: '', country: 'Japan', postalCode: '100-0001' },
  { city: 'Jakarta', state: '', country: 'Indonesia', postalCode: '10110' },
  { city: 'São Paulo', state: 'SP', country: 'Brazil', postalCode: '01000' },
  { city: 'San Francisco', state: 'CA', country: 'United States', postalCode: '94105' },
];

const STREETS = [
  '12 MG Road', '45 Park Street', '88 Market Lane', '3 Innovation Hub',
  '210 Tech Park', '7 Harbour View', '19 King Street', '56 Oak Avenue',
];

const DEAL_AMOUNTS = [
  15000, 25000, 35000, 45000, 55000, 75000, 99000, 120000,
  150000, 180000, 220000, 275000, 350000, 450000, 600000, 850000,
];

const LOST_REASONS = ['Budget', 'Chose competitor', 'No response', 'Timing', 'Not a fit'];
const WON_REASONS = ['Best pricing', 'Strong demo', 'Referral trust', 'Feature fit'];

const NOTE_SNIPPETS = [
  'Interested in annual plan. Asked for ROI case study.',
  'Decision maker is the founder. Prefers WhatsApp follow-ups.',
  'Budget approved for Q2. Waiting on legal review.',
  'Demo went well — wants integration with existing CRM.',
  'Requested proposal with 3 pricing tiers.',
  'Competitor quote is higher; we are preferred vendor.',
  'Needs onboarding support for 12-person sales team.',
  'Follow up after board meeting next week.',
];

const TASK_TYPES = ['call', 'whatsapp', 'email', 'meeting', 'follow_up', 'other'];
const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

const CHAT_INCOMING = [
  'Hi, I saw your ad and want to know more.',
  'Can we schedule a demo this week?',
  'What is the pricing for the pro plan?',
  'We need WhatsApp automation for our leads.',
  'Thanks, that sounds good.',
];

const CHAT_OUTGOING = [
  'Thanks for reaching out! Happy to help.',
  'Sure — I can share a demo slot tomorrow.',
  'Our pro plan starts at a flexible monthly rate.',
  'We can set that up within a few days.',
  'Great — I will send the proposal shortly.',
];

const DEFAULT_PIPELINE_STAGES = STAGES.map((key, order) => ({
  key,
  label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  order,
  color: '#94a3b8',
  probability: STAGE_PROBABILITY[key],
  isWon: key === 'won',
  isLost: key === 'lost',
}));

function pick(arr, i) {
  return arr[i % arr.length];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dateMonthsAgo(monthOffset, dayOffset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  d.setDate(Math.max(1, Math.min(28, d.getDate() - dayOffset)));
  d.setHours(randInt(9, 18), randInt(0, 59), randInt(0, 59), 0);
  return d;
}

function phoneFor(i) {
  const base = 9000000000 + (i * 137) % 999999999;
  return `+91${String(base).slice(0, 10)}`;
}

function emailFor(first, last, i) {
  return `${first}.${last}.${i}@example-demo.test`.toLowerCase();
}

function domainFor(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.demo.test`;
}

function oid() {
  return new mongoose.Types.ObjectId();
}

async function clearSeed(db, businessId) {
  const leads = db.collection('leads');
  const deals = db.collection('deals');
  const contacts = db.collection('contacts');
  const companies = db.collection('companies');
  const notes = db.collection('crmnotes');
  const tasks = db.collection('tasks');
  const activities = db.collection('activities');
  const comments = db.collection('crmcomments');
  const conversations = db.collection('conversations');
  const messages = db.collection('messages');
  const notifications = db.collection('notifications');
  const meetings = db.collection('meetingbookings');
  const meetingTypes = db.collection('meetingtypes');

  const prevLeads = await leads.find({ businessId, tags: SEED_TAG }).project({ _id: 1 }).toArray();
  const prevLeadIds = prevLeads.map((l) => l._id);
  const prevContacts = await contacts.find({ businessId, tags: SEED_TAG }).project({ _id: 1 }).toArray();
  const prevContactIds = prevContacts.map((c) => c._id);
  const prevCompanies = await companies.find({ businessId, tags: SEED_TAG }).project({ _id: 1 }).toArray();
  const prevCompanyIds = prevCompanies.map((c) => c._id);
  const prevDeals = await deals.find({ businessId, tags: SEED_TAG }).project({ _id: 1 }).toArray();
  const prevDealIds = prevDeals.map((d) => d._id);

  const entityIds = [...prevLeadIds, ...prevContactIds, ...prevCompanyIds, ...prevDealIds];

  await Promise.all([
    deals.deleteMany({ businessId, tags: SEED_TAG }),
    contacts.deleteMany({ businessId, tags: SEED_TAG }),
    companies.deleteMany({ businessId, tags: SEED_TAG }),
    leads.deleteMany({ businessId, tags: SEED_TAG }),
    notes.deleteMany({ businessId, tags: SEED_TAG }),
    tasks.deleteMany({ businessId, tags: SEED_TAG }),
    comments.deleteMany({ businessId, tags: SEED_TAG }),
    notifications.deleteMany({ businessId, 'metadata.seed': true }),
    meetingTypes.deleteMany({ businessId, tags: SEED_TAG }),
  ]);

  if (prevLeadIds.length) {
    await activities.deleteMany({ businessId, leadId: { $in: prevLeadIds } });
    await messages.deleteMany({ businessId, leadId: { $in: prevLeadIds } });
    await conversations.deleteMany({ businessId, leadId: { $in: prevLeadIds } });
    await meetings.deleteMany({ businessId, leadId: { $in: prevLeadIds } });
  }
  if (entityIds.length) {
    await notes.deleteMany({ businessId, entityId: { $in: entityIds } });
    await comments.deleteMany({ businessId, entityId: { $in: entityIds } });
    await activities.deleteMany({ businessId, entityId: { $in: entityIds } });
  }

  // Also clear any leftover seed notes/tasks by tag-less metadata
  await notes.deleteMany({ businessId, 'metadata.seed': true });
  await tasks.deleteMany({ businessId, 'metadata.seed': true });
  await activities.deleteMany({ businessId, 'metadata.seed': true });

  console.log(`Cleared previous seed (leads: ${prevLeadIds.length}, contacts: ${prevContactIds.length}, companies: ${prevCompanyIds.length}, deals: ${prevDealIds.length})`);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const users = db.collection('users');
  const businesses = db.collection('businesses');
  const leadsCol = db.collection('leads');
  const dealsCol = db.collection('deals');
  const contactsCol = db.collection('contacts');
  const companiesCol = db.collection('companies');
  const notesCol = db.collection('crmnotes');
  const tasksCol = db.collection('tasks');
  const activitiesCol = db.collection('activities');
  const commentsCol = db.collection('crmcomments');
  const conversationsCol = db.collection('conversations');
  const messagesCol = db.collection('messages');
  const notificationsCol = db.collection('notifications');
  const meetingsCol = db.collection('meetingbookings');
  const meetingTypesCol = db.collection('meetingtypes');
  const pipelinesCol = db.collection('pipelines');

  const user = await users.findOne({ email: EMAIL });
  if (!user) {
    console.error(`User not found for email: ${EMAIL}`);
    process.exit(1);
  }

  let businessId = user.businessId;
  if (!businessId) {
    const biz = await businesses.findOne({ ownerId: user._id });
    businessId = biz?._id;
  }
  if (!businessId) {
    console.error(`No business linked to ${EMAIL}`);
    process.exit(1);
  }

  const business = await businesses.findOne({ _id: businessId });
  console.log(`Business: ${business?.name || businessId}`);
  console.log(`User: ${EMAIL}`);

  await clearSeed(db, businessId);

  let pipeline = await pipelinesCol.findOne({ businessId, isDefault: true, archived: { $ne: true } });
  if (!pipeline) {
    const now = new Date();
    const insert = await pipelinesCol.insertOne({
      businessId,
      name: 'Sales Pipeline',
      entityType: 'deal',
      isDefault: true,
      archived: false,
      stages: DEFAULT_PIPELINE_STAGES,
      createdAt: now,
      updatedAt: now,
    });
    pipeline = { _id: insert.insertedId };
    console.log('Created default pipeline');
  }

  const ownerId = user._id;
  const pipelineId = pipeline._id;
  const now = new Date();

  // --- Companies ---
  const companyDocs = [];
  for (let i = 0; i < COMPANY_COUNT; i++) {
    const name = pick(COMPANY_NAMES, i);
    const location = pick(LOCATIONS, i);
    const createdAt = dateMonthsAgo(i % 8, i % 10);
    companyDocs.push({
      _id: oid(),
      businessId,
      name,
      domain: domainFor(name),
      industry: pick(INDUSTRIES, i),
      employeeCount: pick(['1-10', '11-50', '51-200', '201-500', '501-1000'], i),
      annualRevenue: pick([500000, 1200000, 3500000, 8000000, 15000000], i),
      revenueCurrency: 'INR',
      website: `https://${domainFor(name)}`,
      phone: phoneFor(800 + i),
      email: `hello@${domainFor(name)}`,
      address: { ...location, street: pick(STREETS, i) },
      description: `${name} — demo company for CRM UI testing.`,
      ownerId,
      tags: [SEED_TAG, pick(INDUSTRIES, i).toLowerCase()],
      archived: false,
      deletedAt: null,
      createdBy: ownerId,
      updatedBy: ownerId,
      createdAt,
      updatedAt: createdAt,
    });
  }
  await companiesCol.insertMany(companyDocs);
  console.log(`Inserted ${companyDocs.length} companies`);

  // --- Leads + Contacts (1:1) ---
  const leadDocs = [];
  const contactDocs = [];

  for (let i = 0; i < LEAD_COUNT; i++) {
    const first = pick(FIRST_NAMES, i);
    const last = pick(LAST_NAMES, i * 3 + 1);
    const status = pick(LEAD_STATUSES, i);
    const monthOffset = i % 8;
    const receivedAt = dateMonthsAgo(monthOffset, i % 20);
    const location = { ...pick(LOCATIONS, i), street: pick(STREETS, i) };
    const priority = pick(PRIORITIES, i);
    const source = pick(SOURCES, i);
    const serviceInterest = pick(SERVICES, i);
    const amount = pick(DEAL_AMOUNTS, i + 2);
    const company = companyDocs[i % companyDocs.length];
    const leadId = oid();
    const contactId = oid();
    const email = emailFor(first, last, i + 1);
    const phone = phoneFor(i + 1);
    const name = `${first} ${last}`;

    const leadNotes = [
      {
        text: pick(NOTE_SNIPPETS, i),
        addedBy: ownerId,
        addedAt: new Date(receivedAt.getTime() + 3600000),
      },
      {
        text: pick(NOTE_SNIPPETS, i + 3),
        addedBy: ownerId,
        addedAt: new Date(receivedAt.getTime() + 86400000),
      },
    ];

    const lead = {
      _id: leadId,
      businessId,
      name,
      email,
      phone,
      whatsapp: phone,
      source,
      sourceDetails: 'Seed demo data',
      serviceInterest,
      message: `Demo enquiry for ${serviceInterest}`,
      status,
      priority,
      tags: [SEED_TAG, `month-${monthOffset}`, status],
      location,
      assignedTo: ownerId,
      ownerId,
      contactId,
      companyId: company._id,
      receivedAt,
      createdAt: receivedAt,
      updatedAt: now,
      archived: false,
      isRead: i % 3 !== 0,
      notes: leadNotes,
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      metadata: {
        seed: true,
        amount,
        dealAmount: amount,
        currency: 'INR',
      },
    };

    if (['won', 'converted'].includes(status)) {
      lead.convertedAt = new Date(receivedAt.getTime() + randInt(3, 20) * 86400000);
    }
    if (status === 'lost') {
      lead.lostAt = new Date(receivedAt.getTime() + randInt(2, 14) * 86400000);
      lead.metadata.lostReason = pick(LOST_REASONS, i);
    }
    if (!['new_lead', 'lost'].includes(status)) {
      lead.lastContactedAt = new Date(receivedAt.getTime() + randInt(1, 5) * 86400000);
    }
    if (['follow_up', 'demo_scheduled', 'quotation_sent', 'negotiation'].includes(status)) {
      const fu = new Date();
      fu.setDate(fu.getDate() + (i % 5) - 1);
      lead.nextFollowUpAt = fu;
    }

    const contact = {
      _id: contactId,
      businessId,
      type: i % 4 === 0 ? 'personal' : 'business',
      firstName: first,
      lastName: last,
      fullName: name,
      jobTitle: pick(JOB_TITLES, i),
      department: pick(['Sales', 'Marketing', 'Operations', 'IT', 'Leadership'], i),
      phones: [{ number: phone, label: 'mobile', primary: true }],
      emails: [{ address: email, label: 'work', primary: true }],
      addresses: [{ label: 'primary', ...location, primary: true }],
      socialProfiles: [
        { platform: 'linkedin', url: `https://linkedin.com/in/${first.toLowerCase()}${last.toLowerCase()}` },
      ],
      companyId: company._id,
      leadId,
      ownerId,
      tags: [SEED_TAG, source],
      source,
      archived: false,
      notes: pick(NOTE_SNIPPETS, i + 1),
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: receivedAt,
      updatedAt: receivedAt,
    };

    leadDocs.push(lead);
    contactDocs.push(contact);
  }

  await leadsCol.insertMany(leadDocs);
  await contactsCol.insertMany(contactDocs);
  console.log(`Inserted ${leadDocs.length} leads + ${contactDocs.length} contacts`);

  // --- Deals (linked to lead, contact, company) ---
  const dealDocs = [];
  for (let i = 0; i < DEAL_COUNT; i++) {
    const lead = leadDocs[i % leadDocs.length];
    const contact = contactDocs[i % contactDocs.length];
    const stage = pick(STAGES, i + 1);
    const monthOffset = (i + 2) % 8;
    const createdAt = dateMonthsAgo(monthOffset, i % 15);
    const amount = pick(DEAL_AMOUNTS, i);
    const probability =
      stage === 'won' ? 100 : stage === 'lost' ? 0 : STAGE_PROBABILITY[stage] ?? randInt(10, 90);
    const expectedCloseDate = new Date(createdAt);
    expectedCloseDate.setDate(expectedCloseDate.getDate() + randInt(7, 60));

    const doc = {
      _id: oid(),
      businessId,
      pipelineId,
      leadId: lead._id,
      contactId: contact._id,
      companyId: lead.companyId,
      title: `${lead.serviceInterest || 'Deal'} — ${lead.name}`,
      amount,
      currency: 'INR',
      probability,
      stage,
      expectedCloseDate,
      assignedTo: ownerId,
      ownerId,
      source: lead.source,
      tags: [SEED_TAG, stage],
      products: [
        {
          name: lead.serviceInterest || 'Service Package',
          quantity: 1,
          unitPrice: amount,
          discount: i % 5 === 0 ? 10 : 0,
        },
      ],
      archived: false,
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt,
      updatedAt: createdAt,
    };

    if (stage === 'won') {
      doc.wonAt = new Date(createdAt.getTime() + randInt(5, 40) * 86400000);
      doc.wonReason = pick(WON_REASONS, i);
      doc.probability = 100;
      await leadsCol.updateOne(
        { _id: lead._id },
        {
          $set: {
            status: i % 2 === 0 ? 'won' : 'converted',
            convertedAt: doc.wonAt,
            'metadata.amount': amount,
            'metadata.dealAmount': amount,
          },
        }
      );
    }
    if (stage === 'lost') {
      doc.lostAt = new Date(createdAt.getTime() + randInt(3, 25) * 86400000);
      doc.lostReason = pick(LOST_REASONS, i);
      doc.probability = 0;
    }

    dealDocs.push(doc);
  }
  await dealsCol.insertMany(dealDocs);
  console.log(`Inserted ${dealDocs.length} deals`);

  // --- CRM Notes (lead, contact, company, deal) ---
  const noteDocs = [];
  for (let i = 0; i < leadDocs.length; i++) {
    const lead = leadDocs[i];
    const contact = contactDocs[i];
    noteDocs.push({
      _id: oid(),
      businessId,
      entityType: 'lead',
      entityId: lead._id,
      content: pick(NOTE_SNIPPETS, i),
      contentType: 'plain',
      pinned: i % 7 === 0,
      mentions: [],
      versions: [],
      visibility: 'team',
      tags: [SEED_TAG],
      metadata: { seed: true },
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: lead.receivedAt,
      updatedAt: lead.receivedAt,
    });
    noteDocs.push({
      _id: oid(),
      businessId,
      entityType: 'contact',
      entityId: contact._id,
      content: `Contact note: ${pick(NOTE_SNIPPETS, i + 2)}`,
      contentType: 'plain',
      pinned: false,
      mentions: [],
      versions: [],
      visibility: 'team',
      tags: [SEED_TAG],
      metadata: { seed: true },
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: lead.receivedAt,
      updatedAt: lead.receivedAt,
    });
  }
  for (let i = 0; i < companyDocs.length; i++) {
    noteDocs.push({
      _id: oid(),
      businessId,
      entityType: 'company',
      entityId: companyDocs[i]._id,
      content: `Company account note for ${companyDocs[i].name}. Key account in ${companyDocs[i].industry}.`,
      contentType: 'plain',
      pinned: i % 5 === 0,
      mentions: [],
      versions: [],
      visibility: 'team',
      tags: [SEED_TAG],
      metadata: { seed: true },
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: companyDocs[i].createdAt,
      updatedAt: companyDocs[i].createdAt,
    });
  }
  for (let i = 0; i < dealDocs.length; i++) {
    noteDocs.push({
      _id: oid(),
      businessId,
      entityType: 'deal',
      entityId: dealDocs[i]._id,
      content: `Deal note: forecast ₹${dealDocs[i].amount.toLocaleString()} at ${dealDocs[i].probability}% (${dealDocs[i].stage}).`,
      contentType: 'plain',
      pinned: dealDocs[i].stage === 'negotiation',
      mentions: [],
      versions: [],
      visibility: 'team',
      tags: [SEED_TAG],
      metadata: { seed: true },
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: dealDocs[i].createdAt,
      updatedAt: dealDocs[i].createdAt,
    });
  }
  await notesCol.insertMany(noteDocs);
  console.log(`Inserted ${noteDocs.length} CRM notes`);

  // --- Comments ---
  const commentDocs = [];
  for (let i = 0; i < 40; i++) {
    const lead = leadDocs[i % leadDocs.length];
    const deal = dealDocs[i % dealDocs.length];
    const entityType = i % 2 === 0 ? 'lead' : 'deal';
    const entityId = entityType === 'lead' ? lead._id : deal._id;
    commentDocs.push({
      _id: oid(),
      businessId,
      entityType,
      entityId,
      content: pick(
        [
          'Please prioritize this account.',
          'Shared proposal over email.',
          'Waiting on finance approval.',
          'Good fit for upsell next quarter.',
          'Assign a technical specialist for demo.',
        ],
        i
      ),
      mentions: [],
      parentId: null,
      tags: [SEED_TAG],
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: dateMonthsAgo(i % 4, i % 8),
      updatedAt: dateMonthsAgo(i % 4, i % 8),
    });
  }
  await commentsCol.insertMany(commentDocs);
  console.log(`Inserted ${commentDocs.length} comments`);

  // --- Tasks ---
  const taskDocs = [];
  for (let i = 0; i < 80; i++) {
    const lead = leadDocs[i % leadDocs.length];
    const contact = contactDocs[i % contactDocs.length];
    const deal = dealDocs[i % dealDocs.length];
    const status = pick(TASK_STATUSES, i);
    const type = pick(TASK_TYPES, i);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (i % 10) - 3);
    dueDate.setHours(randInt(10, 17), 0, 0, 0);
    const createdAt = dateMonthsAgo(i % 3, i % 6);

    const task = {
      _id: oid(),
      businessId,
      leadId: lead._id,
      contactId: contact._id,
      companyId: lead.companyId,
      dealId: i < DEAL_COUNT ? deal._id : undefined,
      type,
      title: `${type.replace(/_/g, ' ')} — ${lead.name}`,
      description: `Follow up on ${lead.serviceInterest} for ${lead.name}`,
      dueDate,
      priority: pick(PRIORITIES, i),
      assignedTo: ownerId,
      status,
      tags: [SEED_TAG],
      metadata: { seed: true },
      archived: false,
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt,
      updatedAt: createdAt,
    };
    if (status === 'completed') {
      task.completedAt = new Date(dueDate.getTime() - 3600000);
      task.completedBy = ownerId;
    }
    taskDocs.push(task);
  }
  await tasksCol.insertMany(taskDocs);
  console.log(`Inserted ${taskDocs.length} tasks`);

  // --- Activities / timeline ---
  const activityDocs = [];
  for (let i = 0; i < leadDocs.length; i++) {
    const lead = leadDocs[i];
    activityDocs.push({
      businessId,
      entityType: 'lead',
      entityId: lead._id,
      leadId: lead._id,
      type: 'lead_created',
      description: `Lead created: ${lead.name}`,
      metadata: { seed: true, source: lead.source },
      performedBy: ownerId,
      performedAt: lead.receivedAt,
    });
    activityDocs.push({
      businessId,
      entityType: 'lead',
      entityId: lead._id,
      leadId: lead._id,
      type: 'note_added',
      description: 'Note added to lead',
      metadata: { seed: true },
      performedBy: ownerId,
      performedAt: new Date(lead.receivedAt.getTime() + 7200000),
    });
    activityDocs.push({
      businessId,
      entityType: 'lead',
      entityId: lead._id,
      leadId: lead._id,
      type: 'status_changed',
      description: `Stage set to ${lead.status}`,
      metadata: { seed: true, newValue: lead.status },
      performedBy: ownerId,
      performedAt: new Date(lead.receivedAt.getTime() + 86400000),
    });
    if (i % 2 === 0) {
      activityDocs.push({
        businessId,
        entityType: 'lead',
        entityId: lead._id,
        leadId: lead._id,
        type: pick(['contacted_call', 'contacted_whatsapp', 'contacted_email', 'whatsapp_sent', 'email_sent'], i),
        description: `Contacted ${lead.name}`,
        metadata: { seed: true },
        performedBy: ownerId,
        performedAt: new Date(lead.receivedAt.getTime() + 2 * 86400000),
      });
    }
  }
  for (let i = 0; i < contactDocs.length; i++) {
    const contact = contactDocs[i];
    activityDocs.push({
      businessId,
      entityType: 'contact',
      entityId: contact._id,
      leadId: contact.leadId,
      type: 'contact_created',
      description: `Contact created: ${contact.fullName}`,
      metadata: { seed: true },
      performedBy: ownerId,
      performedAt: contact.createdAt,
    });
  }
  for (let i = 0; i < dealDocs.length; i++) {
    const deal = dealDocs[i];
    activityDocs.push({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_created',
      description: `Deal created: ${deal.title}`,
      metadata: { seed: true, amount: deal.amount },
      performedBy: ownerId,
      performedAt: deal.createdAt,
    });
    if (deal.stage === 'won') {
      activityDocs.push({
        businessId,
        entityType: 'deal',
        entityId: deal._id,
        leadId: deal.leadId,
        type: 'deal_won',
        description: `Deal won: ${deal.title}`,
        metadata: { seed: true, amount: deal.amount },
        performedBy: ownerId,
        performedAt: deal.wonAt || deal.createdAt,
      });
    }
    if (deal.stage === 'lost') {
      activityDocs.push({
        businessId,
        entityType: 'deal',
        entityId: deal._id,
        leadId: deal.leadId,
        type: 'deal_lost',
        description: `Deal lost: ${deal.title}`,
        metadata: { seed: true, reason: deal.lostReason },
        performedBy: ownerId,
        performedAt: deal.lostAt || deal.createdAt,
      });
    }
  }
  await activitiesCol.insertMany(activityDocs);
  console.log(`Inserted ${activityDocs.length} activities`);

  // --- Meeting type + bookings ---
  const meetingTypeId = oid();
  await meetingTypesCol.insertOne({
    _id: meetingTypeId,
    businessId,
    title: 'Product Demo',
    description: 'Seed demo meeting type',
    category: 'demo_call',
    durationMinutes: 30,
    bookingSlug: `seed-demo-${String(businessId).slice(-6)}`,
    status: 'published',
    ownerId,
    hostIds: [ownerId],
    assignmentMode: 'fixed',
    tags: [SEED_TAG],
    createdAt: now,
    updatedAt: now,
  });

  const meetingDocs = [];
  for (let i = 0; i < 25; i++) {
    const lead = leadDocs[i];
    const start = new Date();
    start.setDate(start.getDate() + (i % 14) - 3);
    start.setHours(10 + (i % 6), i % 2 === 0 ? 0 : 30, 0, 0);
    const end = new Date(start.getTime() + 30 * 60000);
    const status = pick(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], i);
    const meeting = {
      _id: oid(),
      businessId,
      meetingTypeId,
      leadId: lead._id,
      assignedTo: ownerId,
      guest: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        whatsapp: lead.phone,
        company: companyDocs[i % companyDocs.length].name,
        notes: 'Seed meeting',
      },
      startTime: start,
      endTime: end,
      timezone: 'Asia/Kolkata',
      source: 'manual',
      status,
      meetingLink: `https://meet.example-demo.test/${randomUUID().slice(0, 8)}`,
      revenueValue: pick(DEAL_AMOUNTS, i) / 2,
      notes: `Demo with ${lead.name}`,
      createdAt: start,
      updatedAt: start,
    };
    if (status === 'completed') meeting.completedAt = end;
    if (status === 'cancelled') meeting.cancelledAt = start;
    if (status === 'no_show') meeting.noShowAt = start;
    meetingDocs.push(meeting);

    activityDocs.push({
      businessId,
      entityType: 'lead',
      entityId: lead._id,
      leadId: lead._id,
      type: 'meeting_booked',
      description: `Meeting ${status} with ${lead.name}`,
      metadata: { seed: true },
      performedBy: ownerId,
      performedAt: start,
    });
  }
  await meetingsCol.insertMany(meetingDocs);
  // extra meeting activities
  await activitiesCol.insertMany(
    meetingDocs.map((m) => ({
      businessId,
      entityType: 'lead',
      entityId: m.leadId,
      leadId: m.leadId,
      type: 'meeting_booked',
      description: `Meeting booked for ${m.guest.name}`,
      metadata: { seed: true, status: m.status },
      performedBy: ownerId,
      performedAt: m.startTime,
    }))
  );
  console.log(`Inserted ${meetingDocs.length} meetings`);

  // --- Conversations + messages (chat/inbox) ---
  const conversationDocs = [];
  const messageDocs = [];
  for (let i = 0; i < 35; i++) {
    const lead = leadDocs[i];
    const contact = contactDocs[i];
    const channel = pick(['whatsapp', 'email', 'instagram'], i);
    const lastAt = dateMonthsAgo(i % 2, i % 5);
    const conversationId = oid();
    const preview = pick(CHAT_INCOMING, i);

    conversationDocs.push({
      _id: conversationId,
      businessId,
      channel,
      leadId: lead._id,
      contactId: contact._id,
      companyId: lead.companyId,
      dealId: dealDocs[i % dealDocs.length]?._id,
      assignedTo: ownerId,
      participantId: channel === 'email' ? lead.email : lead.phone,
      participantName: lead.name,
      participantEmail: lead.email,
      participantPhone: lead.phone,
      status: i % 8 === 0 ? 'closed' : 'open',
      inboxStatus: i % 3 === 0 ? 'unread' : 'read',
      unreadCount: i % 3 === 0 ? randInt(1, 4) : 0,
      lastMessageAt: lastAt,
      lastMessagePreview: preview,
      lastMessageDirection: 'incoming',
      labels: [],
      isPinned: i % 9 === 0,
      isFavorite: i % 11 === 0,
      isArchived: false,
      isSpam: false,
      isDeleted: false,
      assignmentHistory: [],
      createdBy: ownerId,
      updatedBy: ownerId,
      deletedAt: null,
      createdAt: lastAt,
      updatedAt: lastAt,
    });

    for (let m = 0; m < 4; m++) {
      const incoming = m % 2 === 0;
      const ts = new Date(lastAt.getTime() - (3 - m) * 3600000);
      messageDocs.push({
        _id: oid(),
        businessId,
        leadId: lead._id,
        conversationId,
        channel,
        contactId: contact._id,
        companyId: lead.companyId,
        messageId: `seed-${conversationId}-${m}-${randomUUID()}`,
        direction: incoming ? 'incoming' : 'outgoing',
        type: channel === 'email' ? 'email' : 'text',
        content: {
          body: incoming ? pick(CHAT_INCOMING, i + m) : pick(CHAT_OUTGOING, i + m),
        },
        subject: channel === 'email' ? `Re: ${lead.serviceInterest}` : undefined,
        timestamp: ts,
        status: incoming ? 'received' : 'read',
        folder: incoming ? 'inbox' : 'sent',
        isDeleted: false,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  }
  await conversationsCol.insertMany(conversationDocs);
  await messagesCol.insertMany(messageDocs);
  console.log(`Inserted ${conversationDocs.length} conversations + ${messageDocs.length} messages`);

  // --- Notifications ---
  const notificationDocs = [];
  for (let i = 0; i < 20; i++) {
    const lead = leadDocs[i];
    notificationDocs.push({
      _id: oid(),
      businessId,
      userId: ownerId,
      type: pick(['new_lead', 'task_reminder', 'whatsapp_message', 'email_message', 'system'], i),
      title: pick(
        ['New lead assigned', 'Task due soon', 'New WhatsApp message', 'Email reply', 'Pipeline update'],
        i
      ),
      message: `${lead.name} — ${pick(NOTE_SNIPPETS, i)}`,
      link: `/automation/leads/${lead._id}`,
      isRead: i % 3 !== 0,
      metadata: { seed: true, leadId: String(lead._id) },
      createdAt: dateMonthsAgo(0, i % 7),
      updatedAt: dateMonthsAgo(0, i % 7),
    });
  }
  await notificationsCol.insertMany(notificationDocs);
  console.log(`Inserted ${notificationDocs.length} notifications`);

  // Summary
  let wonRevenue = 0;
  let forecast = 0;
  for (const d of dealDocs) {
    if (d.stage === 'won') wonRevenue += d.amount;
    else if (d.stage !== 'lost') forecast += Math.round(d.amount * (d.probability / 100));
  }

  console.log('\n--- Full CRM seed summary ---');
  console.log({
    companies: companyDocs.length,
    leads: leadDocs.length,
    contacts: contactDocs.length,
    deals: dealDocs.length,
    notes: noteDocs.length,
    comments: commentDocs.length,
    tasks: taskDocs.length,
    activities: activityDocs.length + meetingDocs.length,
    meetings: meetingDocs.length,
    conversations: conversationDocs.length,
    messages: messageDocs.length,
    notifications: notificationDocs.length,
    wonRevenueINR: wonRevenue,
    forecastINR: forecast,
    countries: [...new Set(leadDocs.map((l) => l.location.country))],
  });
  console.log('Refresh /automation, /automation/leads, /automation/deals, /automation/contacts, /automation/companies, /automation/tasks, /automation/chat, /automation/meetings');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
