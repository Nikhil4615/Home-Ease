import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function userAuth(request) {
  try {
    // Get the user's session token with validation
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    // Check token existence and validity
    if (!token || !token.exp || Date.now() >= token.exp * 1000) {
      return NextResponse.redirect(
        new URL('/?error=unauthorized&message=Session+expired+or+invalid.+Please+login+again', request.url)
      );
    }

    // Token is valid, attach it to request
    request.token = token;
    return NextResponse.next();
  } catch (error) {
    console.error('User authentication error:', error);
    return NextResponse.redirect(
      new URL('/?error=unauthorized&message=Authentication+error.+Please+try+again', request.url)
    );
  }
}

async function adminAuth(request) {
  try {
    // Get the user's session token with validation
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    // Check token existence and validity
    if (!token || !token.exp || Date.now() >= token.exp * 1000) {
      return NextResponse.redirect(
        new URL('/?error=unauthorized&message=Session+expired+or+invalid.+Please+login+again', request.url)
      );
    }

    // Check if the user is an admin
    if (!token.isAdmin) {
      return NextResponse.redirect(
        new URL('/?error=unauthorized&message=You+do+not+have+admin+privileges', request.url)
      );
    }

    // Token is valid and user is admin, attach token to request
    request.token = token;
    return NextResponse.next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.redirect(
      new URL('/?error=unauthorized&message=Authentication+error.+Please+try+again', request.url)
    );
  }
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    return adminAuth(request);
  }

  // Check if the path requires user authentication
  if (path.startsWith('/profile') || 
      path.startsWith('/bookings') || 
      path.startsWith('/services/create')) {
    return userAuth(request);
  }

  // Allow the request to continue for public routes
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    '/admin/:path*',     // All admin routes
    '/profile/:path*',   // All profile routes
    '/bookings/:path*',  // All bookings routes
    '/services/create',  // Service creation route
  ],
}; 