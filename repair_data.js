require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

const BusinessSchema = new mongoose.Schema({
  businessName: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  plan: { type: String, default: 'free' },
  onboardingComplete: { type: Boolean, default: false },
  onboardingStep: { type: String, default: 'business_details' },
  quotas: {
    maxForms: { type: Number, default: 1 },
    maxTeamMembers: { type: Number, default: 1 },
    maxAutomationRules: { type: Number, default: 3 },
    maxLeadsPerMonth: { type: Number, default: 100 }
  }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: String,
  businessId: mongoose.Schema.Types.ObjectId,
  role: String
});

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function repair() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      const business = await Business.findById(user.businessId);
      if (!business) {
        console.log(`User ${user.email} (${user._id}) has missing business ${user.businessId}. Repairing...`);
        
        await Business.create({
          _id: user.businessId,
          businessName: (user.email.split('@')[0] || 'My Business') + ' Business',
          ownerId: user._id,
          plan: 'free',
          onboardingComplete: false,
          onboardingStep: 'business_details'
        });
        
        console.log(`Created business for ${user.email}`);
      } else {
        console.log(`User ${user.email} has valid business: ${business.businessName}`);
      }
    }

    await mongoose.disconnect();
    console.log('Repair complete');
  } catch (err) {
    console.error(err);
  }
}

repair();
