import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = Partial<{
  order_name: string;
  student_name: string | null;
  student_phone: string | null;
  student_email: string | null;
  payment_amount: number | null;
  refund_amount: number | null;
  order_status: string | null;
  ordered_at: string | null;   // ISO
  payment_at: string | null;   // ISO
  order_type: string | null;
  order_method: string | null;
}>;

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const rowId = Number(id);
  if (!Number.isFinite(rowId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  // 1) 수정 대상의 소유권 확인: teacher_sales -> teacher_cohorts -> teachers.user_id
  const cli = admin();

  // 먼저 sales 행에서 cohort id를 얻는다
  const { data: salesRow, error: e0 } = await cli
    .from("teacher_sales")
    .select("id, teacher_cohort_id")
    .eq("id", rowId)
    .maybeSingle();

  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!salesRow) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 그 cohort가 내 것인지 확인
//   const { data: ownership, error: e1 } = await cli
//     .from("teacher_cohorts")
//     .select("id, teachers!inner(user_id)")
//     .eq("id", salesRow.teacher_cohort_id)
//     .eq("teachers.user_id", user.id)
//     .maybeSingle();

//   if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
//   if (!ownership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // 2) 입력 파싱 및 정규화
  const body = (await req.json()) as Body;

  const toNum = (v: any) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const toISO = (v: any) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };
  const trimOrNull = (v: any) => {
    const s = typeof v === "string" ? v.trim() : v;
    return s ? s : null;
  };

  const update: Body = {};
  if ("order_name" in body)       update.order_name     = (body.order_name ?? "").toString();
  if ("student_name" in body)     update.student_name   = trimOrNull(body.student_name);
  if ("student_phone" in body)    update.student_phone  = trimOrNull(String(body.student_phone ?? "").replace(/[^\d]/g, ""));
  if ("student_email" in body)    update.student_email  = trimOrNull(body.student_email);
  if ("payment_amount" in body)   update.payment_amount = toNum(body.payment_amount);
  if ("refund_amount" in body)    update.refund_amount  = toNum(body.refund_amount);
  if ("order_status" in body)     update.order_status   = trimOrNull(body.order_status);
  if ("ordered_at" in body)       update.ordered_at     = toISO(body.ordered_at);
  if ("payment_at" in body)       update.payment_at     = toISO(body.payment_at);
  if ("order_type" in body)       update.order_type     = trimOrNull(body.order_type);
  if ("order_method" in body)     update.order_method   = trimOrNull(body.order_method);

  // 최소 변경 확인
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  // 3) 업데이트
  const { data: updated, error: e2 } = await cli
    .from("teacher_sales")
    .update(update)
    .eq("id", rowId)
    .select("*")
    .maybeSingle();

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  return NextResponse.json(updated);
}
