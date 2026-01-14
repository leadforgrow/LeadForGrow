require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function listCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in test database:');
    collections.forEach(c => console.log(`- ${c.name}`));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listCollections();
