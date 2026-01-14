require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkRuleSchema() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- RULES IN DB ---');
    const rules = await db.collection('automationrules').find().toArray();
    rules.forEach(r => {
      console.log(`Rule: ${r.name}`);
      console.log(`  BizId: ${r.businessId} (${typeof r.businessId})`);
      console.log(`  Triggers: ${JSON.stringify(r.triggers)}`);
      console.log(`  Enabled: ${r.enabled}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkRuleSchema();
