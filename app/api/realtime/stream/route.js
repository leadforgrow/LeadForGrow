import { subscribe } from '@/lib/realtime/hub';
import { REALTIME_EVENTS } from '@/lib/realtime/constants';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const token =
    url.searchParams.get('token') ||
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    req.cookies.get('token')?.value;

  const user = token ? verifyToken(token) : null;
  if (!user?.businessId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const businessId = user.businessId;
  const encoder = new TextEncoder();
  let heartbeat;
  let unsubscribe;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          /* closed */
        }
      };

      send({ type: REALTIME_EVENTS.CONNECTION, data: { status: 'connected', businessId } });
      unsubscribe = subscribe(businessId, send);
      heartbeat = setInterval(() => {
        send({ type: REALTIME_EVENTS.CONNECTION, data: { status: 'ping' } });
      }, 25000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
