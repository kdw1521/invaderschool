"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { SalesAPI } from "@/modules/sales/api";
import { UploadBox } from "@/components/sales/UploadBox";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { link } from "fs";
import Link from "next/link";
import { Copyable } from "@/components/ui/copyable";

/* ---------------- Types ---------------- */
type SalesRow = {
  id: number;
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
type Room = { id: number; name: string; code: string; link: string; created_at: string };

/* ---------------- Page ---------------- */
export default function SalesSetDetail() {
  const { id } = useParams<{ id: string }>(); // cohort id
  const router = useRouter();
  const qc = useQueryClient();

  const qSet  = useQuery<{ set: any }>({ queryKey: ["sales-sets", id],        queryFn: () => SalesAPI.detail(id) });
  const qRows = useQuery<SalesRow[]>({   queryKey: ["sales-sets", id, "rows"], queryFn: () => SalesAPI.listRows(Number(id)) });

  // 톡방 목록
  const qRooms = useQuery<Room[]>({
    queryKey: ["rooms", id],
    queryFn: async () => {
      const res = await fetch(`/api/teacher-cohort-rooms?cohortId=${id}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  // 업로드
  const upload = useMutation({
    mutationFn: (file: File) => SalesAPI.uploadExcel({ teacherId: "", cohortId: Number(id), setId: id }, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales-sets", id, "rows"] }),
  });

  // 톡방 등록 모달
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const addRoom = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/teacher-cohort-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_cohort_id: Number(id), name: roomName.trim(), code: roomCode.trim(), link: roomLink.trim() }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "failed");
      return res.json();
    },
    onSuccess: () => {
      setRoomName(""); setRoomCode(""); setRoomLink(""); setOpen(false);
      qc.invalidateQueries({ queryKey: ["rooms", id] });
    },
  });

  if (qSet.isError) return <Alert>{String(qSet.error)}</Alert>;
  if (qSet.isLoading || !qSet.data) return <div className="h-24 rounded-2xl border animate-pulse bg-slate-100/40 dark:bg-slate-800/40" />;

  const { set } = qSet.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{set.cohort_name} / {set.teacher_name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 톡방 등록 */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-9">톡방 등록</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>톡방 등록</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="room-name" className="text-sm">방 이름</Label>
                  <Input
                    id="room-name"
                    value={roomName}
                    onChange={(e)=>setRoomName(e.target.value)}
                    placeholder="예: 1기 단톡방"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="room-code" className="text-sm">참여코드</Label>
                  <Input
                    id="room-code"
                    value={roomCode}
                    onChange={(e)=>setRoomCode(e.target.value)}
                    placeholder="예: 0918"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="room-link" className="text-sm">링크</Label>
                  <Input
                    id="room-link"
                    value={roomLink}
                    onChange={(e)=>setRoomLink(e.target.value)}
                    placeholder="예: https://open.kakao.com/..."
                  />
                </div>

                {addRoom.isError && <Alert>{String(addRoom.error)}</Alert>}
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={()=>setOpen(false)}>닫기</Button>
                <Button
                  onClick={()=>addRoom.mutate()}
                  disabled={addRoom.isPending || !roomName.trim() || !roomCode.trim()}
                >
                  {addRoom.isPending ? "저장중…" : "등록"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={()=>router.push("/sales")}>목록</Button>
        </div>
      </div>

      {/* 톡방 목록 */}
      <section className="rounded-xl border">
        <header className="px-4 py-3 border-b text-sm font-medium">등록된 톡방</header>
        {qRooms.isError ? (
          <div className="p-4"><Alert>{String(qRooms.error)}</Alert></div>
        ) : qRooms.isLoading ? (
          <div className="p-4 text-sm text-slate-500">불러오는 중…</div>
        ) : (qRooms.data ?? []).length === 0 ? (
          <div className="p-4 text-sm text-slate-500">등록된 방이 없습니다. 우측 상단 ‘톡방 등록’을 눌러 추가하세요.</div>
        ) : (
          <ul className="divide-y">
            {qRooms.data!.map(r => (
              <li key={r.id} className="px-4 py-3 text-sm flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">톡방명: {r.name}</div>
                  <div>
                    <Copyable text={r.code} prefix="참여코드: " className="font-mono text-blue-600" />
                  </div>
                  <Link
                    href={r.link?.startsWith("http") ? r.link : `https://${r.link}`}
                    target="_blank"
                    rel="noreferrer"
                    prefetch={false}
                    className="font-medium truncate text-blue-600 hover:underline"
                    title={r.link}
                  >
                    톡방링크: {r.link}
                  </Link>
                  <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 업로드 & 표 */}
      <UploadBox compact onUpload={async (file) => { await upload.mutateAsync(file); }} />
      {upload.isError && <Alert>{String(upload.error)}</Alert>}

      <RowsSection rowsQ={qRows} />
    </div>
  );
}

/* ---------------- Table ---------------- */
function RowsSection({ rowsQ }: { rowsQ: UseQueryResult<SalesRow[], unknown> }) {
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm]     = useState<Partial<SalesRow>>({});

  const mut = useMutation({
    mutationFn: (payload: Partial<SalesRow>) => SalesAPI.updateRow(editId!, normalize(payload)),
    onSuccess: async () => { setEditId(null); setForm({}); await rowsQ.refetch(); },
  });

  const data = Array.isArray(rowsQ.data) ? rowsQ.data : [];

  // 기본: 모든 컬럼 10ch(≈90px)
  const PX_10CH = 90, PX_20CH = 180, PX_30CH = 270;

  const columns = useMemo<ColumnDef<SalesRow>[]>(() => [
    colText("주문항목명", "order_name", PX_30CH),
    colText("회원명", "student_name", PX_10CH),
    colMono("휴대전화", "student_phone", PX_20CH),
    colText("이메일", "student_email", PX_20CH),
    colNum("결제금액", "payment_amount", PX_10CH),
    colNum("환불금액", "refund_amount", PX_10CH),
    colText("주문상태", "order_status", PX_10CH),
    colDT("주문일시", "ordered_at", PX_20CH, 14),
    colDT("결제일시", "payment_at", PX_20CH, 14),
    colText("유형", "order_type", PX_10CH),
    colText("방법", "order_method", PX_10CH),
    {
      id: "actions",
      header: "",
      size: 120, minSize: 100, maxSize: 220,
      cell: ({ row }) => {
        const r = row.original;
        const editing = editId === r.id;
        return editing ? (
          <div className="flex gap-2">
            <Button size="sm" className="h-8 px-3" disabled={mut.isPending} onClick={() => mut.mutate(form)}>저장</Button>
            <Button size="sm" variant="secondary" className="h-8 px-3" onClick={() => { setEditId(null); setForm({}); }}>취소</Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" className="h-8 px-3" onClick={() => { setEditId(r.id); setForm(pickRow(r)); }}>
            수정
          </Button>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [editId, form, mut.isPending]);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    defaultColumn: { size: PX_10CH, minSize: 70, maxSize: 800 },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (rowsQ.isError) return <Alert>{String(rowsQ.error)}</Alert>;
  if (rowsQ.isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg border animate-pulse bg-slate-100/40 dark:bg-slate-800/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm table-fixed" style={{ width: table.getCenterTotalSize() }}>
          <colgroup>
            {table.getHeaderGroups()[0]?.headers.map((h) => (
              <col key={h.id} style={{ width: h.getSize() }} />
            ))}
          </colgroup>

          <thead className="bg-slate-50 dark:bg-slate-900/40 select-none">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="text-left">
                {hg.headers.map(h => (
                  <th key={h.id} className="relative px-3 py-2 font-semibold align-middle">
                    <div className="truncate">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</div>
                    {h.column.getCanResize() && (
                      <span
                        title="드래그해서 컬럼 너비 조절"
                        onMouseDown={h.getResizeHandler()}
                        onTouchStart={h.getResizeHandler()}
                        className={[
                          "absolute right-0 top-0 h-full w-3 cursor-col-resize select-none",
                          "flex items-center justify-center",
                          h.column.getIsResizing() ? "bg-blue-500/30" : "hover:bg-slate-300/40 dark:hover:bg-slate-700/40",
                          "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-slate-200 dark:after:bg-slate-700"
                        ].join(" ")}
                      >
                        <svg width="8" height="16" viewBox="0 0 8 16" aria-hidden className="opacity-70">
                          <circle cx="4" cy="4"  r="1.1" fill="currentColor" />
                          <circle cx="4" cy="8"  r="1.1" fill="currentColor" />
                          <circle cx="4" cy="12" r="1.1" fill="currentColor" />
                        </svg>
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="[&_tr]:border-b">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top">
                    <div className="truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ---------- helpers ---------- */
  function inputBase(key: keyof SalesRow, className = "") {
    return (
      <input
        value={(form[key] as any) ?? ""}
        onChange={(e)=>setForm((s: Partial<SalesRow>)=>({ ...s, [key]: e.target.value }))}
        className={`h-8 rounded-md border border-[rgb(var(--border))] bg-transparent px-2 text-sm ${className}`}
      />
    );
  }
  function colText(label: string, key: keyof SalesRow, px = 90): ColumnDef<SalesRow> {
    return {
      accessorKey: key,
      header: label,
      size: px, minSize: 70, maxSize: 800,
      cell: ({ row, getValue }) => {
        const r = row.original; const editing = editId === r.id;
        if (!editing) { const v = String(getValue() ?? ""); return <span className="block truncate" title={v}>{v}</span>; }
        return inputBase(key, "w-[16rem]");
      },
    };
  }
  function colNum(label: string, key: keyof SalesRow, px = 90): ColumnDef<SalesRow> {
    return {
      accessorKey: key, header: label, size: px, minSize: 70, maxSize: 260,
      cell: ({ row }) => {
        const r = row.original; const editing = editId === r.id;
        if (!editing) { const v = fmtNum(r[key] as any); return <div className="text-right truncate" title={v}>{v}</div>; }
        return (
          <input
            type="number"
            value={(form[key] as any) ?? ""}
            onChange={(e)=>setForm((s: Partial<SalesRow>)=>({ ...s, [key]: e.target.value }))}
            className="h-8 w-[8rem] rounded-md border border-[rgb(var(--border))] bg-transparent px-2 text-sm text-right"
          />
        );
      },
    };
  }
  function colDT(label: string, key: keyof SalesRow, px = 90, editWidthRem = 14): ColumnDef<SalesRow> {
    return {
      accessorKey: key, header: label, size: px, minSize: 70, maxSize: 360,
      cell: ({ row }) => {
        const r = row.original; const editing = editId === r.id;
        if (!editing) { const v = fmtDT(r[key] as any); return <span className="block truncate" title={v}>{v}</span>; }
        return (
          <input
            type="datetime-local"
            value={(form[key] as any) ?? ""}
            onChange={(e)=>setForm((s: Partial<SalesRow>)=>({ ...s, [key]: e.target.value }))}
            className="h-8 rounded-md border border-[rgb(var(--border))] bg-transparent px-2 text-sm"
            style={{ width: `${editWidthRem}rem` }}
          />
        );
      },
    };
  }
  function colMono(label: string, key: keyof SalesRow, px = 90): ColumnDef<SalesRow> {
    return {
      accessorKey: key, header: label, size: px, minSize: 70, maxSize: 360,
      cell: ({ row, getValue }) => {
        const r = row.original; const editing = editId === r.id;
        if (!editing) { const v = String(getValue() ?? ""); return <span className="block truncate font-mono" title={v}>{v}</span>; }
        return inputBase(key, "w-[12rem] font-mono");
      },
    };
  }
}

/* ---------- shared utils ---------- */
function pickRow(r: SalesRow): Partial<SalesRow> {
  return {
    order_name:   r.order_name ?? "",
    student_name: r.student_name ?? "",
    student_phone:r.student_phone ?? "",
    student_email:r.student_email ?? "",
    payment_amount: r.payment_amount ?? null,
    refund_amount:  r.refund_amount ?? null,
    order_status:   r.order_status ?? "",
    ordered_at:   r.ordered_at ? r.ordered_at.slice(0, 16) : "",
    payment_at:   r.payment_at ? r.payment_at.slice(0, 16) : "",
    order_type:   r.order_type ?? "",
    order_method: r.order_method ?? "",
  };
}

function fmtNum(n?: number | null) { if (n == null) return ""; return new Intl.NumberFormat().format(n); }
function fmtDT(s?: string | null)  { if (!s) return ""; const d = new Date(s); return isNaN(d.getTime()) ? "" : d.toLocaleString(); }
function normalize(p: Partial<SalesRow>) {
  const toNum = (v: any) => (v === "" || v == null) ? null : (Number.isFinite(Number(v)) ? Number(v) : null);
  const toISO = (v: any) => { if (!v) return null; const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); };
  const trim = (v: any) => { const s = typeof v === "string" ? v.trim() : v; return s || s === 0 ? s : null; };
  return {
    order_name:        (p.order_name ?? "").toString(),
    student_name:      trim(p.student_name),
    student_phone:     trim((p.student_phone as any)?.toString().replace(/[^\d]/g, "")),
    student_email:     trim(p.student_email),
    payment_amount:    toNum(p.payment_amount as any),
    refund_amount:     toNum(p.refund_amount as any),
    order_status:      trim(p.order_status),
    ordered_at:        toISO(p.ordered_at as any),
    payment_at:        toISO(p.payment_at as any),
    order_type:        trim(p.order_type),
    order_method:      trim(p.order_method),
  };
}
