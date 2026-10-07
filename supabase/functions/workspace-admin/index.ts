import { createClient } from "npm:@supabase/supabase-js@2.48.1";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};
Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  const reply = (body: unknown, status = 200) =>
    Response.json(body, { status, headers });
  if (request.method !== "POST")
    return reply({ error: "Método inválido" }, 405);
  const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token) return reply({ error: "Entre na sua conta" }, 401);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return reply({ error: "Sessão inválida" }, 401);
  const global = auth.user.app_metadata.platform_admin === true;
  const { data: actor } = await admin
    .from("profiles")
    .select("restaurant_id,role,active")
    .eq("id", auth.user.id)
    .single();
  if (!global && (!actor?.active || !["OWNER", "MANAGER"].includes(actor.role)))
    return reply({ error: "Sem permissão" }, 403);
  try {
    const body = await request.json();
    if (body.action === "check_access")
      return reply({ authorized: true, platform_admin: global });
    if (body.action === "create_unit") {
      if (!global) return reply({ error: "Somente administrador geral" }, 403);
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        typeof body.slug !== "string" ||
        !/^[a-z0-9-]{3,60}$/.test(body.slug)
      )
        return reply({ error: "Nome e endereço inválidos" }, 400);
      const { data, error } = await admin
        .from("restaurants")
        .insert({ name: body.name.trim().slice(0, 100), slug: body.slug })
        .select()
        .single();
      if (error)
        return reply(
          {
            error:
              "Não foi possível criar o estabelecimento. Verifique o endereço.",
          },
          400,
        );
      const count = Math.min(
        80,
        Math.max(1, Math.floor(Number(body.tables) || 12)),
      );
      const result = await admin.from("tables").insert(
        Array.from({ length: count }, (_, i) => ({
          restaurant_id: data.id,
          number: String(i + 1).padStart(2, "0"),
          status: "AVAILABLE",
        })),
      );
      if (result.error)
        return reply(
          {
            error: "Estabelecimento criado; cadastro das mesas pendente.",
            id: data.id,
          },
          409,
        );
      return reply({ id: data.id }, 201);
    }
    if (body.action !== "create_staff")
      return reply({ error: "Ação inválida" }, 400);
    const unit = body.restaurant_id;
    if (!global && unit !== actor.restaurant_id)
      return reply({ error: "Estabelecimento não autorizado" }, 403);
    const roles =
      global || actor.role === "OWNER"
        ? ["OWNER", "MANAGER", "WAITER"]
        : ["WAITER"];
    if (
      !roles.includes(body.role) ||
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
      typeof body.name !== "string" ||
      !body.name.trim() ||
      typeof body.password !== "string" ||
      body.password.length < 12
    )
      return reply(
        {
          error:
            "Preencha os dados e use uma senha com pelo menos 12 caracteres.",
        },
        400,
      );
    const { data: unitData } = await admin
      .from("restaurants")
      .select("id")
      .eq("id", unit)
      .single();
    if (!unitData) return reply({ error: "Estabelecimento inválido" }, 400);
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email.trim(),
      password: body.password,
      email_confirm: true,
      app_metadata: { restaurant_id: unit, role: body.role },
      user_metadata: { name: body.name.trim().slice(0, 100) },
    });
    return error
      ? reply(
          {
            error:
              "Não foi possível criar o usuário. Verifique se o e-mail já possui uma conta.",
          },
          400,
        )
      : reply({ id: data.user.id }, 201);
  } catch {
    return reply({ error: "Não foi possível processar os dados" }, 400);
  }
});
