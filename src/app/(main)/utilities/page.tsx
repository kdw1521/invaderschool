import Link from "next/link";

export default function UtilitiesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">유틸리티</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          사내에서 자주 쓰는 도구 모음.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/utilities/emoji"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">이모지 모음</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
              바로가기
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            제목·공지·배너 등에 쓰는 추천 이모지 컬렉션
          </p>
          <div className="mt-3 text-2xl">🎯✨📌🔥✅</div>
        </Link>

        {/* 추후 도구 카드 추가 예정 */}
      </section>
    </div>
  );
}
