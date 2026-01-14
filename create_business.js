require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

async function createMissingBusiness() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const userId = '6967fea3c951c77f3c31398f';
    const businessId = '6967fea3c951c77f3c313991';
    
    console.log(`Checking user ${userId}...`);
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!user) {
      console.log('User not found!');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`User found: ${user.email}`);
    console.log(`User's businessId: ${user.businessId}`);
    
    const business = await db.collection('businesses').findOne({ _id: user.businessId });
    
    if (business) {
      console.log(`Business already exists: ${business.businessName || 'Unnamed'}`);
    } else {
      console.log(`Business NOT FOUND. Creating...`);
      
      const newBusiness = {
        _id: new mongoose.Types.ObjectId(businessId),
        businessName: (user.email.split('@')[0] || 'My') + ' Business',
        ownerId: new mongoose.Types.ObjectId(userId),
        plan: 'free',
        onboardingComplete: false,
        onboardingStep: 'business_details',
        status: 'active',
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
        },
        settings: {
          assignmentStrategy: 'solo',
          notifications: {
            email: { enabled: true, recipients: [] },
            whatsapp: { enabled: false, recipients: [] }
          },
          businessHours: {
            timezone: 'Asia/Kolkata',
            workingDays: [1, 2, 3, 4, 5, 6],
            startTime: '09:00',
            endTime: '18:00'
          }
        },
        integrationCredentials: {
          email: {
            enabled: true,
            provider: 'smtp',
            host: 'smtp.hostinger.com',
            port: 465,
            username: 'sales@leadforgrow.online',
            password: 'Saurabh@123',
            fromEmail: 'sales@leadforgrow.online',
            fromName: 'LeadForGrow Sales',
            lastVerified: new Date()
          }
        },
        integrationHealth: {
          email: { status: 'unknown' },
          whatsapp: { status: 'unknown' },
          webhooks: { status: 'inactive', totalCount: 0 }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('businesses').insertOne(newBusiness);
      console.log(`✅ Business created successfully!`);
      console.log(`   Business ID: ${newBusiness._id}`);
      console.log(`   Business Name: ${newBusiness.businessName}`);
      console.log(`   Owner: ${newBusiness.ownerId}`);
      console.log(`   Email Credentials: ${newBusiness.integrationCredentials.email.fromEmail}`);
    }
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err);
  }
}

createMissingBusiness();
