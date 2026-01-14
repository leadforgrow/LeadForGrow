require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLeads() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- RECENT LEADS (TOP 10) ---');
    const leads = await db.collection('leads').find().sort({ receivedAt: -1 }).limit(10).toArray();
    for (const l of leads) {
      console.log(`LID: ${l._id} | BID: ${l.businessId} | Email: ${l.email} | Source: ${l.source}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkLeads();
