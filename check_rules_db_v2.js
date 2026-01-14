require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkRuleSchema() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const rules = await db.collection('automationrules').find().toArray();
    for (const r of rules) {
      const isObjectId = r.businessId instanceof mongoose.Types.ObjectId;
      console.log(`Rule: ${r.name} | BizId: ${r.businessId} | IsObjectId: ${isObjectId} | Triggers: ${JSON.stringify(r.triggers)}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkRuleSchema();
