import { NextResponse } from 'next/server';
import { withAuth } from './auth';
import RolePermission from '../models/RolePermission';
import { dbConnect } from './mongodb';

/**
 * Checks if a user has the required permissions based on their role.
 * Special cases: owners and super admins bypass permission checks.
 */
export async function checkPermissions(user, requiredPermissions) {
  if (!user) return false;

  const role = (user.role || '').toLowerCase();
  
  // Owners and Super Admins have full access
  const bypassRoles = ['owner', 'super', 'super_admin', 'agency_owner'];
  if (bypassRoles.includes(role)) {
    return true;
  }

  await dbConnect();
  
  // Fetch permissions for the role (case-insensitive)
  const rolePerm = await RolePermission.findOne({ 
    role: { $regex: new RegExp(`^${user.role}$`, 'i') } 
  });
  
  if (!rolePerm) {
    // If no specific permissions are defined for a role, we deny by default for security
    // UNLESS it's a legacy admin role we trust
    if (role.includes('admin')) return true;
    return false;
  }

  // Check if ALL required permissions are present
  return requiredPermissions.every(perm => rolePerm.permissions.includes(perm));
}

/**
 * Middleware wrapper for API routes to enforce permission-based access control
 */
export function withPermissions(permissions, handler) {
  return withAuth()(async (req, ...args) => {
    const hasPermission = await checkPermissions(req.user, permissions);
    
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Insufficient permissions to access this resource.',
        code: 'PERMISSION_DENIED'
      }, { status: 403 });
    }
    
    return handler(req, ...args);
  });
}

/**
 * Specialized check for Live Chat
 * Requirements: Dashboard Access AND Reports Access
 */
export async function canAccessLiveChat(user) {
  return checkPermissions(user, ['dashboard_access', 'reports_access']);
}
