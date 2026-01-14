require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function checkSpecificBiz() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const bizId = new mongoose.Types.ObjectId('6967fea3c951c77f3c313991');
    console.log('Checking forms for business 6967fea3c951c77f3c313991...');
    const forms = await db.collection('forms').find({ businessId: bizId }).toArray();
    
    if (forms.length === 0) {
        console.log('No forms found for this business.');
        
        // Let's see all forms in the DB to see if any have a string ID instead
        const allForms = await db.collection('forms').find().toArray();
        console.log(`Total forms in DB: ${allForms.length}`);
        
        const stringBizId = '6967fea3c951c77f3c313991';
        const strForms = allForms.filter(f => String(f.businessId) === stringBizId);
        console.log(`Forms matching bizId (string or ObjectId): ${strForms.length}`);
        strForms.forEach(f => {
            console.log(`- Form: ${f.name} (${f._id}), Token: ${f.token}, Type: ${typeof f.businessId}`);
        });
    } else {
        forms.forEach(f => {
            console.log(`- Form: ${f.name} (${f._id}), Token: ${f.token}`);
        });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkSpecificBiz();
