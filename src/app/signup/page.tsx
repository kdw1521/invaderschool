"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        // 이메일 확인 후 돌아올 주소(도메인에 맞게 수정)
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
      },
    });
    setLoading(false);

    if (error) return setErr(error.message);

    // 기본설정: 이메일 확인 필요 → 세션 없음
    if (!data.session) {
      setOk("가입 메일을 보냈습니다. 받은 편지함에서 확인 후 로그인하세요.");
    } else {
      // 프로젝트가 auto-confirm이면 바로 세션 존재 → 홈으로
      location.href = "/";
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>회사 이메일로 계정을 만듭니다.</CardDescription>
          </CardHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" inputMode="email" autoComplete="email"
                     placeholder="name@company.com" value={email}
                     onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="pw">비밀번호</Label>
              <Input id="pw" type="password" autoComplete="new-password"
                     placeholder="최소 8자" value={pw}
                     onChange={e=>setPw(e.target.value)} required />
              <p className="mt-1 text-xs text-slate-500">영문/숫자 조합 권장, 최소 {minLen}자</p>
            </div>

            <div>
              <Label htmlFor="pw2">비밀번호 확인</Label>
              <Input id="pw2" type="password" autoComplete="new-password"
                     placeholder="다시 입력" value={pw2}
                     onChange={e=>setPw2(e.target.value)} required />
            </div>

            {err && <Alert>{err}</Alert>}
            {ok && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">{ok}</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner />} 회원가입
            </Button>

            <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
              이미 계정이 있나요? <a href="/login" className="underline hover:opacity-80">로그인</a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
