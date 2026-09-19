import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthSecret } from "./src/lib/auth-secret";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get("silho-admin-session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
  try {
    const secret = new TextEncoder().encode(getAuthSecret());
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") throw new Error("Invalid role");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
