/**
 * Ensure compound indexes for production performance.
 * Run: node scripts/ensure-indexes.js
 */
import { dbConnect } from '../lib/mongodb.js';
import Lead from '../models/automation/Lead.js';
import Message from '../models/automation/Message.js';
import WhatsAppConversation from '../models/automation/WhatsAppConversation.js';
import Activity from '../models/automation/Activity.js';
import Task from '../models/automation/Task.js';
import MeetingType from '../models/meetings/MeetingType.js';
import MeetingBooking from '../models/meetings/MeetingBooking.js';
import MeetingReminder from '../models/meetings/MeetingReminder.js';

async function main() {
  await dbConnect();

  await Lead.collection.createIndex({ businessId: 1, archived: 1, receivedAt: -1 });
  await Lead.collection.createIndex({ businessId: 1, status: 1, assignedTo: 1 });
  await Lead.collection.createIndex({ businessId: 1, phone: 1 });
  await Lead.collection.createIndex({ businessId: 1, email: 1 });

  await Message.collection.createIndex({ businessId: 1, leadId: 1, timestamp: -1 });
  await WhatsAppConversation.collection.createIndex({ businessId: 1, status: 1, lastMessageAt: -1 });
  await WhatsAppConversation.collection.createIndex({ businessId: 1, leadId: 1 }, { unique: true });

  await Activity.collection.createIndex({ businessId: 1, performedAt: -1 });
  await Activity.collection.createIndex({ leadId: 1, performedAt: -1 });

  await Task.collection.createIndex({ businessId: 1, status: 1, dueDate: 1 });
  await Task.collection.createIndex({ businessId: 1, assignedTo: 1, status: 1 });

  await MeetingType.collection.createIndex({ businessId: 1, bookingSlug: 1 }, { unique: true });
  await MeetingBooking.collection.createIndex({ businessId: 1, startTime: 1 });
  await MeetingReminder.collection.createIndex({ status: 1, scheduledFor: 1 });

  console.log('Indexes ensured successfully');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
