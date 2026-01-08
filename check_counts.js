require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const bizId = new mongoose.Types.ObjectId('695e9532cf9a4d5536aaaa16');
  const biz = await db.collection('businesses').findOne({ _id: bizId });
  
  const actualCount = await db.collection('leads').countDocuments({ businessId: bizId });
  
  let out = `Business: ${biz.businessName}\n`;
  out += `Lead Count in Biz Record: ${biz.usage?.leadsThisMonth}\n`;
  out += `Actual Lead Documents: ${actualCount}\n`;
  
  fs.writeFileSync('count_comparison.txt', out);
  console.log(out);
  await mongoose.disconnect();
}
check();
