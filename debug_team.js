require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function debug() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const targetUser = await db.collection('users').findOne({ email: 'riyasingh22@gmail.com' });
  if (!targetUser) {
    console.log('User not found');
    await mongoose.disconnect();
    return;
  }
  
  const bizId = targetUser.businessId;
  console.log(`Target User BizId: ${bizId}`);
  
  const biz = await db.collection('businesses').findOne({ _id: bizId });
  console.log(`Business Found: ${biz ? biz.name : 'NO'}`);
  console.log(`Business Strategy: ${biz?.settings?.assignmentStrategy}`);
  
  const team = await db.collection('users').find({ businessId: bizId }).toArray();
  console.log(`Team members found for this bizId: ${team.length}`);
  team.forEach(u => console.log(` - ${u.email} (ID: ${u._id})`));
  
  await mongoose.disconnect();
}
debug();
