require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLeadIds() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get all unique leadIds from activities
    const activities = await db.collection('activities').find().toArray();
    const uniqueLeadIds = [...new Set(activities.map(a => a.leadId.toString()))];
    
    console.log(`\n📊 Found ${uniqueLeadIds.length} unique Lead IDs in activities`);
    console.log('Lead IDs:', uniqueLeadIds.slice(0, 5), '...\n');
    
    // Check if these leads exist
    console.log('=== CHECKING IF LEADS EXIST ===\n');
    for (const leadIdStr of uniqueLeadIds.slice(0, 10)) {
      const leadId = new mongoose.Types.ObjectId(leadIdStr);
      const lead = await db.collection('leads').findOne({ _id: leadId });
      
      if (lead) {
        console.log(`✅ ${leadIdStr}: EXISTS - ${lead.name} (${lead.phone})`);
      } else {
        console.log(`❌ ${leadIdStr}: NOT FOUND IN LEADS COLLECTION`);
      }
    }
    
    // Count total leads
    const totalLeads = await db.collection('leads').countDocuments();
    console.log(`\n📊 Total leads in collection: ${totalLeads}`);
    console.log(`📊 Total unique leadIds in activities: ${uniqueLeadIds.length}`);
    console.log(`\n⚠️  MISSING LEADS: ${uniqueLeadIds.length - totalLeads}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeadIds();
