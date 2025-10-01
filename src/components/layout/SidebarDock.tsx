"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};
const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sidebar.collapsed");
    if (saved != null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return <Ctx.Provider value={{ collapsed, setCollapsed }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSidebar must be used within <SidebarProvider>");
  return v;
}

export function SidebarToggleButton() {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className="mr-1 h-9 w-9 rounded-md text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
      aria-label="사이드바 접기/펼치기"
      title="사이드바 접기/펼치기"
    >
      ☰
    </button>
  );
}

/** 1:9 비율 고정(펼침: 10%, 접힘: 56px) */
export default function SidebarDock({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={cn(
        "shrink-0 border-r bg-background transition-[width] duration-200",
        collapsed ? "w-14" : "w-[10%]" // 10% = 1:9 비율
      )}
    >
      {children}
    </aside>
  );
}
