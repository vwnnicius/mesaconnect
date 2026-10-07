import { NextRequest, NextResponse } from "next/server";
import { processDeviceEvent } from "@/services/deviceService";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return NextResponse.json(
      { error: "Token do dispositivo obrigatório" },
      { status: 401 },
    );
  if (Number(request.headers.get("content-length") || 0) > 4096)
    return NextResponse.json({ error: "Evento muito grande" }, { status: 413 });
  try {
    const body = await request.text();
    if (body.length > 4096)
      return NextResponse.json(
        { error: "Evento muito grande" },
        { status: 413 },
      );
    const data = JSON.parse(body);
    if (
      typeof data.device_uid !== "string" ||
      data.device_uid.length > 100 ||
      !["CALL", "DO_NOT_DISTURB", "RESET", "HEARTBEAT"].includes(
        data.event_type,
      )
    )
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
    const result = await processDeviceEvent(
      { ...data, token },
      await createServerSupabaseClient(),
    );
    return NextResponse.json(result, { status: result.success ? 200 : 403 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar o evento" },
      { status: 400 },
    );
  }
}
