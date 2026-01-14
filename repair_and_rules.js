require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

// Define Schemas for the repair script
const BusinessSchema = new mongoose.Schema({
  businessName: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  integrationCredentials: {
    email: Object
  },
  onboardingComplete: Boolean,
  onboardingStep: String,
  status: String,
  integrationHealth: Object
}, { strict: false });

const AutomationRuleSchema = new mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  type: String,
  enabled: Boolean,
  config: Object,
  triggers: Object
}, { timestamps: true });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);
const AutomationRule = mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);

async function repairAndAddRules() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const userId = '6967fea3c951c77f3c31398f';
    const businessIdString = '6967fea3c951c77f3c313991';
    const businessId = new mongoose.Types.ObjectId(businessIdString);
    
    console.log(`Checking business ${businessId}...`);
    let business = await Business.findById(businessId);
    
    if (!business) {
      console.log('Business not found. Please run create_business.js first or I will create it now.');
      // Re-create with requested details
      business = new Business({
        _id: businessId,
        businessName: 'Saurabh Business',
        ownerId: new mongoose.Types.ObjectId(userId),
        status: 'active',
        onboardingComplete: true,
        onboardingStep: 'completed',
        integrationCredentials: {
          email: {
            enabled: true,
            provider: 'smtp',
            username: 'saurabh@leadforgrow.online', // User said username was saurabh
            fromEmail: 'saurabh@leadforgrow.online',
            fromName: 'Saurabh',
            password: 'Saurabh@123'
          }
        }
      });
      await business.save();
      console.log('Business created.');
    } else {
      console.log('Updating business credentials to "saurabh"...');
      business.integrationCredentials = {
        email: {
          enabled: true,
          provider: 'smtp',
          username: 'saurabh@leadforgrow.online',
          fromEmail: 'saurabh@leadforgrow.online',
          fromName: 'Saurabh',
          password: 'Saurabh@123'
        }
      };
      await business.save();
      console.log('Business credentials updated.');
    }

    console.log('Creating Automation Rules...');

    // Delete existing rules for this business to avoid duplicates
    await AutomationRule.deleteMany({ businessId });

    // 1. Instant Acknowledgement Rule
    const ackRule = await AutomationRule.create({
      businessId,
      name: 'Instant Email Acknowledgment',
      description: 'Automatically send an email when a new lead is received.',
      type: 'instant_acknowledgement',
      enabled: true,
      config: {
        channel: 'email',
        emailSubject: 'Regarding your inquiry',
        messageTemplate: 'Thank you for your enquiry. We will connect with you soon regarding the details you asked about.'
      },
      triggers: {
        onLeadReceived: true
      }
    });
    console.log('Created rule:', ackRule.name);

    // 2. Team Notification Rule
    const notifyRule = await AutomationRule.create({
      businessId,
      name: 'Notify Owner of New Lead',
      description: 'Send an internal notification when a lead is captured.',
      type: 'notify_team',
      enabled: true,
      config: {},
      triggers: {
        onLeadReceived: true
      }
    });
    console.log('Created rule:', notifyRule.name);

    await mongoose.disconnect();
    console.log('\nRepair and rules creation complete!');
  } catch (err) {
    console.error('Error:', err);
  }
}

repairAndAddRules();
