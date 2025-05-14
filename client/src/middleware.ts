import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Eliminar el BasePath de la ruta para procesamiento interno
  const pathWithoutBasePath = basePath && path.startsWith(basePath) 
    ? path.slice(basePath.length) 
    : path;

  // Skip redirects for static files (favicon.ico, images, etc.)
  if (pathWithoutBasePath.includes(".")) {
    // Si es un archivo estático y no incluye el basePath, redirigir a la ruta con basePath
    if (basePath && !path.startsWith(basePath)) {
      return NextResponse.redirect(new URL(`${basePath}${path}`, request.url));
    }
    return NextResponse.next();
  }

  // Handle GitHub OAuth callback redirect
  if (pathWithoutBasePath === "/auth/callback/github" || pathWithoutBasePath === "/auth/callback/google") {
    const redirectUrl = new URL(
      `${basePath}/api${pathWithoutBasePath}${request.nextUrl.search}`,
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  // Check if we're on a site route without a specific page
  // This matches exactly /{siteId} with nothing after it
  const siteRoutePattern = /^\/([^/]+)$/;
  const match = pathWithoutBasePath.match(siteRoutePattern);

  if (match) {
    const siteId = match[1];

    // Don't redirect certain built-in routes like 'login', 'signup', etc.
    const excludedRoutes = [
      "login",
      "signup",
      "settings",
      "subscribe",
      "auth",
      "_next",
      "api",
    ];
    if (excludedRoutes.includes(siteId)) {
      return NextResponse.next();
    }

    // Add cache control headers to make sure the redirect isn't cached
    const response = NextResponse.redirect(
      new URL(`${basePath}/${siteId}/main`, request.url)
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  return NextResponse.next();
}

// Only run middleware on specific paths, exclude asset paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
