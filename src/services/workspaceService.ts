import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BrandRestaurant, StaffProfile } from "@/lib/workspace-types";
import { normalizeLayout, type FloorLayout } from "@/lib/floor-layout";

export async function loadLayout(restaurantId: string, numbers: string[]) {
  if (!isSupabaseConfigured()) {
    const raw = localStorage.getItem(`mesaconnect-floor-${restaurantId}`);
    return {
      layout: normalizeLayout(raw ? JSON.parse(raw) : null, numbers),
      updatedAt: undefined as string | undefined,
    };
  }
  const { data, error } = await createClient()
    .from("restaurant_settings")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar a planta do salão.");
  const row = data as { floor_plan: unknown; updated_at: string } | null;
  return {
    layout: normalizeLayout(row?.floor_plan, numbers),
    updatedAt: row?.updated_at,
  };
}
export async function saveLayout(
  restaurantId: string,
  layout: FloorLayout,
  version?: string,
) {
  if (!isSupabaseConfigured()) {
    localStorage.setItem(
      `mesaconnect-floor-${restaurantId}`,
      JSON.stringify(layout),
    );
    return undefined;
  }
  const client = createClient();
  const row = {
    restaurant_id: restaurantId,
    floor_plan: layout,
    updated_at: new Date().toISOString(),
  };
  const table = client.from("restaurant_settings");
  const stored = { ...row, floor_plan: JSON.parse(JSON.stringify(layout)) };
  const result = version
    ? await table
        .update(stored)
        .eq("restaurant_id", restaurantId)
        .eq("updated_at", version)
        .select()
        .single()
    : await table.insert(stored).select().single();
  if (result.error || !result.data)
    throw new Error(
      "Não foi possível salvar. Verifique sua permissão ou recarregue: outra pessoa pode ter alterado o salão.",
    );
  return (result.data as { updated_at: string }).updated_at;
}
export function storeDemoWorkspace(
  restaurant: BrandRestaurant,
  members: StaffProfile[],
) {
  localStorage.setItem(
    "mesaconnect-workspace-v2",
    JSON.stringify({ restaurant, members }),
  );
}
export async function uploadAsset(
  file: File,
  restaurantId: string,
  kind: "logo" | "cover" | "avatar" | "photo",
  userId?: string,
) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  )
    throw new Error("Use JPG, PNG ou WebP de até 2 MB.");
  if (!isSupabaseConfigured())
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  const bucket = kind === "avatar" ? "staff-photos" : "restaurant-brand";
  const extension = file.type.split("/")[1];
  const path = `${restaurantId}/${kind === "avatar" ? userId : kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await createClient()
    .storage.from(bucket)
    .upload(path, file, { upsert: false });
  if (error)
    throw new Error(
      "Não foi possível enviar a imagem. Verifique sua permissão.",
    );
  return path;
}
