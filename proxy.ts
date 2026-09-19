import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (request.method === "POST" && request.headers.has("next-action")) return NextResponse.next();
  const token = request.cookies.get("silho-admin-session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "development-only-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") throw new Error("Invalid role");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
