import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  const path = next === "/reset-password" ? next : "/dashboard";
  if (code) {
    const { error } = await (
      await createServerSupabaseClient()
    ).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(path, request.url));
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
