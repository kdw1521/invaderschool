import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TeacherMini = { id: string; name: string; user_id: string };
type CohortRow = {
  id: number;
  name: string;
  created_at: string;
  // Supabase가 배열로 줄 수도, 객체로 줄 수도 있어 안전 처리
  teachers: TeacherMini | TeacherMini[];
};

type SalesSet = {
  id: string;
  teacher_id: string;
  teacher_name: string;
  cohort_id: number;
  cohort_name: string;
  uploads_count: number;
  last_uploaded_at: string | null;
};

export async function GET(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId") || undefined;
  const cohortId  = url.searchParams.get("cohortId");
  const q         = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  // 1) 강사-기수 목록(내 소유만)
  let base = admin()
    .from("teacher_cohorts")
    .select("id,name,created_at, teachers:teachers!inner(id,name,user_id)")
    .eq("teachers.user_id", user.id);

  if (teacherId) base = base.eq("teachers.id", teacherId);
  if (cohortId)  base = base.eq("id", Number(cohortId));

  const { data: raw, error: e1 } = await base.order("created_at", { ascending: false });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const cohorts: CohortRow[] = (raw ?? []) as unknown as CohortRow[];

  // 강사 객체 정규화
  const normalized = cohorts.map((c) => {
    const t = Array.isArray(c.teachers) ? c.teachers[0] : c.teachers;
    return { ...c, teacher: t as TeacherMini };
  }).filter((c) => !!c.teacher);

  // 검색 필터
  const filtered = normalized.filter(c => {
    const hay = `${c.name ?? ""} ${c.teacher?.name ?? ""}`.toLowerCase();
    return q ? hay.includes(q) : true;
  });

  // 2) 업로드 집계
  const ids = filtered.map(c => c.id);
  type SaleMini = { teacher_cohort_id: number; created_at: string };
  let stats: Record<number, { cnt: number; last: string | null }> = {};
  if (ids.length) {
    const { data: sales, error: e2 } = await admin()
      .from("teacher_sales")
      .select("teacher_cohort_id, created_at")
      .in("teacher_cohort_id", ids);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    for (const r of (sales ?? []) as SaleMini[]) {
      const key = r.teacher_cohort_id;
      const prev = stats[key] ?? { cnt: 0, last: null as string | null };
      const cur = new Date(r.created_at).toISOString();
      stats[key] = { cnt: prev.cnt + 1, last: prev.last && prev.last > cur ? prev.last : cur };
    }
  }

  // 3) 응답
  const out: SalesSet[] = filtered.map((c) => ({
    id: String(c.id),
    teacher_id: c.teacher.id,
    teacher_name: c.teacher.name,
    cohort_id: c.id,
    cohort_name: c.name,
    uploads_count: stats[c.id]?.cnt ?? 0,
    last_uploaded_at: stats[c.id]?.last ?? null,
  }));

  return NextResponse.json(out);
}
