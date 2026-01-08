require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const activities = await db.collection('activities').find({ type: 're-engagement' }).toArray();
  let out = `Re-engagement Activities (${activities.length}):\n`;
  
  for (const act of activities) {
    out += `Time: ${act.createdAt} | LeadID: ${act.leadId} | Description: ${act.description}\n`;
  }
  
  fs.writeFileSync('reengagement_debug.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
