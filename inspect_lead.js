require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function inspectLead() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const lead = await db.collection('leads').findOne({ email: 'singhriya33690@gmail.com' }, { sort: { receivedAt: -1 } });
    console.log('Lead Details:', JSON.stringify(lead, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspectLead();
