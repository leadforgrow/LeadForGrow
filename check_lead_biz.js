require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLeadBiz() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const leadId = '696806c7c951c77f3c313a09';
    console.log(`Checking lead: ${leadId}`);
    const lead = await db.collection('leads').findOne({ _id: new mongoose.Types.ObjectId(leadId) });
    
    if (lead) {
      console.log(`Lead Name: ${lead.name}`);
      console.log(`Lead BusinessId: ${lead.businessId} (${typeof lead.businessId})`);
      const isObjId = lead.businessId instanceof mongoose.Types.ObjectId;
      console.log(`IsObjectId: ${isObjId}`);
    } else {
      console.log('Lead not found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkLeadBiz();
