require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

const BusinessSchema = new mongoose.Schema({
  integrationCredentials: Object
}, { strict: false });

const AutomationRuleSchema = new mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  type: String,
  config: Object
}, { strict: false });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);
const AutomationRule = mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);

async function finalPolish() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const bizIdStr = '6967fea3c951c77f3c313991';
    const bizId = new mongoose.Types.ObjectId(bizIdStr);
    
    console.log('Polishing business settings...');
    await Business.updateOne(
      { _id: bizId },
      { 
        $set: { 
          'integrationCredentials.email.username': 'saurabh@leadforgrow.online',
          'integrationCredentials.email.fromEmail': 'saurabh@leadforgrow.online',
          'integrationCredentials.email.fromName': 'Saurabh'
        } 
      }
    );

    console.log('Polishing automation rule template...');
    await AutomationRule.updateOne(
      { businessId: bizId, type: 'instant_acknowledgement' },
      { 
        $set: { 
          'config.messageTemplate': 'Thank you for your enquiry. Regarding the enquiry you asked about, we will connect with you soon.',
          'config.emailSubject': 'Enquiry Received - LeadForGrow'
        } 
      }
    );

    console.log('Polish complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

finalPolish();
