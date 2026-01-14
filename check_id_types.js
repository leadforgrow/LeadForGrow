require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkIdTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userId = '695fb0c39bf5eae4e35517eb';
    
    const user = await db.collection('users').findOne({ _id: userId });
    console.log('User found as string ID:', user ? 'YES' : 'NO');
    
    const userOid = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    console.log('User found as ObjectId:', userOid ? 'YES' : 'NO');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkIdTypes();
