require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function verifyIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userId = '695fb0c39bf5eae4e35517eb';
    const businessId = '695fb0c49bf5eae4e35517ed';
    
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    console.log('User status:', user ? 'FOUND' : 'NOT FOUND');
    if (user) console.log('User:', JSON.stringify(user, null, 2));
    
    const business = await db.collection('businesses').findOne({ _id: new mongoose.Types.ObjectId(businessId) });
    console.log('Business status:', business ? 'FOUND' : 'NOT FOUND');
    if (business) console.log('Business:', JSON.stringify(business, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verifyIds();
