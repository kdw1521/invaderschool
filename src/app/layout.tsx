import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invader Internal Portal",
  description: "사내 업무 포털",
  applicationName: "Invader Portal",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-600" />
              <span className="font-extrabold tracking-tight">Invader Portal</span>
            </div>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link className="hover:opacity-80" href="/">대시보드</Link>
              <Link className="hover:opacity-80" href="/login">로그인</Link>
              <Link className="hover:opacity-80" href="/signup">회원가입</Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-4 h-12 text-xs flex items-center justify-between text-slate-500">
            <span>© {new Date().getFullYear()} Invader School • Internal use only</span>
            <span>v1.0.0</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
