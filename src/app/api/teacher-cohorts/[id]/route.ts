import { NextRequest, NextResponse } from "next/server";
import { admin, getUserFromCookies } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();

  const { data: joined } = await admin()
    .from("teacher_cohorts")
    .select("id, teacher_id, teachers!inner(user_id)")
    .eq("id", id)
    .eq("teachers.user_id", user.id)
    .maybeSingle();
  if (!joined) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.teacher_id) {
    const { data: ok } = await admin()
      .from("teachers")
      .select("id")
      .eq("id", body.teacher_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data, error } = await admin()
    .from("teacher_cohorts")
    .update({
      teacher_id: body.teacher_id ?? undefined,
      name: body.name?.trim() ?? undefined,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const { data: { user } } = await getUserFromCookies();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: row } = await admin()
    .from("teacher_cohorts")
    .select("id, teachers!inner(user_id)")
    .eq("id", id)
    .eq("teachers.user_id", user.id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { error } = await admin().from("teacher_cohorts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
