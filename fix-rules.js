
const mongoose = require('mongoose');

// Hardcoded URI from your .env.local to ensure we hit the right DB
const MONGODB_URI = "mongodb+srv://moodlicontactai_db_user:f0hRR53e08mLI2Ei@cluster0.d2wth0f.mongodb.net/?appName=Cluster0";

const AutomationRuleSchema = new mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  name: String,
  enabled: Boolean,
  triggers: {
    onLeadReceived: Boolean,
    onStatusChange: Boolean
  }
}, { strict: false }); // Strict false to allow flexibility

const AutomationRule = mongoose.model('AutomationRule', AutomationRuleSchema);

async function fixRules() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // 1. Find the LFG business rules (or all rules for safety in this context)
    const rules = await AutomationRule.find({});
    console.log(`Found ${rules.length} total rules in DB.`);

    for (const rule of rules) {
      console.log(`Checking rule: "${rule.name}" (ID: ${rule._id})`);
      console.log(`  - Current enabled: ${rule.enabled}`);
      console.log(`  - Current onLeadReceived: ${rule.triggers?.onLeadReceived}`);

      let updates = {};
      let needsUpdate = false;

      // Force Enable Rule
      if (rule.enabled !== true) {
        updates.enabled = true;
        needsUpdate = true;
      }

      // Force Enable Trigger
      if (!rule.triggers || rule.triggers.onLeadReceived !== true) {
        updates['triggers.onLeadReceived'] = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('  ⚠️ FIXING rule...');
        await AutomationRule.updateOne(
            { _id: rule._id },
            { $set: updates }
        );
        console.log('  ✅ Rule updated successfully.');
      } else {
        console.log('  ✨ Rule is already correct.');
      }
    }

    console.log('\n---------------------------------------------------');
    console.log('DONE. All rules are now enabled and set to trigger on new leads.');
    console.log('Please try submitting the form again.');
    console.log('---------------------------------------------------');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixRules();
