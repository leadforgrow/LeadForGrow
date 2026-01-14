require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debugUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- USERS ---');
    const users = await db.collection('users').find().toArray();
    users.forEach(u => {
      console.log(`User ID: ${u._id}`);
      console.log(`Email: ${u.email}`);
      console.log(`BusinessId: ${u.businessId}`);
      console.log(`Role: ${u.role}`);
      console.log('---');
    });

    console.log('\n--- BUSINESSES ---');
    const businesses = await db.collection('businesses').find().toArray();
    businesses.forEach(b => {
      console.log(`Business ID: ${b._id}`);
      console.log(`Name: ${b.name}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugUsers();
