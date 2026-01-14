require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debugDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userCount = await db.collection('users').countDocuments();
    const businessCount = await db.collection('businesses').countDocuments();
    
    console.log(`User count: ${userCount}`);
    console.log(`Business count: ${businessCount}`);
    
    const users = await db.collection('users').find().toArray();
    for (const u of users) {
        const bus = await db.collection('businesses').findOne({ _id: u.businessId });
        console.log(`User: ${u.email} (${u._id}) -> Business: ${u.businessId} [${bus ? 'FOUND' : 'MISSING'}]`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugDB();
