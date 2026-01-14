require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debugDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- USERS ---');
    const users = await db.collection('users').find().toArray();
    for (const u of users) {
        console.log(`User: ${u.email} (${u._id}) -> BusinessId: ${u.businessId}`);
    }

    console.log('\n--- BUSINESSES ---');
    const businesses = await db.collection('businesses').find().toArray();
    for (const b of businesses) {
        console.log(`Business: ${b.businessName} (${b._id}) -> Owner: ${b.ownerId}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugDB();
