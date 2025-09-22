import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"]; // 필요 시 추가

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      } satisfies CookieMethodsServer,
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 비로그인 사용자의 보호 페이지 접근 -> /login
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  // 로그인 사용자가 /login|/signup 접근 -> /
  if (user && isPublic) {
    return NextResponse.redirect(new URL("/", url));
  }

  return res;
}

// 정적/내부 경로 제외하고 전역 적용
export const config = {
  matcher: [
    "/((?!_next|favicon.ico|assets|public|api/public).*)",
  ],
};
