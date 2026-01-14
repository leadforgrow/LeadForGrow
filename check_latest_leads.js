require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLeads() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- RECENT LEADS ---');
    const leads = await db.collection('leads').find().sort({ receivedAt: -1 }).limit(5).toArray();
    for (const l of leads) {
      const biz = await db.collection('businesses').findOne({ _id: l.businessId });
      console.log(`Lead: ${l.name} (${l.email}) | Biz: ${biz ? biz.businessName : 'MISSING'} (${l.businessId}) | Source: ${l.source}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkLeads();
