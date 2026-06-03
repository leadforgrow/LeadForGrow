import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getAgencyForUser } from '@/lib/agency/agencyGuards';

/**
 * Agency-scoped route guard — JWT auth + agency ownership verification.
 */
export function withAgencyAuth(handler) {
  return withAuth()(async (req, ...args) => {
    const agency = await getAgencyForUser(req.user.userId);
    if (!agency) {
      return NextResponse.json(
        { success: false, error: 'Agency access denied', code: 'AGENCY_DENIED' },
        { status: 403 }
      );
    }
    req.agency = agency;
    return handler(req, ...args);
  });
}
