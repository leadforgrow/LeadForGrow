require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkActivities() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const bizIdStr = '6967fea3c951c77f3c313991';
    const bizId = new mongoose.Types.ObjectId(bizIdStr);
    
    console.log('--- LATEST AUTOMATION ACTIVITIES ---');
    const activities = await db.collection('activities')
      .find({ businessId: bizId, type: 'automation_executed' })
      .sort({ performedAt: -1 })
      .limit(2)
      .toArray();
    
    activities.forEach(a => {
      console.log(`[${a.performedAt.toISOString()}] ${a.description}`);
      console.log(`Metadata: ${JSON.stringify(a.metadata, null, 2)}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkActivities();
