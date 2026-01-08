require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debugUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const businesses = await db.collection('businesses').find().toArray();
    console.log('--- BUSINESSES ---');
    businesses.forEach(b => {
      console.log(`ID: ${b._id}, Owner: ${b.ownerId}, Name: ${b.name}`);
    });

    const users = await db.collection('users').find().toArray();
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Email: ${u.email}, BusinessId: ${u.businessId}, Role: ${u.role}, LastActivity: ${u.lastActivityAt}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugUsers();
