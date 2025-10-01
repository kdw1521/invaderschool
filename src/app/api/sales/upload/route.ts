import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DBRow = {
  teacher_cohort_id: number;
  order_name: string;
  student_name: string | null;
  student_phone: string | null;
  student_email: string | null;
  payment_amount: number | null;
  refund_amount: number | null;
  order_status: string | null;
  ordered_at: string | null;
  payment_at: string | null;
  order_type: string | null;
  order_method: string | null;
};

export async function POST(req: NextRequest) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const cohortIdStr = form.get("cohortId");
  const file = form.get("file");

  if (!cohortIdStr) return NextResponse.json({ error: "cohortId required" }, { status: 400 });
  const teacher_cohort_id = Number(cohortIdStr);
  if (!Number.isFinite(teacher_cohort_id)) return NextResponse.json({ error: "invalid cohortId" }, { status: 400 });
  if (!(file instanceof Blob)) return NextResponse.json({ error: "file required" }, { status: 400 });

  // 소유권 확인
//   const { data: ownership } = await admin()
//     .from("teacher_cohorts")
//     .select("id, teachers!inner(user_id)")
//     .eq("id", teacher_cohort_id)
//     .eq("teachers.user_id", user.id)
//     .maybeSingle();
//   if (!ownership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // 파일 파싱
  const buf = Buffer.from(await file.arrayBuffer());
  const rows = parseExcel(buf, teacher_cohort_id);
  if (rows.length === 0) return NextResponse.json({ error: "no valid rows" }, { status: 400 });

  // 트랜잭션 RPC: 'excel' 소스 삭제 후 일괄 insert
  const { data: count, error } = await admin().rpc("import_teacher_sales_excel", {
    p_cohort_id: teacher_cohort_id,
    p_rows: rows as unknown as any, // jsonb
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: count ?? rows.length });
}

/* ---------------- helpers ---------------- */
function parseExcel(buf: Buffer, teacher_cohort_id: number): DBRow[] {
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" }) as any[];
  if (!json.length) return [];

  const header: string[] = (json[0] as any[]).map(String);
  const colIdx = {
    order_name: idxOf(header, "주문항목명"),
    student_name: idxOf(header, "회원명"),
    student_phone: idxOf(header, "휴대전화번호"),
    student_email: idxOf(header, "이메일"),
    payment_amount: idxOf(header, "결제금액"),
    refund_amount: idxOf(header, "환불금액"),
    order_status: idxOf(header, "주문상태"),
    ordered_at: idxOf(header, "주문일시"),
    payment_at: idxOf(header, "결제일시"),
    order_type: idxOf(header, "결제유형"),
    order_method: idxOf(header, "결제방법"),
  };

  const out: DBRow[] = [];
  for (let r = 1; r < json.length; r++) {
    const row = json[r] as any[];
    if (!row || row.length === 0) continue;

    const rec: DBRow = {
      teacher_cohort_id,
      order_name: getStr(row, colIdx.order_name)?.trim() || "",
      student_name: nul(getStr(row, colIdx.student_name)),
      student_phone: normalizePhone(getStr(row, colIdx.student_phone)),
      student_email: nul(getStr(row, colIdx.student_email)),
      payment_amount: toNum(getStr(row, colIdx.payment_amount)),
      refund_amount: toNum(getStr(row, colIdx.refund_amount)),
      order_status: nul(getStr(row, colIdx.order_status)),
      ordered_at: toISO(getStr(row, colIdx.ordered_at)),
      payment_at: toISO(getStr(row, colIdx.payment_at)),
      order_type: nul(getStr(row, colIdx.order_type)),
      order_method: nul(getStr(row, colIdx.order_method)),
    };
    if (!rec.order_name && !rec.student_name && !rec.student_phone) continue;
    out.push(rec);
  }
  return out;
}

function idxOf(header: string[], label: string): number | null {
  const i = header.findIndex(h => String(h).trim() === label);
  return i >= 0 ? i : null;
}
function getStr(row: any[], idx: number | null): string {
  if (idx == null) return "";
  const v = row[idx];
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}
function nul(s: string) {
  const t = s?.trim?.() ?? "";
  return t ? t : null;
}
function normalizePhone(s: string) {
  const t = (s ?? "").replace(/[^\d]/g, "");
  return t ? t : null;
}
function toNum(s: string): number | null {
  const t = s?.toString().replace(/[,\s₩,원]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function toISO(s: string): string | null {
  if (!s) return null;
  const n = Number(s);
  if (Number.isFinite(n) && n > 0 && n < 600000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = n * 86400000;
    return new Date(epoch.getTime() + ms).toISOString();
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
