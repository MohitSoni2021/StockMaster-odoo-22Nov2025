import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  
  const pathname = request.nextUrl.pathname;

    // Helper: try to decode a JWT and extract a role field.
    function getRoleFromJwt(token) {
      try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        // base64 url -> base64
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // atob is available in Edge runtime; decode percent-encoding to support UTF-8
        const jsonPayload = decodeURIComponent(
          Array.prototype.map
            .call(atob(base64), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const data = JSON.parse(jsonPayload);
        // common fields where role might be stored
        return data.role || (data.user && data.user.role) || (data.data && data.data.role) || null;
      } catch (e) {
        return null;
      }
    }

    const userRoleCookie = request.cookies.get('userRole')?.value;
    const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/manager') || pathname.startsWith('/staff');
    if (isProtected && !token && !userRoleCookie) {
      return NextResponse.redirect(new URL('/(auth)/login', request.url));
    }

    // Determine role: prefer explicit cookie, otherwise try to decode token
    const role = userRoleCookie || (token ? getRoleFromJwt(token) : null);

    // Manager-only rule: only users with role === 'manager' are allowed under /manager
    if (pathname.startsWith('/manager')) {
      if (!role || role !== 'manager') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Admin-only rule
    if (pathname.startsWith('/admin')) {
      if (!role || role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Staff rule (staff or admin allowed)
    if (pathname.startsWith('/staff')) {
      if (!role || (role !== 'staff' && role !== 'admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ['/admin/:path*', '/manager/:path*', '/staff/:path*'],
  };
