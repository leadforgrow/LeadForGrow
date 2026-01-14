require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const crypto = require('crypto');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function createForm() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const bizId = new mongoose.Types.ObjectId('6967fea3c951c77f3c313991');
    const token = 'lfg_form_' + crypto.randomBytes(16).toString('hex');
    
    console.log('Creating form for Saurabh Business...');
    const newForm = {
      name: 'Website Enquiry Form',
      businessId: bizId,
      token: token,
      active: true,
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
        { name: 'message', type: 'textarea', required: false, label: 'Message' }
      ],
      successMessage: 'Thank you for your enquiry. Regarding the enquiry you asked about, we will connect with you soon.',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0
    };
    
    await db.collection('forms').insertOne(newForm);
    console.log('✅ Form created successfully!');
    console.log(`   Token: ${token}`);
    console.log(`   Name: ${newForm.name}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

createForm();
