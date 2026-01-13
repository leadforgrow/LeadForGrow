import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import { callController } from '@/lib/call-automation/call_controller';

/**
 * POST /api/automation/call-integration/completion
 * Internal bridge to handle AI callback completion results.
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    console.log('[API] Call Completion Received:', JSON.stringify(body, null, 2));

    // Bridge to controller (mocking Express-style res for compatibility)
    const mockRes = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    const result = await callController.handleCallbackCompletion({ body }, mockRes);
    
    return NextResponse.json(result.data, { status: result.status });

  } catch (error) {
    console.error('[API] Completion Route Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
