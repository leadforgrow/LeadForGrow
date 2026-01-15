import { NextResponse } from 'next/server';
import Business from '@/models/Business';
import { verifyBusinessSMTP } from '@/lib/businessMailer';
import { decrypt } from '@/lib/encryption';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // e.g. ?id=...

    // 1. Find Business
    let query = {};
    if (id) {
        query = { _id: id };
    } else {
        // Try to find LFG
        query = { businessName: { $regex: /LFG|LeadForGrow/i } };
    }

    const business = await Business.findOne(query);
    
    if (!business) {
      return NextResponse.json({ status: 'Error', message: 'Business not found' }, { status: 404 });
    }

    const emailConfig = business.integrationCredentials?.email || {};
    
    // 2. Report Configuration
    const report = {
      id: business._id,
      name: business.businessName,
      config: {
        enabled: emailConfig.enabled,
        host: emailConfig.host,
        port: emailConfig.port,
        user: emailConfig.username, 
        hasPassword: !!emailConfig.password,
        fromName: emailConfig.fromName,
        fromEmail: emailConfig.fromEmail
      }
    };

    // 3. Test Decryption
    try {
        const pass = decrypt(emailConfig.password);
        report.decryption = { success: true, length: pass ? pass.length : 0 };
        if (!pass) report.decryption = { success: false, error: 'Decrypted to null' };
    } catch (e) {
        report.decryption = { success: false, error: e.message };
    }

    // 4. Test SMTP Connection
    try {
      const result = await verifyBusinessSMTP(business);
      report.smtpTest = result;
      
      if (result.success) {
        return NextResponse.json({ status: 'Healthy', report });
      } else {
        return NextResponse.json({ status: 'Unhealthy', error: result.error, report }, { status: 500 });
      }
    } catch (error) {
      return NextResponse.json({ status: 'Crash', error: error.message, stack: error.stack, report }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ status: 'Fatal', error: error.message }, { status: 500 });
  }
}
