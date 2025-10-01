import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;                // cohort id
  const cohortId = Number(id);
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 소유권 체크
  // const { data: ok } = await admin()
  //   .from("teacher_cohorts")
  //   .select("id, teachers!inner(user_id)")
  //   .eq("id", cohortId)
  //   .eq("teachers.user_id", user.id)
  //   .maybeSingle();
  // if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await admin()
    .from("teacher_sales")
    .select("*")
    .eq("teacher_cohort_id", cohortId)
    .order("payment_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
