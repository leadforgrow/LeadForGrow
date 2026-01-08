require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLead() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');
    
    const db = mongoose.connection.db;
    const leadsCollection = db.collection('leads');
    
    // Check for the specific lead ID from the logs
    const leadId = '695e96e0cf9a4d5536aaaa90';
    console.log(`Searching for lead ID: ${leadId}`);
    const specificLead = await leadsCollection.findOne({ _id: new mongoose.Types.ObjectId(leadId) });
    
    if (specificLead) {
      console.log('\n✅ LEAD FOUND:');
      console.log(JSON.stringify(specificLead, null, 2));
    } else {
      console.log('\n❌ Lead NOT found with that ID');
    }
    
    // Count total leads
    const totalLeads = await leadsCollection.countDocuments();
    console.log(`\n📊 Total leads in collection: ${totalLeads}`);
    
    // Get the most recent lead
    const recentLeads = await leadsCollection.find().sort({ receivedAt: -1 }).limit(3).toArray();
    console.log('\n📋 Most recent 3 leads:');
    recentLeads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.name} (${lead._id}) - ${lead.phone} - ${new Date(lead.receivedAt).toLocaleString()}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLead();
