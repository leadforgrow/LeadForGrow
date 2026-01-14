/**
 * Test Lead Ingestion with Email Automation
 * This script simulates a lead coming in and triggers the email automation
 * to verify that business Hostinger credentials are used correctly
 */

const API_BASE = 'http://localhost:3000';

async function testLeadIngestion() {
  console.log('========================================');
  console.log('LEAD INGESTION & EMAIL TEST');
  console.log('========================================\n');

  // Use the user ID from the 404 error: 6967fea3c951c77f3c31398f
  const userId = '6967fea3c951c77f3c31398f';
  
  console.log(`Step 1: Testing with User ID: ${userId}\n`);

  // Create a test lead
  const testLead = {
    name: 'Test Lead from Automation',
    email: 'test@example.com', // Change this to your email to receive the test
    phone: '9876543210',
    serviceInterest: 'Web Development',
    message: 'I am interested in your web development services',
    source: 'website',
    sourceDetails: 'Contact Form Test'
  };

  console.log('Step 2: Sending lead data to API...');
  console.log('Lead Data:', JSON.stringify(testLead, null, 2));
  console.log('');

  try {
    const response = await fetch(`${API_BASE}/api/automation/leads?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLead)
    });

    console.log(`Step 3: Received response - Status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();
    
    console.log('Step 4: Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    if (data.success) {
      console.log('✅ SUCCESS: Lead created successfully!');
      console.log(`   Lead ID: ${data.data._id}`);
      console.log(`   Lead Name: ${data.data.name}`);
      console.log(`   Lead Email: ${data.data.email}`);
      console.log('');
      console.log('📧 Check the server logs above to see the email sending process!');
      console.log('   Look for logs starting with:');
      console.log('   - [Email:...]');
      console.log('   - [Resend API]');
      console.log('   - [AutoEngine:...]');
    } else {
      console.log('❌ FAILED: Lead creation failed');
      console.log(`   Error: ${data.error}`);
    }

    console.log('\n========================================');
    console.log('TEST COMPLETE');
    console.log('========================================');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testLeadIngestion();
