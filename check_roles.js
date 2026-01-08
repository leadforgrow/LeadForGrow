require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find({ email: /riyasingh22|yashi123|moodli.track/ }).toArray();
  let out = "Roles for Team Members:\n";
  for (const u of users) {
    out += `${u.email} : Role=${u.role} | ID=${u._id}\n`;
  }
  
  fs.writeFileSync('roles_debug.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
