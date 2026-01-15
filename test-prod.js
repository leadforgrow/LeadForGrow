
async function testProductionEndpoint() {
  console.log('--- TESTING HOSTINGER PROD ENDPOINT (Native Fetch) ---');
  
  const token = 'lfg_form_6ea5bbe9733adb6eadb46ecba6b9ceb21040889e9921c8bb26cb0f7d12730627';
  const url = 'https://www.leadforgrow.com/api/ingest/form';
  
  const payload = {
    name: 'Saurabh Prod Test 2',
    email: 'saurabhiitr01@gmail.com',
    phone: '9876543210',
    message: 'Testing production email delivery with hardened mailer',
     extra: {
      formName: 'Enquiry',
      formToken: token
    }
  };

  try {
    console.log(`Sending to: ${url}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('HTTP Status:', res.status);
    // console.log('Response:', JSON.stringify(data, null, 2));

    if (res.status === 200 && data.success) {
        console.log('SUCCESS: Lead ingested by Prod Server.');
        console.log(`Lead ID: ${data.leadId || 'unknown'}`);
    } else {
        console.log('FAILURE: API did not accept lead.');
        console.log('Error:', data.error || JSON.stringify(data));
    }

  } catch (error) {
    console.error('FATAL ERROR:', error);
  }
}

testProductionEndpoint();
