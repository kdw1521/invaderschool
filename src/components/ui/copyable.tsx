"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type CopyableProps = {
  text: string;                  // 복사할 실제 텍스트
  prefix?: string;               // 앞에 붙일 레이블 (예: "톡방코드:")
  className?: string;            // 외부 스타일
  children?: React.ReactNode;    // 커스텀 렌더 텍스트(없으면 prefix + text 사용)
};

export function Copyable({ text, prefix, className, children }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text ?? "");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text ?? "";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="클릭하면 복사됩니다"
      className={cn(
        "inline-block text-left hover:underline",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 rounded",
        className
      )}
      aria-live="polite"
    >
      {children ?? (
        <span className="truncate">
          {prefix ? `${prefix} ` : ""}
          {text}
        </span>
      )}
      {copied && <span className="ml-2 text-xs text-emerald-600">복사됨</span>}
    </button>
  );
}
