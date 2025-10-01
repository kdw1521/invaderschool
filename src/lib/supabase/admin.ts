// src/lib/supabase/admin.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";

/** 세션 사용자 조회용(anon키). 쿠키에서 user 추출 */
export async function getUserFromCookies() {
  const store = cookies(); // sync
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await store).getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll() {
          // Route/RSC에서는 응답 쿠키 설정 안 함
        },
      } satisfies CookieMethodsServer,
    }
  );
  return supabase.auth.getUser(); // { data: { user }, error }
}

/** 서비스 롤(관리자) 클라이언트. RLS 우회 */
export function admin(): SupabaseClient {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
