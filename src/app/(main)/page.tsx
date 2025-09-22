import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">사내 대시보드</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          오늘 업무 현황과 바로가기 메뉴입니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 카드: 업무 */}
        <a
          href="/tasks"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 hover:shadow-lg hover:shadow-slate-900/10 transition"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">업무(Task)</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
              바로가기
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            할일 등록, 진행중/완료 관리
          </p>
          <div className="mt-4 text-sm text-slate-500">오늘 등록 0 • 진행 0 • 완료 0</div>
        </a>

        {/* 카드: 조직/인원 */}
        <a
          href="/orgs"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 hover:shadow-lg hover:shadow-slate-900/10 transition"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">조직/멤버</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20">
              관리
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            조직 생성, 권한(Role) 설정
          </p>
          <div className="mt-4 text-sm text-slate-500">조직 1 • 멤버 1</div>
        </a>

        {/* 카드: 공지 */}
        <a
          href="/notices"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 hover:shadow-lg hover:shadow-slate-900/10 transition"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">공지/문서</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-600/20">
              확인
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            사내 공지, 규정, 템플릿
          </p>
          <div className="mt-4 text-sm text-slate-500">미확인 0</div>
        </a>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {/* 오늘 일정 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">오늘 일정</h3>
            <a href="/calendar" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              전체 캘린더
            </a>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">팀 스탠드업</span>
              <span className="text-slate-500">09:30</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">강의 운영 점검</span>
              <span className="text-slate-500">14:00</span>
            </li>
          </ul>
        </div>

        {/* 빠른 작업 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold mb-3">빠른 작업</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition"
            >
              회원가입
            </Link>
            <Link
              href="/api/auth/logout"
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 transition"
            >
              로그아웃
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            보호 페이지 접근 시 자동으로 로그인 확인이 수행됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
