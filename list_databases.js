require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  
  let out = "Databases on Cluster:\n";
  for (const db of dbs.databases) {
    out += `- ${db.name} (${db.sizeOnDisk} bytes)\n`;
  }
  
  fs.writeFileSync('databases_debug.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
