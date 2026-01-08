require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  console.log("Database Name:", db.databaseName);
  
  const leads = await db.collection('leads').find({}).sort({ receivedAt: -1 }).limit(10).toArray();
  let out = "Last 10 Leads in Database:\n";
  
  for (const lead of leads) {
    out += `ID: ${lead._id} | Name: ${lead.name} | Phone: ${lead.phone} | email: ${lead.email} | ReceivedAt: ${lead.receivedAt}\n`;
  }
  
  fs.writeFileSync('last_leads_debug.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
