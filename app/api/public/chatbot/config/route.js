import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { getPublicChatbotConfig, mergeChatbotConfig } from '@/lib/chatbot/defaults';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400, headers: CORS });
    }

    await dbConnect();
    const business = await Business.findById(businessId).select('businessName settings.chatbot').lean();

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404, headers: CORS });
    }

    const config = mergeChatbotConfig(business.settings?.chatbot);
    const publicConfig = getPublicChatbotConfig(business, config);

    if (publicConfig.active) {
      Business.findByIdAndUpdate(businessId, {
        $inc: { 'settings.chatbot.stats.impressions': 1 },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: publicConfig }, { headers: CORS });
  } catch (error) {
    console.error('[Chatbot Config GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
