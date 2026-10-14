import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verificar } from "@/lib/session";

// Optimistic route guard. Pages re-check the session server-side.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessao = await verificar(request.cookies.get(COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (sessao?.papel !== "admin") return NextResponse.redirect(new URL("/login?admin=1", request.url));
    return NextResponse.next();
  }

  // /p/<slug>: client sees only their own portal; admin sees any.
  const slug = pathname.split("/")[2];
  if (sessao?.papel === "admin") return NextResponse.next();
  if (sessao?.papel === "cliente" && sessao.slug === slug) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/p/:path*"],
};
