"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { RESTAURANT_DEMO } from "@/lib/constants";
import type { BrandRestaurant, StaffProfile } from "@/lib/workspace-types";

interface Workspace {
  restaurant: BrandRestaurant;
  profile: StaffProfile;
  members: StaffProfile[];
  manager: boolean;
  platformAdmin: boolean;
  units: BrandRestaurant[];
  selectUnit: (id: string) => void;
  demo: boolean;
  refresh: () => Promise<void>;
}
const Context = createContext<Workspace | null>(null);
const demoMembers: StaffProfile[] = [
  {
    id: "local-admin",
    restaurant_id: RESTAURANT_DEMO.id,
    name: "Ana Oliveira",
    role: "OWNER",
    active: true,
    created_at: "",
    sector: "Salão principal",
  },
  {
    id: "local-waiter",
    restaurant_id: RESTAURANT_DEMO.id,
    name: "Carlos Santos",
    role: "WAITER",
    active: true,
    created_at: "",
    sector: "Salão principal",
  },
  {
    id: "local-manager",
    restaurant_id: RESTAURANT_DEMO.id,
    name: "Mariana Costa",
    role: "MANAGER",
    active: true,
    created_at: "",
    sector: "Varanda",
  },
];
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<BrandRestaurant>({
    ...RESTAURANT_DEMO,
    created_at: "",
  });
  const [profile, setProfile] = useState<StaffProfile>(demoMembers[0]);
  const [members, setMembers] = useState<StaffProfile[]>(demoMembers);
  const [ready, setReady] = useState(false);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [units, setUnits] = useState<BrandRestaurant[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [error, setError] = useState("");
  const demo = !isSupabaseConfigured();
  const refresh = useCallback(async () => {
    if (demo) {
      const stored = localStorage.getItem("mesaconnect-workspace-v2");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRestaurant(parsed.restaurant);
          setMembers(parsed.members);
          setProfile(parsed.members[0]);
        } catch {
          localStorage.removeItem("mesaconnect-workspace-v2");
        }
      }
      setReady(true);
      return;
    }
    const client = createClient();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) {
      router.replace("/login");
      return;
    }
    const { data: staff, error: staffError } = await client
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();
    if (staffError || !staff || (staff as StaffProfile).active === false)
      throw new Error(
        "Seu acesso não está ativo. Fale com o administrador do estabelecimento.",
      );
    const actual = staff as StaffProfile;
    const global = auth.user.app_metadata.platform_admin === true;
    setPlatformAdmin(global);
    const { data: available, error: unitsError } = await client
      .from("restaurants")
      .select("*")
      .order("name");
    if (unitsError)
      throw new Error("Não foi possível carregar os estabelecimentos.");
    const choices = ((available || []) as BrandRestaurant[]).filter(
      (unit) => global || unit.id === actual.restaurant_id,
    );
    setUnits(choices);
    const unitId = global
      ? choices.find((unit) => unit.id === selectedUnit)?.id || choices[0]?.id
      : actual.restaurant_id;
    if (!unitId)
      throw new Error(
        "Seu usuário ainda não foi vinculado a um estabelecimento.",
      );
    const [unit, team] = await Promise.all([
      client.from("restaurants").select("*").eq("id", unitId).single(),
      client
        .from("profiles")
        .select("*")
        .eq("restaurant_id", unitId)
        .order("name"),
    ]);
    if (unit.error || !unit.data || team.error)
      throw new Error("Não foi possível abrir o estabelecimento.");
    setRestaurant(unit.data as BrandRestaurant);
    setProfile(actual);
    setMembers((team.data || []) as StaffProfile[]);
    setReady(true);
    setError("");
  }, [demo, router, selectedUnit]);
  useEffect(() => {
    void refresh().catch((err) => setError(err.message));
  }, [refresh]);
  if (error)
    return (
      <div className="workspace-gate">
        <h1>Acesso indisponível</h1>
        <p role="alert">{error}</p>
        <button
          className="action-solid"
          onClick={() => void refresh().catch((err) => setError(err.message))}
        >
          Tentar novamente
        </button>
        <a href="/login">Voltar ao login</a>
      </div>
    );
  if (!ready)
    return (
      <div className="workspace-gate" role="status">
        Abrindo seu estabelecimento…
      </div>
    );
  return (
    <Context.Provider
      value={{
        restaurant,
        profile,
        members,
        manager: platformAdmin || profile.role !== "WAITER",
        platformAdmin,
        units,
        selectUnit: (id) => {
          setReady(false);
          setSelectedUnit(id);
        },
        demo,
        refresh,
      }}
    >
      <div key={restaurant.id}>{children}</div>
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkspaceProvider ausente");
  return value;
}
