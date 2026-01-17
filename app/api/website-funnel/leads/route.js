import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import Lead from "@/models/automation/Lead";
import LeadSource from "@/models/automation/LeadSource";
import Activity from "@/models/automation/Activity";
import Business from "@/models/Business";
import { automationEngine } from "@/lib/automationEngine";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { websiteId, businessId, name, email, phone, message } = data;

    if (!websiteId || !businessId || !name || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the lead
    const lead = await Lead.create({
      businessId,
      name,
      email,
      phone,
      serviceInterest: message,
      source: 'Website Funnel',
      websiteId,
      status: 'new',
      priority: 'high'
    });

    // 2. Log activity
    await Activity.create({
      businessId,
      leadId: lead._id,
      type: 'lead_captured',
      text: `Lead captured from website funnel (ID: ${websiteId})`,
      metadata: {
        websiteId,
        message
      }
    });

    // 3. Trigger Automation (Existing System)
    try {
      if (automationEngine && typeof automationEngine.processLeadTrigger === 'function') {
        console.log(`[API:WebsiteLeads] Triggering automation for new lead: ${lead._id}`);
        await automationEngine.processLeadTrigger(lead, 'onLeadReceived');
      }
    } catch (autoError) {
      console.error('Automation engine error:', autoError);
      // Don't fail the lead capture if automation fails
    }

    return NextResponse.json({ success: true, leadId: lead._id });
  } catch (error) {
    console.error('Error submitting lead from website:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
