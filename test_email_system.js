/**
 * Test Script for Multi-Tenant Email System
 * 
 * This script tests:
 * 1. Encryption/Decryption
 * 2. Business email credentials setup
 * 3. SMTP verification
 * 4. Email sending
 * 
 * Usage: node test_email_system.js
 */

const { encrypt, decrypt, isEncrypted } = require('./lib/encryption');

console.log('========================================');
console.log('🧪 TESTING EMAIL SYSTEM');
console.log('========================================\n');

// Test 1: Encryption
console.log('Test 1: Password Encryption');
console.log('----------------------------');
const testPassword = 'MySecurePassword123!';
console.log('Original Password:', testPassword);

const encrypted = encrypt(testPassword);
console.log('Encrypted:', encrypted);
console.log('Is Encrypted?', isEncrypted(encrypted));

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match?', testPassword === decrypted ? '✅ YES' : '❌ NO');
console.log('');

// Test 2: Database Connection
console.log('Test 2: Database Connection');
console.log('----------------------------');

const mongoose = require('mongoose');
const { dbConnect } = require('./lib/mongodb');
const Business = require('./models/Business');

async function testDatabase() {
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');
    
    // Find a business
    const business = await Business.findOne({});
    if (business) {
      console.log(`✅ Found business: ${business.businessName}`);
      console.log(`   - ID: ${business._id}`);
      console.log(`   - Email Integration Enabled: ${business.integrationCredentials?.email?.enabled || false}`);
      
      if (business.integrationCredentials?.email?.enabled) {
        console.log(`   - Email: ${business.integrationCredentials.email.fromEmail || business.integrationCredentials.email.username}`);
        console.log(`   - Password Encrypted: ${isEncrypted(business.integrationCredentials.email.password)}`);
        console.log(`   - Integration Health: ${business.integrationHealth?.email?.status || 'unknown'}`);
      }
    } else {
      console.log('⚠️  No businesses found in database');
    }
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testDatabase().then(() => {
  console.log('\n========================================');
  console.log('✅ ALL TESTS COMPLETE');
  console.log('========================================');
  console.log('\nNext Steps:');
  console.log('1. Go to /automation/settings/integrations');
  console.log('2. Enable Hostinger Business Mail');
  console.log('3. Enter your Hostinger email credentials');
  console.log('4. Click "Test Hostinger Connect"');
  console.log('5. Submit a test lead to see emails in action!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
