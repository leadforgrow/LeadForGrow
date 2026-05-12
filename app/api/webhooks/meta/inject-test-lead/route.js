import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { leadManager } from '@/lib/automation/leadManager';

/**
 * Direct test lead injection — bypasses Meta entirely
 * GET: https://leadforgrow.com/api/webhooks/meta/inject-test-lead?businessId=696956dce910b99089019e27
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
        return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    console.log(`[Inject Test Lead] Starting for business: ${businessId}`);

    try {
        await dbConnect();
        console.log(`[Inject Test Lead] DB connected`);

        const result = await leadManager.processMetaLead(businessId, {
            metaLeadId: `direct_test_${Date.now()}`,
            name: 'Meta Ads Test Lead',
            email: 'testlead@meta.com',
            phone: '919876543210',
            campaignName: 'Direct Test Campaign',
            adSetName: 'Direct Test Ad Set',
            adName: 'Direct Test Ad',
            formId: 'direct_test_form',
            receivedAt: new Date(),
            fields: { source: 'direct_inject', is_test: true }
        });

        console.log(`[Inject Test Lead] Result:`, result);
        return NextResponse.json({ 
            success: true, 
            result,
            message: 'Check your CRM leads now!'
        });

    } catch (error) {
        console.error('[Inject Test Lead] ERROR:', error.message);
        console.error('[Inject Test Lead] Stack:', error.stack);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
