require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function listDatabases() {
  try {
    await mongoose.connect(MONGODB_URI);
    const admin = mongoose.connection.db.admin();
    const result = await admin.listDatabases();
    console.log('Databases:', result.databases.map(db => db.name));
    
    for (const dbInfo of result.databases) {
        const db = mongoose.connection.useDb(dbInfo.name);
        const users = await db.collection('users').countDocuments();
        const businesses = await db.collection('businesses').countDocuments();
        console.log(`DB: ${dbInfo.name} -> Users: ${users}, Businesses: ${businesses}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listDatabases();
