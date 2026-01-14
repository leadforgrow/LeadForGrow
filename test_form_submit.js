const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const TOKEN = 'lfg_form_9a46fbaf9999c62161e229170790311e';

async function testFormSubmit() {
  console.log('--- TESTING FORM SUBMISSION ---');
  console.log(`Token: ${TOKEN}\n`);

  const payload = {
    token: TOKEN,
    name: 'Riya Test From Form',
    email: 'singhriya33690@gmail.com',
    phone: '1234567890',
    message: 'I want to inquire about lead recovery.'
  };

  try {
    const response = await fetch(`${API_BASE}/api/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFormSubmit();
