import { NextResponse } from 'next/server';
import { callController } from '@/lib/call-automation/call_controller';
import { dbConnect } from "@/lib/mongodb";
import { withTenantAuth } from '@/lib/auth';

/**
 * Call Automation integration API.
 * All actions are tenant-scoped: businessId always comes from the JWT,
 * never from the client payload.
 */
export const POST = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const body = await req.json();
    const businessId = req.user.businessId;

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
      if (missedCall.businessId && String(missedCall.businessId) !== String(businessId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const result = await callCallbackService.initiateCallback(missedCall);
      return NextResponse.json({ success: true, result });
    }

    // Handle real-world connection test
    if (body.action === 'test_connection') {
       const { callTelephonyProvider } = await import('@/lib/call-automation/providers/call_telephony.provider');
       const { callRepository } = await import('@/lib/call-automation/storage/call_repository');
       const currentMonth = new Date().toISOString().slice(0, 7);
       const usage = await callRepository.getUsage(businessId, currentMonth);

       if (!usage?.connectedPhone) return NextResponse.json({ error: 'No phone connected' }, { status: 400 });

       // Trigger a call to the user's personal number
       const result = await callTelephonyProvider.makeAiCall(
         usage.connectedPhone,
         null,
         null,
         businessId
       );
       return NextResponse.json({ success: true, result });
    }

    // Handle incoming call simulation/testing (scoped to own tenant)
    if (body.action === 'simulate_missed') {
       const { callDetectionService } = await import('@/lib/call-automation/services/call_detection.service');
       const result = await callDetectionService.handleMissedCall(businessId, body.callerNumber, { type: 'simulation' }, body.businessNumber);
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
    console.error('[API] Call Integration POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

/**
 * Handle configuration changes and status checks
 */
export const GET = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const currentMonth = new Date().toISOString().slice(0, 7);

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
    console.error('[API] Call Integration GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

/**
 * Handle Phone Connection
 */
export const PATCH = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const body = await req.json();
    const businessId = req.user.businessId;
    const currentMonth = new Date().toISOString().slice(0, 7);

    let result;
    if (body.settings) {
       result = await callController.updateSettings(businessId, body.settings);
    } else if (body.phone) {
       result = await callController.connectPhone(businessId, currentMonth, body.phone);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] Call Integration Patch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

/**
 * Handle Deletion of Missed Calls
 */
export const DELETE = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const businessId = req.user.businessId;

    const { callRepository } = await import('@/lib/call-automation/storage/call_repository');

    if (action === 'reset') {
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

    const missedCall = await callRepository.findMissedCallById(id);
    if (missedCall?.businessId && String(missedCall.businessId) !== String(businessId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await callRepository.deleteMissedCall(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Call Integration DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
