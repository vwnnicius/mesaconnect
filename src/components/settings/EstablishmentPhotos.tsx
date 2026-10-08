"use client";
import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { uploadAsset } from "@/services/workspaceService";
import { AssetImage } from "@/components/ui/AssetImage";
export function EstablishmentPhotos() {
  const w = useWorkspace();
  const [paths, setPaths] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (w.demo) {
      setLoading(false);
      return;
    }
    const { data, error } = await createClient().functions.invoke(
      "workspace-admin",
      { body: { action: "list_unit_media", restaurant_id: w.restaurant.id } },
    );
    if (error || data?.error)
      throw new Error("Não foi possível carregar as fotos.");
    setPaths(data.paths);
    setLoading(false);
  }, [w.demo, w.restaurant.id]);
  useEffect(() => {
    let active = true;
    void load().catch((e) => {
      if (active) {
        setMessage(e.message);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);
  if (!w.platformAdmin) return null;
  return (
    <section className="surface space-y-4">
      <h2>Fotos do estabelecimento</h2>
      <p className="section-description">
        Imagens de {w.restaurant.name}. Selecione outra unidade no cabeçalho
        para personalizá-la.
      </p>
      <label className="action-outline">
        Adicionar fotos
        <input
          className="sr-only"
          type="file"
          multiple
          disabled={busy || w.demo}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            setBusy(true);
            setMessage("");
            void (async () => {
              try {
                for (const file of files)
                  await uploadAsset(file, w.restaurant.id, "photo");
                await load();
                setMessage("Fotos adicionadas.");
              } catch (e) {
                setMessage(
                  e instanceof Error
                    ? e.message
                    : "Não foi possível enviar as fotos.",
                );
                await load().catch(() => {});
              } finally {
                setBusy(false);
              }
            })();
          }}
        />
      </label>
      <small className="block text-muted-foreground">
        JPG, PNG ou WebP · até 2 MB por foto · galeria com as 100 fotos mais
        recentes
      </small>
      {loading && <p role="status">Carregando fotos…</p>}
      {message && <p role="status">{message}</p>}
      {!loading && !paths.length && (
        <p className="section-description">Ainda sem fotos na galeria.</p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => (
          <figure
            key={path}
            className="overflow-hidden rounded-xl aspect-[4/3]"
          >
            <AssetImage
              path={path}
              name={w.restaurant.name}
              kind="cover"
              className="w-full h-full object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
