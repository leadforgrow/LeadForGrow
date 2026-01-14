require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkRules() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const bizIds = [
        new mongoose.Types.ObjectId('695fb0c49bf5eae4e35517ed'),
        new mongoose.Types.ObjectId('6967fea3c951c77f3c313991')
    ];
    
    for (const bizId of bizIds) {
        console.log(`--- RULES FOR ${bizId} ---`);
        const rules = await db.collection('automationrules').find({ businessId: bizId }).toArray();
        if (rules.length === 0) {
            console.log('No rules found.');
        } else {
            rules.forEach(r => {
                console.log(`- Rule: ${r.name} (${r.type}) | Enabled: ${r.enabled}`);
            });
        }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkRules();
