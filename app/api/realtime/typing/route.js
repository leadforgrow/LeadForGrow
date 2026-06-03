import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { emitChatTyping } from '@/lib/realtime/publish';

export const POST = withAuth()(async (req) => {
  const businessId = req.user.businessId;
  if (!businessId) {
    return NextResponse.json({ success: false, error: 'No tenant' }, { status: 403 });
  }

  const { leadId, typing } = await req.json();
  if (!leadId) {
    return NextResponse.json({ success: false, error: 'leadId required' }, { status: 400 });
  }

  await emitChatTyping(businessId, {
    leadId,
    userId: req.user.userId,
    typing: !!typing,
  });

  return NextResponse.json({ success: true });
});
