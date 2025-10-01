import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacher_id") ?? undefined;

  // 현재 사용자 소유 teacher 목록
  const { data: teachers, error: e1 } = await admin()
    .from("teachers").select("id").eq("user_id", user.id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  const ids = (teachers ?? []).map(t => t.id);
  if (ids.length === 0) return NextResponse.json([]);

  let q = admin().from("teacher_cohorts").select("*").in("teacher_id", ids).order("created_at", { ascending: false });
  if (teacherId) q = q.eq("teacher_id", teacherId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body?.teacher_id || !body?.name?.trim()) {
    return NextResponse.json({ error: "teacher_id and name required" }, { status: 400 });
  }

   // 사전 중복 체크
  const { data: exist } = await admin()
    .from("teacher_cohorts").select("id").eq("teacher_id", body.teacher_id).eq("name", body.name.trim()).maybeSingle();
  if (exist) return NextResponse.json({ error: "duplicate" }, { status: 409 });

  const { data, error } = await admin()
    .from("teacher_cohorts")
    .insert([{ teacher_id: body.teacher_id, name: body.name.trim() }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
