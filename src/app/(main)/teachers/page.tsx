"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CohortsAPI, TeachersAPI, type Cohort, type Teacher } from "@/modules/teachers/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export default function TeachersAndCohorts() {
  const teachersQ = useQuery({ queryKey: ["teachers"], queryFn: TeachersAPI.list });
  const cohortsQ  = useQuery({ queryKey: ["cohorts"],  queryFn: CohortsAPI.list });

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">강사 · 기수 관리</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">등록과 목록을 한 화면에서 처리.</p>
        </div>
      </header>

      <Tabs.Root defaultValue="teachers" className="block">
        <Tabs.List className="flex gap-2 border-b border-slate-200 dark:border-slate-800 sticky top-14 bg-[rgb(var(--background))]/80 backdrop-blur px-1 pt-2">
          <Tab value="teachers" label={`강사${teachersQ.data ? ` (${teachersQ.data.length})` : ""}`} />
          <Tab value="cohorts"  label={`기수${cohortsQ.data ? ` (${cohortsQ.data.length})` : ""}`} />
        </Tabs.List>

        <Tabs.Content value="teachers" className="pt-4">
          <TeachersTab />
        </Tabs.Content>
        <Tabs.Content value="cohorts" className="pt-4">
          <CohortsTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function Tab({ value, label }: { value: string; label: string }) {
  return (
    <Tabs.Trigger
      value={value}
      className="px-3 py-2 text-sm rounded-t-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:font-semibold"
    >
      {label}
    </Tabs.Trigger>
  );
}

/* --------------------- 강사 탭 --------------------- */
function TeachersTab() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["teachers"], queryFn: TeachersAPI.list });

  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [localErr, setLocalErr] = useState("");

  const add = useMutation({
    mutationFn: () => TeachersAPI.create(name.trim()),
    onSuccess: () => { setName(""); setLocalErr(""); qc.invalidateQueries({ queryKey: ["teachers"] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => TeachersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const filtered = useMemo(
    () => (data ?? []).filter(t => t.name.toLowerCase().includes(q.toLowerCase())),
    [data, q]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr("");
    const n = name.trim();
    if (!n) return;

    // 중복 체크(대소문자 무시)
    const dup = (data ?? []).some(t => t.name.toLowerCase() === n.toLowerCase());
    if (dup) { setLocalErr("이미 등록된 강사 이름입니다."); return; }

    add.mutate();
  };

  return (
    <section className="space-y-4">
      {/* 컴팩트 액션바 */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 sticky top-[4.5rem] bg-[rgb(var(--background))]/80 backdrop-blur z-10">
        <form
          onSubmit={onSubmit}
          className="
            grid gap-2 items-center
            sm:grid-cols-[minmax(180px,260px)_auto_1fr]
          "
        >
          {/* 1행: 강사 입력(좁게) + 버튼(좁게) */}
          <Input
            id="t-name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="강사 이름"
            className="h-9 rounded-lg px-3 text-sm w-full"
          />
          <Button type="submit" disabled={add.isPending} className="h-9 px-3 text-sm sm:ml-2">
            {add.isPending ? "저장중…" : "강사 추가"}
          </Button>

          {/* 2행: 검색 인풋 — 위 강사 인풋과 동일 열/가로 */}
          <Input
            id="t-q"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="검색"
            className="h-9 rounded-lg px-3 text-sm w-full sm:col-start-1 sm:col-span-1"
          />
        </form>

        {(localErr || add.error) && (
          <div className="mt-2">
            <Alert>
              {localErr ||
                ((add.error as any)?.status === 409 || (add.error as any)?.message === "duplicate"
                  ? "이미 등록된 강사 이름입니다."
                  : String(add.error))}
            </Alert>
          </div>
        )}
      </div>

      {error ? (
        <Alert>{String(error)}</Alert>
      ) : isLoading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <Empty text={q ? "검색 결과가 없습니다." : "등록된 강사가 없습니다."} />
      ) : (
        <CardGrid>
          {filtered.map((t) => (
            <Card key={t.id} title={t.name} meta={`생성: ${new Date(t.created_at).toLocaleString()}`}>
              <Button
                variant="destructive"
                onClick={() => { if (confirm(`'${t.name}'을(를) 삭제할까요?`)) del.mutate(t.id); }}
                className="h-8 px-3 text-sm"
              >
                삭제
              </Button>
            </Card>
          ))}
        </CardGrid>
      )}
    </section>
  );
}

/* --------------------- 기수 탭 --------------------- */
function CohortsTab() {
  const qc = useQueryClient();
  const teachersQ = useQuery({ queryKey: ["teachers"], queryFn: TeachersAPI.list });
  const cohortsQ  = useQuery({ queryKey: ["cohorts"],  queryFn: CohortsAPI.list });

  const tmap = useMemo(() => Object.fromEntries((teachersQ.data ?? []).map(t => [t.id, t.name])), [teachersQ.data]);

  const [teacherId, setTeacherId] = useState("");
  const [cohortNo, setCohortNo] = useState<string>("");
  const [localErr, setLocalErr] = useState("");
  const [q, setQ] = useState("");

  const add = useMutation({
    mutationFn: () => CohortsAPI.create(teacherId, `${Number(cohortNo)}기`),
    onSuccess: () => {
      setTeacherId(""); setCohortNo(""); setLocalErr("");
      qc.invalidateQueries({ queryKey: ["cohorts"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: number) => CohortsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cohorts"] }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr("");

    if (!teacherId) return setLocalErr("강사를 선택하세요.");
    const n = Number(cohortNo);
    if (!cohortNo || !Number.isFinite(n) || n <= 0) return setLocalErr("기수 번호는 1 이상의 숫자.");

    const finalName = `${n}기`;
    const exists = (cohortsQ.data ?? []).some((c) => c.teacher_id === teacherId && c.name === finalName);
    if (exists) return setLocalErr("이미 등록된 기수입니다.");

    add.mutate();
  };

  const filtered = useMemo(
    () => (cohortsQ.data ?? []).filter(c => {
      const teacherName = tmap[c.teacher_id] ?? "";
      return (q ? (c.name + teacherName).toLowerCase().includes(q.toLowerCase()) : true);
    }),
    [cohortsQ.data, q, tmap]
  );

  return (
    <section className="space-y-4">
      {/* 컴팩트 액션바: 전반 가로 축소 */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 sticky top-[4.5rem] bg-[rgb(var(--background))]/80 backdrop-blur z-10">
        <form
          onSubmit={onSubmit}
          className="
            grid gap-2 items-center
            sm:grid-cols-[minmax(100px,180px)_auto]
            max-w-[420px]                 /* 폼 전체 가로 축소 */
          "
        >
          {/* 3행: 강사 선택(검색 아래). 동일 폭으로 축소 */}
          <div className="col-span-2">
            <Label htmlFor="teacher" className="sr-only">강사</Label>
            <select
              id="teacher"
              value={teacherId}
              onChange={(e)=>setTeacherId(e.target.value)}
              className={`h-8 rounded-md px-2 text-xs border ${
                !teacherId && localErr ? "border-rose-500" : "border-[rgb(var(--border))]"
              } bg-white dark:bg-slate-900 w-full`}
              aria-invalid={!teacherId && !!localErr}
            >
              <option value="">강사 선택</option>
              {(teachersQ.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          {/* 1행: 번호 input + 버튼 */}
          <Input
            id="c-no"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="번호"
            value={cohortNo}
            onChange={(e)=>setCohortNo(e.target.value.replace(/[^\d]/g, ""))}
            className="h-8 rounded-md px-2 text-xs w-full"   /* 높이, 패딩, 폰트 축소 */
          />
          <Button
            type="submit"
            disabled={add.isPending}
            className="h-8 px-2 text-xs sm:ml-2"              /* 버튼도 축소 */
          >
            {add.isPending ? "저장중…" : "기수 추가"}
          </Button>

          {/* 2행: 검색 input (번호 input과 동일 폭) */}
          <Input
            id="c-q"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="강사/기수 검색"
            className="h-8 rounded-md px-2 text-xs w-full col-span-2"
          />
        </form>

        {(localErr || add.error) && (
          <div className="mt-2 max-w-[420px]">
            <Alert>
              {localErr || (((add.error as any)?.status === 409) ? "이미 등록된 기수입니다." : String(add.error))}
            </Alert>
          </div>
        )}
      </div>

      {cohortsQ.error ? (
        <Alert>{String(cohortsQ.error)}</Alert>
      ) : cohortsQ.isLoading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <Empty text={q ? "검색 결과가 없습니다." : "등록된 기수가 없습니다."} />
      ) : (
        <CardGrid>
          {filtered.map((c) => (
            <Card key={c.id} title={c.name} meta={`강사: ${tmap[c.teacher_id] ?? "-"}`}>
              <Button
                variant="destructive"
                onClick={() => { if (confirm(`'${c.name}'을(를) 삭제할까요?`)) del.mutate(c.id); }}
                className="h-8 px-3 text-sm"
              >
                삭제
              </Button>
            </Card>
          ))}
        </CardGrid>
      )}
    </section>
  );
}

/* --------------------- 공통 컴포넌트 --------------------- */
function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
function Card({ title, meta, children }: { title: string; meta?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold leading-tight">{title}</h3>
        {meta && <div className="mt-1 text-xs text-slate-500">{meta}</div>}
      </div>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-slate-500 text-sm">
      {text}
    </div>
  );
}
function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl border animate-pulse bg-slate-100/40 dark:bg-slate-800/40" />
      ))}
    </div>
  );
}
