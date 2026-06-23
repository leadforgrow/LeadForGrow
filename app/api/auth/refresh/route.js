import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';
import RefreshToken from '@/models/access/RefreshToken';
import { withRateLimit } from '@/lib/rateLimit';
import { withApiHandler } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { verifyRefreshToken, generateTokenPair } from '@/lib/security/refreshToken';
import { logAuthEvent } from '@/lib/auditLog';

async function refreshHandler(req) {
  await dbConnect();
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    const { ApiError } = await import('@/lib/api/errors');
    throw ApiError.badRequest('refreshToken is required');
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    const { ApiError } = await import('@/lib/api/errors');
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const valid = await RefreshToken.isValid(refreshToken);
  if (!valid) {
    const { ApiError } = await import('@/lib/api/errors');
    throw ApiError.unauthorized('Refresh token revoked or expired');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.active) {
    const { ApiError } = await import('@/lib/api/errors');
    throw ApiError.unauthorized('User not found or inactive');
  }

  let plan = 'free';
  if (user.businessId) {
    const business = await Business.findById(user.businessId).select('plan').lean();
    plan = business?.plan || 'free';
  }

  const tokens = generateTokenPair(user, { plan });

  await RefreshToken.revoke(refreshToken);
  await RefreshToken.store(user._id, tokens.refreshToken, {
    userAgent: req.headers.get('user-agent'),
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
  });

  await logAuthEvent(req, 'token_refresh', user._id, user.businessId);

  return apiSuccess(
    {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    },
    {},
    200,
    req.requestId
  );
}

export const POST = withRateLimit(20, 60, withApiHandler(refreshHandler));
