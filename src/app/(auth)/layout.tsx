import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600" />
            <span className="font-extrabold tracking-tight">Invader Portal</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link className="hover:opacity-80" href="/login">로그인</Link>
            <Link className="hover:opacity-80" href="/signup">회원가입</Link>
            <Link className="hover:opacity-80" href="/">대시보드</Link>
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-3.5rem)] mx-auto max-w-3xl px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-4 h-12 text-xs flex items-center justify-between text-slate-500">
          <span>© {new Date().getFullYear()} Invader School</span>
          <span>Auth</span>
        </div>
      </footer>
    </>
  );
}
