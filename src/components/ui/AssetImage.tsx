"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
export function AssetImage({
  path,
  kind = "avatar",
  name = "",
  className = "",
}: {
  path?: string | null;
  kind?: "avatar" | "logo" | "cover";
  name?: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    setUrl("");
    if (!path) return;
    if (!isSupabaseConfigured()) {
      if (path.startsWith("data:image/")) setUrl(path);
      return;
    }
    if (kind !== "avatar") {
      setUrl(
        createClient().storage.from("restaurant-brand").getPublicUrl(path).data
          .publicUrl,
      );
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const sign = async () => {
      const result = await createClient()
        .storage.from("staff-photos")
        .createSignedUrl(path, 3600);
      if (active) {
        if (result.data) setUrl(result.data.signedUrl);
        timer = setTimeout(sign, 3000000);
      }
    };
    void sign();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [path, kind]);
  return url ? (
    <img
      src={url}
      alt={name}
      className={className}
      onError={() => setUrl("")}
    />
  ) : (
    <span className={`${className} avatar-fallback`} aria-label={name}>
      {name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </span>
  );
}
