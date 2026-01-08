require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function setRoundRobin() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Update all businesses to use round-robin
    const result = await db.collection('businesses').updateMany(
      {},
      { 
        $set: { 
          'settings.assignmentStrategy': 'round-robin' 
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} business(es) to use round-robin assignment`);
    
    // Verify
    const businesses = await db.collection('businesses').find().toArray();
    console.log('\n📊 Current Settings:');
    businesses.forEach(biz => {
      console.log(`  ${biz.name || 'Business'}: ${biz.settings?.assignmentStrategy}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Done! New leads will now be distributed evenly across team members.');
  } catch (error) {
    console.error('Error:', error);
  }
}

setRoundRobin();
