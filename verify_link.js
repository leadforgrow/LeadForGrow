require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userId = '6967fea3c951c77f3c31398f';
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    console.log('User:', JSON.stringify(user, null, 2));
    
    if (user && user.businessId) {
      const business = await db.collection('businesses').findOne({ _id: user.businessId });
      console.log('Business:', JSON.stringify(business, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verify();
