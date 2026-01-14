require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function dumpAllForms() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const forms = await db.collection('forms').find().toArray();
    console.log(`--- DUMPING ${forms.length} FORMS ---`);
    forms.forEach(f => {
      console.log(`ID: ${f._id} | Name: ${f.name} | BizId: ${f.businessId} | Token: ${f.token}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

dumpAllForms();
