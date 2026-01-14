require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLatestLead() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- LATEST LEAD ---');
    const lead = await db.collection('leads').find().sort({ receivedAt: -1 }).limit(1).toArray();
    if (lead.length > 0) {
      const l = lead[0];
      const biz = await db.collection('businesses').findOne({ _id: l.businessId });
      console.log(`LID: ${l._id} | BID: ${l.businessId} | Email: ${l.email} | S: ${l.source}`);
      console.log(`Biz Name: ${biz ? biz.businessName : 'MISSING'}`);
      console.log(`Full Lead: ${JSON.stringify(l, null, 2)}`);
    } else {
      console.log('No leads found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkLatestLead();
