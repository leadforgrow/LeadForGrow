const mongoose = require('mongoose');

async function checkRules() {
    try {
        await mongoose.connect('mongodb+srv://himanshu:Himanshu%40123@cluster0.z6f6i.mongodb.net/leadforgrow?retryWrites=true&w=majority');
        const businessId = new mongoose.Types.ObjectId('69fde90f057bfa782233c663');
        
        const rules = await mongoose.connection.db.collection('automationrules').find({ businessId }).toArray();
        console.log('Rules found:', rules.length);
        rules.forEach(r => {
            console.log(`Rule: ${r.name}`);
            console.log(`- Type: ${r.type}`);
            console.log(`- Enabled: ${r.enabled}`);
            console.log(`- Triggers: ${JSON.stringify(r.triggers)}`);
            console.log(`- Config: ${JSON.stringify(r.config)}`);
        });
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRules();
