import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/profile'];

export default function proxy(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    const isProtectedRoute = protectedRoutes.some((route) => 
    req.nextUrl.pathname.startsWith(route));

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next()
}

export const config = { matcher: ['/profile/:path*'] };