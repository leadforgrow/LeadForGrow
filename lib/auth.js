import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
    console.warn('[Auth] WARNING: JWT_SECRET not found in environment variables. Falling back to a standard secret (NOT SECURE).');
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            businessId: user.businessId,
            agencyId: user.agencyId,
            role: user.role,
            plan: user.plan || 'free'
        },
        JWT_SECRET || 'lfg_fallback_secret',
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verify a JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET || 'lfg_fallback_secret');
    } catch (error) {
        return null;
    }
}

/**
 * Middleware for protecting API routes and enforcing RBAC
 */
export function withAuth(roles = []) {
    return (handler) => async (req, ...args) => {
        try {
            // 1. Get token from Authorization header or Cookie
            const authHeader = req.headers.get('authorization');
            let token = null;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else {
                // Check cookies
                const cookieHeader = req.headers.get('cookie');
                if (cookieHeader) {
                    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
                    token = cookies.token;
                }
            }

            // 2. Resolve User Context
            let userContext = null;

            if (token) {
                // Verify JWT
                userContext = verifyToken(token);
                if (!userContext) {
                    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
                }
            } else {
                // FALLBACK: Support legacy userId in query params for backward compatibility
                const { searchParams } = new URL(req.url);
                const userId = searchParams.get('userId');

                if (userId) {
                    // Import inside to avoid circular deps if needed, but User is usually safe
                    const { dbConnect } = await import("@/lib/mongodb");
                    const User = (await import("@/models/User")).default;
                    await dbConnect();

                    const user = await User.findById(userId);
                    if (user) {
                        userContext = {
                            userId: user._id,
                            businessId: user.businessId,
                            agencyId: user.agencyId,
                            role: user.role,
                            plan: user.plan || 'free'
                        };
                    }
                }
            }

            if (!userContext) {
                console.warn(`[Auth Middleware] Authentication failed for ${req.url}`);
                return NextResponse.json({
                    success: false,
                    error: `Authentication required: ${new URL(req.url).pathname}`
                }, { status: 401 });
            }

            // 3. Check roles if restricted
            if (roles.length > 0 && !roles.includes(userContext.role)) {
                return NextResponse.json({
                    success: false,
                    error: 'Access denied: Insufficient permissions'
                }, { status: 403 });
            }

            // 4. Attach user context to request for handler use
            req.user = userContext;

            return handler(req, ...args);
        } catch (error) {
            console.error('[Auth Middleware] Error:', error);
            return NextResponse.json({ success: false, error: 'Internal auth error' }, { status: 500 });
        }
    };
}

/**
 * Helper to get user context from request (if already verified)
 */
export function getUser(req) {
    return req.user;
}
