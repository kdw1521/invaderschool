import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();

  // 소유 검증
  const { data: row } = await admin().from("teachers").select("id").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data, error } = await admin()
    .from("teachers")
    .update({ name: body.name?.trim() ?? undefined })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 소유 검증
  const { data: row } = await admin().from("teachers").select("id").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { error } = await admin().from("teachers").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
