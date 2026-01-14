import { NextResponse } from 'next/server';
import { callController } from '@/lib/call-automation/call_controller';
import { dbConnect } from "@/lib/mongodb";

/**
 * Bridge for Call Automation Webhook
 * POST /api/automation/call-integration
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Handle Verification Request
    if (body.action === 'verify') {
      const { callTelephonyProvider } = await import('@/lib/call-automation/providers/call_telephony.provider');
      const validation = await callTelephonyProvider.validateCredentials(body.provider, body.credentials);
      return NextResponse.json(validation);
    }

    // Handle Manual AI Call Trigger (Dashboard Step 4)
    if (body.action === 'trigger_callback') {
      const { callCallbackService } = await import('@/lib/call-automation/services/call_callback.service');
      const { callRepository } = await import('@/lib/call-automation/storage/call_repository');
      const missedCall = await callRepository.findMissedCallById(body.missedCallId);
      if (!missedCall) return NextResponse.json({ error: 'Missed call not found' }, { status: 404 });
      
      const result = await callCallbackService.initiateCallback(missedCall);
      return NextResponse.json({ success: true, result });
    }

    // Handle real-world connection test
    if (body.action === 'test_connection') {
       const { callTelephonyProvider } = await import('@/lib/call-automation/providers/call_telephony.provider');
       const { callRepository } = await import('@/lib/call-automation/storage/call_repository');
       const currentMonth = new Date().toISOString().slice(0, 7);
       const usage = await callRepository.getUsage(body.businessId, currentMonth);
       
       if (!usage?.connectedPhone) return NextResponse.json({ error: 'No phone connected' }, { status: 400 });
       
       // Trigger a call to the user's personal number
       const result = await callTelephonyProvider.makeAiCall(
         usage.connectedPhone, 
         null, 
         null, 
         body.businessId
       );
       return NextResponse.json({ success: true, result });
    }

    // Handle incoming call simulation/testing
    if (body.action === 'simulate_missed') {
       const { callDetectionService } = await import('@/lib/call-automation/services/call_detection.service');
       // body.businessNumber is the SIM number we are simulating for
       const result = await callDetectionService.handleMissedCall(body.businessId, body.callerNumber, { type: 'simulation' }, body.businessNumber);
       return NextResponse.json({ success: true, result });
    }

    console.log('[API] POST /api/automation/call-integration - Webhook received');
    const mockRes = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };
    const result = await callController.handleWebhook({ body }, mockRes);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * Handle configuration changes and status checks
 */
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

    const [usage, settings] = await Promise.all([
      callController.getUsageInfo(businessId, currentMonth),
      callController.getSettings(businessId)
    ]);

    const { callRepository } = await import('@/lib/call-automation/storage/call_repository');
    const missedCalls = await callRepository.getRecentMissedCalls(businessId, 20, usage?.connectedPhone);
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        ...usage?._doc, 
        settings, 
        missedCalls 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handle Phone Connection
 */
export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log('[API] PATCH /api/automation/call-integration Body:', JSON.stringify(body, null, 2));

    const businessId = body.businessId;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    let result;
    if (body.settings) {
       result = await callController.updateSettings(businessId, body.settings);
    } else if (body.phone) {
       result = await callController.connectPhone(businessId, currentMonth, body.phone);
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] Call Integration Patch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
/**
 * Handle Deletion of Missed Calls
 */
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const businessId = searchParams.get('businessId');
    
    const { callRepository } = await import('@/lib/call-automation/storage/call_repository');

    if (action === 'reset' && businessId) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      // Reset usage (un-connect phone)
      await callRepository.connectPhone(businessId, currentMonth, null);
      // Reset settings
      await callRepository.updateBusinessSettings(businessId, {
        enabled: false,
        telephony: {
          provider: 'vapi',
          apiKey: '',
          assistantId: '',
          phoneNumberId: ''
        }
      });
      return NextResponse.json({ success: true, message: 'Integration reset' });
    }

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await callRepository.deleteMissedCall(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
