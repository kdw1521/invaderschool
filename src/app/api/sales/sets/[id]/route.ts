import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TeacherMini = { id: string; name: string; user_id: string };
type CohortRow = {
  id: number;
  name: string;
  teachers: TeacherMini | TeacherMini[];
};

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const cohortId = Number(id);

  // 조인 고정(!inner) + 소유권 체크
  const { data: raw, error: e1 } = await admin()
    .from("teacher_cohorts")
    .select("id,name, teachers:teachers!inner(id,name,user_id)")
    .eq("id", cohortId)
    .eq("teachers.user_id", user.id)
    .maybeSingle();

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (!raw) return NextResponse.json({ error: "not found" }, { status: 404 });

  const row = raw as unknown as CohortRow;
  const teacher = Array.isArray(row.teachers) ? row.teachers[0] : row.teachers;
  if (!teacher) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    set: {
      id: String(row.id),
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      cohort_id: row.id,
      cohort_name: row.name,
      uploads_count: null,
      last_uploaded_at: null,
    },
    files: [],
  });
}
