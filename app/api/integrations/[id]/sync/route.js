import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { runIntegrationSync } from '@/lib/integrations/service';
import { metaLog, metaError } from '@/lib/meta/logger';

function getBaseUrl(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export const POST = withPlanAccess('integrations', async (req, { params }) => {
  const started = Date.now();
  const { id } = await params;
  const businessId = req.user?.businessId;

  metaLog('Sync API', `POST /api/integrations/${id}/sync — businessId=${businessId}`);

  try {
    await dbConnect();
    metaLog('Sync API', 'Database connected');

    const baseUrl = getBaseUrl(req);
    metaLog('Sync API', `baseUrl=${baseUrl}, integrationId=${id}`);

    const result = await runIntegrationSync(businessId, id, baseUrl);

    metaLog('Sync API', `Sync finished in ${Date.now() - started}ms`, {
      success: result.syncResult?.success,
      message: result.syncResult?.message,
      recordsProcessed: result.syncResult?.recordsProcessed,
      skipped: result.syncResult?.skipped,
      failed: result.syncResult?.failed,
      formsCount: result.syncResult?.formsCount,
      totalLeadsSeen: result.syncResult?.totalLeadsSeen
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    metaError('Sync API', `Sync failed after ${Date.now() - started}ms`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
});
