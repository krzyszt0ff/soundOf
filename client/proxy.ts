import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth"];

export default function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};