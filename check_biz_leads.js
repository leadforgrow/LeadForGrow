require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const distinctBizIds = await db.collection('leads').distinct('businessId');
  let out = `Unique Business IDs in Leads Collection: ${distinctBizIds.length}\n`;
  for (const id of distinctBizIds) {
    const count = await db.collection('leads').countDocuments({ businessId: id });
    out += `- BizID: ${id} | Count: ${count}\n`;
  }
  
  fs.writeFileSync('biz_leads_debug.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
