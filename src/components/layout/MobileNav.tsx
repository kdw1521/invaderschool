"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label="메뉴 열기"
        className="mr-2 md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
        onClick={() => setOpen(true)}
      >
        {/* 햄버거 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold">메뉴</span>
              <button
                aria-label="메뉴 닫기"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              {/* Sidebar는 md:hidden 이라 모바일 드로어에서 보이게 별도 래핑 */}
              <div className="[&>aside]:block">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
