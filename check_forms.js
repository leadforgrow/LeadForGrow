require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkForms() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- FORMS ---');
    const forms = await db.collection('forms').find().toArray();
    forms.forEach(f => {
      console.log(`Form: ${f.name} (${f._id})`);
      console.log(`  Token: ${f.token}`);
      console.log(`  BusinessId: ${f.businessId}`);
      console.log(`  Active: ${f.active}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkForms();
