"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type UploadBoxProps = {
  onUpload: (file: File) => Promise<void>;
  compact?: boolean;
  accept?: string;
  className?: string;
};

export function UploadBox({
  onUpload,
  compact = false,
  accept = ".xlsx,.xls,.csv",
  className,
}: UploadBoxProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();

  const startUpload = async (file: File) => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setFileName(file.name);
    try {
      await onUpload(file);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (files: FileList | null) => {
    if (!files?.[0]) return;
    void startUpload(files[0]);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) void startUpload(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드"
        onClick={pick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "rounded-xl border border-dashed transition-colors",
          compact ? "p-3 text-xs" : "p-4 text-sm",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className={cn("font-medium", compact && "text-sm")}>
              매출시트 업로드
            </div>
            <div className="text-muted-foreground truncate">
              {busy
                ? "업로드 중… 잠시만 기다려주세요."
                : fileName
                ? `선택됨: ${fileName}`
                : compact
                ? "여기를 클릭하거나 파일을 끌어다 놓으세요"
                : "엑셀(.xlsx/.xls/.csv) 파일을 클릭 또는 드래그&드롭"}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {fileName && !busy && (
              <Button
                type="button"
                variant="secondary"
                className={cn(compact ? "h-8 px-3 text-xs" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName("");
                  setErr("");
                }}
              >
                초기화
              </Button>
            )}
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pick();
              }}
              disabled={busy}
              className={cn(compact ? "h-8 px-3 text-xs" : "")}
            >
              {busy ? "업로드중…" : "파일 선택"}
            </Button>
          </div>
        </div>
      </div>

      {err && (
        <div className={cn("mt-2", compact && "text-xs")}>
          <Alert>{err}</Alert>
        </div>
      )}
    </div>
  );
}
