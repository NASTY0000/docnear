import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

const PUBLIC_EXACT = new Set(["/", "/login", "/register", "/emergency"]);
const PUBLIC_PREFIX = ["/api/health", "/api/emergency"];

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico" || pathname === "/icon.svg") return true;
  return false;
}

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ||
      "docnear-dev-session-secret-change-in-production-2026",
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role);
    const isDoctorPath = pathname === "/doctor" || pathname.startsWith("/doctor/");
    const isPatientPath =
      pathname.startsWith("/nearby") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/sessions") ||
      pathname.startsWith("/doctors");

    if (role === "PATIENT" && isDoctorPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/nearby";
      return NextResponse.redirect(url);
    }
    if (role === "DOCTOR" && isPatientPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/doctor/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
