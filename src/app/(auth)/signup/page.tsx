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

    if (error) {
      if (error.code === "user_already_registered") {
        // 이미 가입된 이메일
        setErr(""); // 에러 대신 안내
        setOk("이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정하세요.");
      } else {
        setErr(error.message);
      }
      return;
    }

    // 기본설정: 이메일 확인 필요 → 세션 없음
    if (!data.session) {
      setOk("가입 메일을 보냈습니다. 받은 편지함을 확인하세요.");
    } else {
      location.href = "/";
    }
  };

  return (
    // 헤더 높이(3.5rem)만큼 여백 주고, 화면 상단에 가깝게 배치
    <div className="h-full flex items-start justify-center pt-16 md:pt-24 px-4">
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
