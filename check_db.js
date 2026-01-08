require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkDatabases() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');
    console.log('Current database:', mongoose.connection.db.databaseName);
    console.log('');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    console.log('=== ALL DATABASES ===');
    for (const db of databases) {
      console.log(`\nDatabase: ${db.name}`);
      const database = mongoose.connection.client.db(db.name);
      const collections = await database.listCollections().toArray();
      
      for (const coll of collections) {
        if (coll.name === 'leads') {
          const count = await database.collection('leads').countDocuments();
          console.log(`  - leads collection: ${count} documents`);
          
          if (count > 0) {
            const recent = await database.collection('leads').find().sort({ receivedAt: -1 }).limit(1).toArray();
            console.log(`    Latest: ${recent[0].name} - ${new Date(recent[0].receivedAt).toLocaleString()}`);
          }
        }
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabases();
