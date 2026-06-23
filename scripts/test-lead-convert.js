/**
 * Manual conversion smoke test — run: node scripts/test-lead-convert.js <leadId>
 */
import { dbConnect } from '../lib/mongodb.js';
import { convertLead } from '../lib/crm/conversion.js';
import Lead from '../models/automation/Lead.js';
import Deal from '../models/automation/Deal.js';
import Contact from '../models/automation/Contact.js';

const leadId = process.argv[2];
if (!leadId) {
  console.error('Usage: node scripts/test-lead-convert.js <leadId>');
  process.exit(1);
}

await dbConnect();
const lead = await Lead.findById(leadId);
if (!lead) {
  console.error('Lead not found:', leadId);
  process.exit(1);
}

if (lead.status === 'converted') {
  console.log('Lead already converted. contactId:', lead.contactId, 'companyId:', lead.companyId);
  const deal = await Deal.findOne({ leadId: lead._id });
  console.log('Linked deal:', deal?._id, deal?.title);
  process.exit(0);
}

const userId = lead.assignedTo || lead.ownerId;
console.log('Converting lead:', lead.name, 'businessId:', lead.businessId);

const result = await convertLead(lead.businessId, lead._id, userId, {
  dealTitle: `Test Deal — ${lead.name}`,
  dealAmount: 10000,
  dealStage: 'qualified',
  assignedTo: userId,
  createDeal: true,
});

console.log('SUCCESS');
console.log('  lead status:', result.lead.status);
console.log('  contact:', result.contact?._id, result.contact?.fullName || result.contact?.firstName);
console.log('  company:', result.company?._id, result.company?.name);
console.log('  deal:', result.deal?._id, result.deal?.title, result.deal?.stage);
console.log('  pipeline:', result.pipeline?._id, result.pipeline?.name);

const verifyContact = await Contact.findById(result.contact._id);
const verifyDeal = await Deal.findById(result.deal._id);
console.log('Verified links — deal.leadId:', String(verifyDeal.leadId), 'deal.contactId:', String(verifyDeal.contactId));

process.exit(0);
