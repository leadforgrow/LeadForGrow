/**
 * Call Automation Verification Script
 * Tests the webhook flow and database persistence
 */

const mongoose = require('mongoose');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

async function testCallAutomation() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check if collections exist
    console.log('📋 Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['callmisseds', 'callcallbacks', 'callusages', 'businesses'];
    requiredCollections.forEach(name => {
      if (collectionNames.includes(name)) {
        console.log(`  ✅ ${name} collection exists`);
      } else {
        console.log(`  ⚠️  ${name} collection not found (will be created on first insert)`);
      }
    });

    // Test 2: Send test webhook
    console.log('\n🔔 Sending test webhook...');
    const testPayload = {
      businessId: '695fb0c49bf5eae4e35517ed', // Replace with your actual business ID
      callerNumber: '8810873052',
      payload: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch('http://localhost:3000/api/automation/call-integration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));

    // Test 3: Verify data in database
    console.log('\n🔍 Verifying database records...');
    
    const CallMissed = mongoose.model('CallMissed', new mongoose.Schema({}, { strict: false }));
    const recentMissedCalls = await CallMissed.find().sort({ createdAt: -1 }).limit(3);
    console.log(`  Found ${recentMissedCalls.length} recent missed calls`);
    if (recentMissedCalls.length > 0) {
      console.log(`  Latest: ${recentMissedCalls[0]._id} from ${recentMissedCalls[0].callerNumber}`);
    }

    const CallCallback = mongoose.model('CallCallback', new mongoose.Schema({}, { strict: false }));
    const recentCallbacks = await CallCallback.find().sort({ createdAt: -1 }).limit(3);
    console.log(`  Found ${recentCallbacks.length} recent callbacks`);

    const CallUsage = mongoose.model('CallUsage', new mongoose.Schema({}, { strict: false }));
    const recentUsage = await CallUsage.find().sort({ createdAt: -1 }).limit(3);
    console.log(`  Found ${recentUsage.length} usage records`);

    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testCallAutomation();
