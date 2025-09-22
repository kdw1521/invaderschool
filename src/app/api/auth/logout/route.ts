import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll().map(c => ({ name: c.name, value: c.value })); },
        setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
      } satisfies CookieMethodsServer,
    }
  );
  await supabase.auth.signOut();
  return res;
}
