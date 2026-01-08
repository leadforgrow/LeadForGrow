require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkAssignmentSettings() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get business settings
    const businesses = await db.collection('businesses').find().toArray();
    console.log(`\n📊 Found ${businesses.length} business(es)\n`);
    
    businesses.forEach(biz => {
      console.log(`Business: ${biz.name}`);
      console.log(`  Owner ID: ${biz.ownerId}`);
      console.log(`  Assignment Strategy: ${biz.settings?.assignmentStrategy || 'solo (default)'}`);
      console.log('');
    });
    
    // Get all users
    const users = await db.collection('users').find().toArray();
    console.log(`📊 Found ${users.length} user(s)\n`);
    
    users.forEach(user => {
      console.log(`User: ${user.email || user.firstName}`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Business ID: ${user.businessId}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.active !== false}`);
      console.log('');
    });
    
    // Check lead assignments
    const leads = await db.collection('leads').find().toArray();
    const assignmentCounts = {};
    leads.forEach(lead => {
      const assignedTo = lead.assignedTo?.toString() || 'unassigned';
      assignmentCounts[assignedTo] = (assignmentCounts[assignedTo] || 0) + 1;
    });
    
    console.log('📊 Lead Distribution:');
    Object.entries(assignmentCounts).forEach(([userId, count]) => {
      const user = users.find(u => u._id.toString() === userId);
      console.log(`  ${user?.email || userId}: ${count} leads`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAssignmentSettings();
