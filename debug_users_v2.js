require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debug() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const bizs = await db.collection('businesses').find().toArray();
  const users = await db.collection('users').find().toArray();
  
  console.log('BIZ LIST:');
  bizs.forEach(b => console.log(`  BIZ_ID: ${b._id} | OWNER: ${b.ownerId} | STRAT: ${b.settings?.assignmentStrategy}`));
  
  console.log('\nUSER LIST:');
  users.forEach(u => console.log(`  USER_ID: ${u._id} | BIZ_ID: ${u.businessId} | EMAIL: ${u.email} | ROLE: ${u.role}`));
  
  await mongoose.disconnect();
}
debug();
