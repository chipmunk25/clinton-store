import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './session';
import { UserRole } from '@/db/schema';

type RoutePermission = {
  allowedRoles: UserRole[];
};

const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/admin':  { allowedRoles: ['admin'] },
  '/products/new': { allowedRoles:  ['admin'] },
  '/expenses/new': { allowedRoles: ['admin'] },
  // Default:  all authenticated users
};

export async function authMiddleware(request: NextRequest) {
  const session = await verifySession(request);
  const pathname = request.nextUrl.pathname;

  // Not authenticated
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role permissions
  for (const [route, { allowedRoles }] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route) && ! allowedRoles.includes(session.user.role)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse. json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}