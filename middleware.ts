import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RELEASE_TIME = new Date(
  "2026-09-11T12:00:00.000Z",
).getTime();

export function middleware(request: NextRequest) {
  const now = Date.now();

  // Setelah waktu rilis, semua halaman bisa diakses
  if (now >= RELEASE_TIME) {
    return NextResponse.next();
  }

  // Halaman countdown tetap bisa dibuka
  if (request.nextUrl.pathname === "/coming-soon") {
    return NextResponse.next();
  }

  // Semua halaman lain diarahkan ke countdown
  return NextResponse.redirect(
    new URL("/coming-soon", request.url),
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};