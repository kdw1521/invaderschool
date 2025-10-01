"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const minLen = 8;

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(""); setOk("");
    if (!email) return setErr("이메일을 입력하세요.");
    if (pw.length < minLen) return setErr(`비밀번호는 ${minLen}자 이상이어야 합니다.`);
    if (pw !== pw2) return setErr("비밀번호가 일치하지 않습니다.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://invaderschool.vercel.app"}/login`,
      },
    });
    setLoading(false);

    if (error) {
      if (error.code === "user_already_registered") {
        setErr("");
        setOk("이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정하세요.");
      } else setErr(error.message);
      return;
    }

    if (!data.session) setOk("가입 메일을 보냈습니다. 받은 편지함을 확인하세요.");
    else location.href = "/";
  };

  return (
    <div className="h-full flex items-start justify-center pt-16 md:pt-20 px-4">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold tracking-tight">회원가입</h1>
          <p className="mt-1 text-sm text-muted-foreground">회사 이메일로 계정을 만듭니다.</p>
        </div>

        {/* 폼 컨테이너 */}
        <div className="rounded-xl border p-5">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] text-muted-foreground">이메일</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw" className="text-[13px] text-muted-foreground">비밀번호</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="new-password"
                placeholder={`최소 ${minLen}자`}
                value={pw}
                onChange={(e)=>setPw(e.target.value)}
                className="h-10"
                required
              />
              <p className="text-xs text-muted-foreground">
                영문/숫자 조합 권장, 최소 {minLen}자
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw2" className="text-[13px] text-muted-foreground">비밀번호 확인</Label>
              <Input
                id="pw2"
                type="password"
                autoComplete="new-password"
                placeholder="다시 입력"
                value={pw2}
                onChange={(e)=>setPw2(e.target.value)}
                className="h-10"
                required
              />
            </div>

            {err && <Alert>{err}</Alert>}
            {ok && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">
                {ok}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-10">
              {loading && <Spinner />} 회원가입
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있나요?{" "}
              <Link href="/login" className="underline hover:opacity-80">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
