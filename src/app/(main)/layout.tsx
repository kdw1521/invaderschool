import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { SidebarProvider, SidebarToggleButton } from "@/components/layout/SidebarDock";
import SidebarDock from "@/components/layout/SidebarDock";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() { return (await store).getAll().map(c => ({ name: c.name, value: c.value })); },
        setAll() {},
      } as CookieMethodsServer,
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SidebarProvider>
      {/* 헤더: 전체폭 사용 (max-w 제거) */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarToggleButton />
            <div className="h-6 w-6 rounded-lg bg-blue-600" />
            <Link href="/" className="font-extrabold tracking-tight">Invader Portal</Link>
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link className="hover:opacity-80" href="/">대시보드</Link>
                <form action="/api/auth/logout" method="post">
                  <button className="hover:opacity-80" type="submit">로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <Link className="hover:opacity-80" href="/login">로그인</Link>
                <Link className="hover:opacity-80" href="/signup">회원가입</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 본문: 전체폭 그리드 (사이드바 10% + 콘텐츠 90%) */}
      <div className="min-h-[calc(100vh-3.5rem)] w-full flex">
        <SidebarDock>
          <Sidebar />
        </SidebarDock>
        <main className="flex-1 px-4 py-6">{children}</main>
      </div>

      {/* 푸터: 전체폭 사용 */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800">
        <div className="px-4 h-12 text-xs flex items-center justify-between text-slate-500">
          <span>© {new Date().getFullYear()} Invader School • Internal use only</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </SidebarProvider>
  );
}
