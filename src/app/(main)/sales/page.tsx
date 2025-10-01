"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SalesAPI, type SalesSet } from "@/modules/sales/api";
import { TeachersAPI } from "@/modules/teachers/api";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/* --- small debounce hook --- */
function useDebounce<T>(value: T, delay = 500) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function SalesSheetIndex() {
  // 소스
  const teachersQ = useQuery({ queryKey: ["teachers"], queryFn: TeachersAPI.list });

  // 상태
  const [teacherId, setTeacherId] = useState("");
  const [cohortId, setCohortId]   = useState<number | "">("");
  const [q, setQ]                 = useState("");

  // 디바운스된 검색어
  const dq = useDebounce(q, 500);

  // 목록
  const setsQ = useQuery({
    queryKey: ["sales-sets", teacherId, cohortId, dq],
    queryFn: () =>
      SalesAPI.list({
        teacherId: teacherId || undefined,
        cohortId: cohortId ? Number(cohortId) : undefined,
        q: dq || undefined,
      }),
  });

  const tmap = useMemo(
    () => Object.fromEntries((teachersQ.data ?? []).map(t => [t.id, t.name])),
    [teachersQ.data]
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">매출 시트</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">강사·기수별 업로드와 집계.</p>
      </header>

      {/* 필터 + 업로드 */}
      <div className="rounded-xl border p-3 sm:p-4 space-y-3 max-w-[720px]">
        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr),minmax(140px,1fr),1fr] items-center">
          {/* 검색 (디바운스 적용) */}
          <Input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="강사/기수/메모 검색"
            className="h-9 rounded-lg px-3 text-sm"
          />
        </div>
      </div>

      {/* 카드 목록 */}
      {setsQ.isError ? (
        <Alert>{String(setsQ.error)}</Alert>
      ) : setsQ.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border animate-pulse bg-slate-100/40 dark:bg-slate-800/40" />
          ))}
        </div>
      ) : (setsQ.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-slate-500 text-sm">
          업로드 내역이 없습니다. 기수를 선택해 엑셀을 올리세요.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(setsQ.data ?? []).map((s: SalesSet) => (
            <Link
              key={s.id}
              href={`/sales/${s.id}`}
              className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 hover:shadow"
            >
              <div className="font-semibold">{s.cohort_name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                강사: {s.teacher_name ?? tmap[s.teacher_id] ?? "-"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                업로드 {s.uploads_count}건
                {s.last_uploaded_at ? ` • 최신 ${new Date(s.last_uploaded_at).toLocaleString()}` : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
