require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function findLeadExplicitly() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const id = '696806c7c951c77f3c313a09';
    console.log(`Searching for lead ID: ${id}`);
    
    const lead1 = await db.collection('leads').findOne({ _id: id });
    const lead2 = await db.collection('leads').findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    console.log('As string:', lead1 ? 'FOUND' : 'NOT FOUND');
    console.log('As ObjectId:', lead2 ? 'FOUND' : 'NOT FOUND');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

findLeadExplicitly();
