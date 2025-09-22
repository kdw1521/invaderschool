"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };
const items: Item[] = [
  { href: "/sales-sheet", label: "매출시트" },
  { href: "/utilities", label: "유틸리티" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur">
      <div className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500">메뉴</div>
      <nav className="px-2 pb-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname?.startsWith(it.href + "/");
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    active
                      ? "bg-slate-200/60 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="i h-4 w-4 rounded-sm bg-slate-300 dark:bg-slate-600" />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
