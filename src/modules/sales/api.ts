// 단순 플레이스홀더. 나중에 엔드포인트 연결만 바꾸면 됨.
export type SalesSet = {
  id: string;             // 상세 페이지 id
  teacher_id: string;
  teacher_name: string;
  cohort_id: number;
  cohort_name: string;
  uploads_count: number;
  last_uploaded_at: string | null;
};

export type SalesRow = {
  id: number;
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
  created_at: string;
};

export const SalesAPI = {
  // 강사/기수 필터로 목록 조회
  async list(params?: { teacherId?: string; cohortId?: number; q?: string }): Promise<SalesSet[]> {
    const url = new URL("/api/sales/sets", location.origin);
    if (params?.teacherId) url.searchParams.set("teacherId", params.teacherId);
    if (params?.cohortId)  url.searchParams.set("cohortId", String(params.cohortId));
    if (params?.q)         url.searchParams.set("q", params.q);
    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  // 상세 조회
  async detail(id: string): Promise<{ set: SalesSet; files: { id: string; name: string; size: number; uploaded_at: string; }[] }> {
    const r = await fetch(`/api/sales/sets/${id}`, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  // 파일 업로드(엑셀). 서버에서 파싱/저장.
  async uploadExcel(target: { teacherId: string; cohortId: number; setId?: string }, file: File): Promise<void> {
    const fd = new FormData();
    fd.set("teacherId", target.teacherId);
    fd.set("cohortId", String(target.cohortId));
    if (target.setId) fd.set("setId", target.setId);
    fd.set("file", file);
    const r = await fetch("/api/sales/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(await r.text());
  },

  listRows: async (cohortId: number): Promise<SalesRow[]> => {
    const r = await fetch(`/api/sales/sets/${cohortId}/rows`, { cache: "no-store" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  updateRow: async (id: number, patch: Partial<SalesRow>) => {
    const r = await fetch(`/api/sales/rows/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
};
