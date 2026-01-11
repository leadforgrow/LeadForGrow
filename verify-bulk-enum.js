import mongoose from 'mongoose';
import Lead from './models/automation/Lead.js';

async function testEnum() {
  console.log('Testing Lead model source enum for "manual" and "bulk"...');
  
  const testManual = new Lead({
    businessId: new mongoose.Types.ObjectId(),
    name: 'Manual Test Lead',
    phone: '1234567890',
    source: 'manual'
  });

  const testBulk = new Lead({
    businessId: new mongoose.Types.ObjectId(),
    name: 'Bulk Test Lead',
    phone: '0987654321',
    source: 'bulk'
  });

  const errorManual = testManual.validateSync();
  const errorBulk = testBulk.validateSync();
  
  if (errorManual && errorManual.errors && errorManual.errors.source) {
    console.error('Validation FAILED for "manual".');
    console.error(errorManual.errors.source.message);
  } else {
    console.log('Validation PASSED for "manual".');
  }

  if (errorBulk && errorBulk.errors && errorBulk.errors.source) {
    console.error('Validation FAILED for "bulk".');
    console.error(errorBulk.errors.source.message);
  } else {
    console.log('Validation PASSED for "bulk".');
  }

  if ((errorManual && errorManual.errors && errorManual.errors.source) || 
      (errorBulk && errorBulk.errors && errorBulk.errors.source)) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testEnum().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
