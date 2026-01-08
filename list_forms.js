require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to 'test' DB
const TEST_DB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function listForms() {
  try {
    console.log('Connecting...');
    await mongoose.connect(TEST_DB_URI);
    console.log('Connected!');
    
    const forms = await mongoose.connection.db.collection('forms').find({}).toArray();
    console.log(`Found ${forms.length} forms:`);
    const fs = require('fs');
    let output = '';
    forms.forEach(f => {
      output += `TOKEN: ${f.token}\nNAME: ${f.name}\n\n`;
    });
    fs.writeFileSync('tokens.txt', output);
    console.log('Tokens written to tokens.txt');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listForms();
