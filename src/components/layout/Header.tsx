"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCalls } from "@/hooks/useCalls";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { AssetImage } from "@/components/ui/AssetImage";
import { roleName } from "@/lib/workspace-types";
export function Header({
  collapsed,
  toggleSidebar,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
}) {
  const { calls } = useCalls();
  const { restaurant, profile, platformAdmin, units, selectUnit, demo } =
    useWorkspace();
  const count = calls.filter((c) => c.status === "CALLING").length;
  return (
    <header className="workspace-header">
      <div className="workspace-unit">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={
            collapsed ? "Mostrar barra lateral" : "Esconder barra lateral"
          }
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
        <AssetImage
          path={restaurant.logo_path}
          name={restaurant.name}
          kind="logo"
        />
        {platformAdmin ? (
          <select
            aria-label="Estabelecimento"
            value={restaurant.id}
            onChange={(e) => selectUnit(e.target.value)}
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        ) : (
          <span>{restaurant.name}</span>
        )}
        {demo && <small>Demo</small>}
      </div>
      <div className="workspace-header-right">
        <ThemeToggle />
        <span className="workspace-date">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "numeric",
            month: "long",
          })}
        </span>
        <Link
          href="/calls"
          className="workspace-notification"
          aria-label={`${count} chamados aguardando`}
        >
          <Bell size={19} />
          {count > 0 && <b>{count}</b>}
        </Link>
        <Link
          href="/profile"
          className="workspace-person"
          aria-label="Seu perfil"
        >
          <AssetImage
            path={profile.avatar_path}
            name={profile.name}
            kind="avatar"
          />
          <span>
            <strong>{profile.name}</strong>
            <small>
              {platformAdmin ? "Administrador geral" : roleName[profile.role]}
            </small>
          </span>
        </Link>
      </div>
    </header>
  );
}
