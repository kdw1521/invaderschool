"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
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
    // 헤더 높이(3.5rem)만큼 여백 주고, 화면 상단에 가깝게 배치
    <div className="h-full flex items-start justify-center pt-16 md:pt-24 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>내부 포털 로그인</CardTitle>
            <CardDescription>회사 이메일로 로그인하세요.</CardDescription>
          </CardHeader>

          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="pw">비밀번호</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {err && <Alert>{err}</Alert>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner />} 로그인
            </Button>

            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <label className="inline-flex items-center gap-2 select-none">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-700" />
                이 기기 기억하기
              </label>
              <Link href="#" className="hover:underline">비밀번호 찾기</Link>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          접근 권한이 없으면 관리자에게 요청하세요.
        </p>
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          계정이 없나요? <Link href="/signup" className="underline hover:opacity-80">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
