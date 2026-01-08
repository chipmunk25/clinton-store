import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./session";
import { UserRole } from "@/db/schema/users";

type RoutePermission = {
  allowedRoles: UserRole[];
};

// Routes that require specific roles
const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  "/admin": { allowedRoles: ["admin"] },
  "/products/new": { allowedRoles: ["admin"] },
  "/products/edit": { allowedRoles: ["admin"] },
  "/expenses/new": { allowedRoles: ["admin"] },
  "/categories": { allowedRoles: ["admin"] },
  "/users": { allowedRoles: ["admin"] },
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login", // ADD THIS
  "/api/auth/forgot-password", // ADD THIS
  "/api/auth/reset-password", // ADD THIS
];

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and API health checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  // Verify session
  const session = await verifySession(request);

  // Not authenticated
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role permissions
  for (const [route, { allowedRoles }] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(session.user.role)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error: "Forbidden",
              message: "You do not have permission to access this resource",
            },
            { status: 403 }
          );
        }
        // Redirect to dashboard with error
        const dashboardUrl = new URL("/", request.url);
        dashboardUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Add user info to headers for server components
  const response = NextResponse.next();
  response.headers.set("x-user-id", session.user.id);
  response.headers.set("x-user-role", session.user.role);

  return response;
}
