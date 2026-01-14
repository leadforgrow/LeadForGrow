require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkLeadType() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const lead = await db.collection('leads').findOne({ _id: new mongoose.Types.ObjectId('69680a37e966f30cf5678207') });
    if (lead) {
        const isObjId = lead.businessId instanceof mongoose.Types.ObjectId;
        console.log(`Lead ID: ${lead._id}`);
        console.log(`BusinessId: ${lead.businessId}`);
        console.log(`Type: ${typeof lead.businessId}`);
        console.log(`IsObjectId: ${isObjId}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkLeadType();
