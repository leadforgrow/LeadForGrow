require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function findAllLeads() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    console.log('');
    
    // List ALL databases and search for leads collections
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    console.log('=== SEARCHING ALL DATABASES FOR LEADS ===\n');
    
    for (const dbInfo of databases) {
      const db = mongoose.connection.client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      const hasLeads = collections.some(c => c.name === 'leads');
      
      if (hasLeads) {
        const count = await db.collection('leads').countDocuments();
        console.log(`📁 Database: ${dbInfo.name}`);
        console.log(`   Leads count: ${count}`);
        
        if (count > 0) {
          const allLeads = await db.collection('leads').find().toArray();
          allLeads.forEach((lead, idx) => {
            console.log(`   ${idx + 1}. ${lead.name} - Phone: ${lead.phone} - ${new Date(lead.receivedAt).toLocaleString()}`);
          });
        }
        console.log('');
      }
    }
    
    // Also check activities to see which leadIds they reference
    const activities = await mongoose.connection.db.collection('activities')
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
      
    console.log('=== RECENT ACTIVITIES (Last 10) ===');
    const uniqueLeadIds = new Set();
    activities.forEach((act, idx) => {
      console.log(`${idx + 1}. ${act.type} - LeadID: ${act.leadId}`);
      uniqueLeadIds.add(act.leadId.toString());
    });
    
    console.log(`\n📊 Unique Lead IDs in activities: ${uniqueLeadIds.size}`);
    console.log('Lead IDs:', Array.from(uniqueLeadIds));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

findAllLeads();
