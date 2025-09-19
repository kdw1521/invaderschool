import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function createServerSupabaseClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // NextRequest 쿠키 → {name,value}[]
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          // 응답 쿠키에 모두 반영
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
      // cookieOptions: { name: "sb", lifetime: 60 * 60 * 24 * 7 }, // 필요 시
    }
  );
}

/** 서버 컴포넌트 등 "읽기 전용" 클라이언트가 필요할 때 */
export function createReadonlySupabaseClient() {
  // setAll을 쓸 수 없는 환경이면 no-op 처리
  const { cookies } = require("next/headers");
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map((c: { name: any; value: any; }) => ({ name: c.name, value: c.value }));
        },
        setAll() {
          // no-op: 서버 컴포넌트에서는 응답 헤더를 못 만질 수 있음
        },
      },
    }
  );
}
