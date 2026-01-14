require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkBiz() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const biz = await db.collection('businesses').findOne({ _id: new mongoose.Types.ObjectId('695fb0c49bf5eae4e35517ed') });
    console.log('Business 695fb0c49bf5eae4e35517ed:');
    console.log(JSON.stringify(biz.integrationCredentials, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkBiz();
