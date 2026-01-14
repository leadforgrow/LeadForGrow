require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function fixDataTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userIdStr = '6967fea3c951c77f3c31398f';
    const bizIdStr = '6967fea3c951c77f3c313991';
    
    console.log('Fixing User businessId type...');
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userIdStr) },
      { $set: { businessId: new mongoose.Types.ObjectId(bizIdStr) } }
    );
    // Also try as string ID just in case the ID itself is a string
    await db.collection('users').updateOne(
      { _id: userIdStr },
      { $set: { businessId: new mongoose.Types.ObjectId(bizIdStr) } }
    );

    console.log('Fixing Business ID type...');
    // Delete any string version of the business
    await db.collection('businesses').deleteOne({ _id: bizIdStr });
    
    // Ensure it exists as ObjectId
    const existing = await db.collection('businesses').findOne({ _id: new mongoose.Types.ObjectId(bizIdStr) });
    if (!existing) {
      console.log('Creating business with ObjectId...');
      await db.collection('businesses').insertOne({
        _id: new mongoose.Types.ObjectId(bizIdStr),
        businessName: 'Saurabh Business',
        ownerId: new mongoose.Types.ObjectId(userIdStr),
        status: 'active',
        onboardingComplete: true,
        onboardingStep: 'completed',
        integrationCredentials: {
          email: {
            enabled: true,
            provider: 'smtp',
            username: 'saurabh@leadforgrow.online',
            fromEmail: 'saurabh@leadforgrow.online',
            fromName: 'Saurabh',
            password: 'Saurabh@123'
          }
        },
        quotas: {
          maxForms: 1,
          maxTeamMembers: 1,
          maxAutomationRules: 3,
          maxLeadsPerMonth: 100
        },
        usage: {
          formsCreated: 0,
          leadsThisMonth: 0,
          lastResetDate: new Date()
        }
      });
    } else {
      console.log('Business with ObjectId already exists.');
    }

    console.log('Re-creating Automation Rules with proper ObjectId...');
    await db.collection('automationrules').deleteMany({ businessId: new mongoose.Types.ObjectId(bizIdStr) });
    await db.collection('automationrules').deleteMany({ businessId: bizIdStr });

    await db.collection('automationrules').insertOne({
      businessId: new mongoose.Types.ObjectId(bizIdStr),
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
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Data types fixed.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixDataTypes();
