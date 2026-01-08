require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const leads = await db.collection('leads').find({}).toArray();
  let out = `All Leads in Database (${leads.length}):\n\n`;
  
  for (const lead of leads) {
    out += `ID: ${lead._id}\n`;
    out += `Name: ${lead.name}\n`;
    out += `Phone: ${lead.phone}\n`;
    out += `Email: ${lead.email}\n`;
    out += `BusinessId: ${lead.businessId}\n`;
    out += `ReceivedAt: ${lead.receivedAt}\n`;
    out += `-----------------------------------\n`;
  }
  
  fs.writeFileSync('all_leads_dump.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
