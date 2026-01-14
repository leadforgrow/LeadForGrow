require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkDuplicates() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- ALL LEADS for singhriya33690@gmail.com ---');
    const leads = await db.collection('leads').find({ email: 'singhriya33690@gmail.com' }).toArray();
    leads.forEach(l => {
        console.log(`LID: ${l._id} | BID: ${l.businessId} | S: ${l.source} | R: ${l.receivedAt}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDuplicates();
