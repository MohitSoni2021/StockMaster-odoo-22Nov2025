import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  
  const pathname = request.nextUrl.pathname;

  if (!token || !userRole) {
    if (pathname.startsWith('/admin') || 
        pathname.startsWith('/manager') || 
        pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL('/(auth)/login', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/manager') && userRole !== 'manager' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/staff') && userRole !== 'staff' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/staff/:path*'],
};
