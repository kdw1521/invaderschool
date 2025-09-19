import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerSupabaseClient(req, res);

  // 세션 자동 갱신을 유도. 실패해도 통과.
  await supabase.auth.getUser();

  return res;
}

// 보호가 필요한 경로만 선택적으로 작동시키려면:
// export const config = { matcher: ["/((?!_next|api/public|assets).*)"] };
