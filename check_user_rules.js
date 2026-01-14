require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkUserRules() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const bizIdStr = '6967fea3c951c77f3c313991';
    
    console.log(`Checking rules for bizId: ${bizIdStr}`);
    const rules = await db.collection('automationrules').find({ 
        $or: [
            { businessId: bizIdStr },
            { businessId: new mongoose.Types.ObjectId(bizIdStr) }
        ]
    }).toArray();
    
    console.log(`Found ${rules.length} rules.`);
    rules.forEach(r => {
        const isObjId = r.businessId instanceof mongoose.Types.ObjectId;
        console.log(`- Rule: ${r.name} | Type: ${typeof r.businessId} (isObjId: ${isObjId}) | Triggers: ${JSON.stringify(r.triggers)}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUserRules();
