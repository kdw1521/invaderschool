import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 목록: ?cohortId=123
export async function GET(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cohortId = Number(searchParams.get("cohortId"));
  if (!Number.isFinite(cohortId)) return NextResponse.json({ error: "invalid cohortId" }, { status: 400 });

  const { data, error } = await admin()
    .from("teacher_cohort_rooms")
    .select("id, name, code, link, created_at")
    .eq("teacher_cohort_id", cohortId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// 등록
export async function POST(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { teacher_cohort_id?: number; name?: string; code?: string; link?: string } | null;
  const teacher_cohort_id = Number(body?.teacher_cohort_id);
  const name = (body?.name ?? "").trim();
  const code = (body?.code ?? "").trim();
  const link = (body?.link ?? "").trim();
  if (!Number.isFinite(teacher_cohort_id)) return NextResponse.json({ error: "invalid cohort id" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const { data, error } = await admin()
    .from("teacher_cohort_rooms")
    .insert([{ teacher_cohort_id, name, code, link }])
    .select("id, name, code, link, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
