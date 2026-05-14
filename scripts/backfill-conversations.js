import { dbConnect } from './lib/mongodb';
import Lead from './models/automation/Lead';
import Message from './models/automation/Message';
import WhatsAppConversation from './models/automation/WhatsAppConversation';

async function backfillConversations() {
  try {
    await dbConnect();
    console.log('Starting backfill of WhatsApp conversations...');

    // 1. Find all leads that have at least one WhatsApp message
    const leadsWithMessages = await Message.distinct('leadId');
    console.log(`Found ${leadsWithMessages.length} leads with message history.`);

    let count = 0;
    for (const leadId of leadsWithMessages) {
      // Get the last message for this lead
      const lastMessage = await Message.findOne({ leadId }).sort({ timestamp: -1 });
      const lead = await Lead.findById(leadId);

      if (!lead || !lastMessage) continue;

      // Upsert conversation record
      await WhatsAppConversation.findOneAndUpdate(
        { businessId: lead.businessId, leadId: lead._id },
        {
          $set: {
            lastMessageAt: lastMessage.timestamp,
            lastMessagePreview: lastMessage.content?.body?.substring(0, 100),
            lastMessageDirection: lastMessage.direction,
            status: 'read' // Default to read for historical messages
          },
          $setOnInsert: {
            unreadCount: 0
          }
        },
        { upsert: true }
      );
      count++;
    }

    console.log(`Successfully backfilled ${count} conversations.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

backfillConversations();
