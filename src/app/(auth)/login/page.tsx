"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const onLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) setErr(error.message);
    else location.href = "/";
  };

  return (
    <div className="h-full flex items-start justify-center pt-16 md:pt-20 px-4">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold tracking-tight">내부 포털 로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">회사 이메일로 로그인하세요.</p>
        </div>

        {/* 폼 컨테이너 */}
        <div className="rounded-xl border p-5">
          <form onSubmit={onLogin} className="space-y-5">
            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] text-muted-foreground">이메일</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-[13px] text-muted-foreground">비밀번호</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">대/소문자 구분, 안전한 환경에서 입력하세요.</p>
            </div>

            {err && <Alert>{err}</Alert>}

            <Button type="submit" disabled={loading} className="w-full h-10">
              {loading && <Spinner />} 로그인
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-700" />
                이 기기 기억하기
              </label>
              <Link href="#" className="hover:underline">비밀번호 찾기</Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          접근 권한이 없으면 관리자에게 요청하세요.
        </p>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          계정이 없나요?{" "}
          <Link href="/signup" className="underline hover:opacity-80">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
