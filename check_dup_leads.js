require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkDuplicates() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- SEARCHING FOR singhriya33690@gmail.com ---');
    const leads = await db.collection('leads').find({ email: 'singhriya33690@gmail.com' }).toArray();
    for (const l of leads) {
      const biz = await db.collection('businesses').findOne({ _id: l.businessId });
      console.log(`Lead ID: ${l._id}`);
      console.log(`  Name: ${l.name}`);
      console.log(`  Biz: ${biz ? biz.businessName : 'MISSING'} (${l.businessId})`);
      console.log(`  Source: ${l.source}`);
      console.log(`  ReceivedAt: ${l.receivedAt}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDuplicates();
