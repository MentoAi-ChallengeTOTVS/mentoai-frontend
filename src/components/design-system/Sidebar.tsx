"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  Sparkles,
  Star,
} from "lucide-react";
import type { PerfilUsuario } from "@/types/domain";

/**
 * Sidebar/Main (Figma node 15:229) e Sidebar/Admin (105:939).
 *
 * As duas variantes do Figma são, na prática, o mesmo componente com um
 * item extra ("Usuários", dentro de uma seção "Administração") quando o
 * usuário logado tem perfil DIRETOR_COMERCIAL — implementadas aqui como
 * uma única Sidebar parametrizada por `perfil`, em vez de duplicar o
 * componente.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/reunioes", label: "Reuniões", icon: Calendar },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/copiloto", label: "Copiloto", icon: Sparkles },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/usuarios", label: "Usuários", icon: Users },
];

export interface SidebarProps {
  /** Rota ativa (ex.: "/clientes") — controla o item destacado. */
  activeHref: string;
  /** Perfil do usuário logado — DIRETOR_COMERCIAL vê a seção Administração. */
  perfil: PerfilUsuario;
  userName: string;
  /** Abre o painel de Busca Global (item "Buscar" no topo da sidebar). */
  onOpenSearch?: () => void;
  /** Abre o modal "Avaliar o MentoAI" (item extra, fora do backlog oficial). */
  onOpenAvaliacao?: () => void;
  className?: string;
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex h-12 w-full items-center gap-3 px-4"
      data-figma-node={item.href}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">
        <Icon
          className={clsx(
            "size-[18px]",
            active ? "text-white" : "text-sidebar-muted"
          )}
        />
      </span>
      <span
        className={clsx(
          "text-corpo leading-corpo",
          active ? "text-white" : "text-sidebar-muted"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function Sidebar({
  activeHref,
  perfil,
  userName,
  onOpenSearch,
  onOpenAvaliacao,
  className,
}: SidebarProps) {
  const isDiretor = perfil === "DIRETOR_COMERCIAL";

  return (
    <div
      className={clsx(
        "flex h-[900px] w-[220px] flex-col justify-between bg-navy py-6",
        className
      )}
      data-node-id={isDiretor ? "105:939" : "15:229"}
      data-name={isDiretor ? "Sidebar/Admin" : "Sidebar/Main"}
    >
      <div className="flex w-full flex-col items-start gap-8">
        {/* logo-container */}
        <div className="flex items-center gap-2 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-menta text-lg font-bold text-white">
            M
          </div>
          <div className="flex flex-col items-start whitespace-nowrap">
            <p className="text-subtitulo leading-subtitulo font-medium text-white">
              MentoAI
            </p>
            <p className="text-caption leading-caption text-menta-clara">
              by TOTVS
            </p>
          </div>
        </div>

        {/* nav-list */}
        <div className="flex w-full flex-col items-start gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-12 w-full items-center gap-3 px-4 text-left"
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <Search className="size-[18px] text-sidebar-muted" />
            </span>
            <span className="text-corpo leading-corpo text-sidebar-muted">
              Buscar
            </span>
          </button>

          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={activeHref === item.href} />
          ))}

          {isDiretor && (
            <>
              <div className="w-full px-4 pb-2 pt-4">
                <p className="text-caption leading-caption text-neutro-muted">
                  Administração
                </p>
              </div>
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} active={activeHref === item.href} />
              ))}
            </>
          )}

          {/* nav-divider */}
          <div className="w-full px-4 py-[6px]">
            <div className="h-px w-full bg-neutro-border/40" />
          </div>

          {/* nav-item-rating — item extra "Avaliar o MentoAI", fora do backlog oficial */}
          <button
            type="button"
            onClick={onOpenAvaliacao}
            className="flex h-12 w-full items-center gap-3 px-6 text-left"
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <Star className="size-[18px] text-neutro-border" />
            </span>
            <span className="text-corpo leading-corpo text-neutro-border">
              Avaliar o MentoAI
            </span>
          </button>
        </div>
      </div>

      {/* sidebar-footer */}
      <div className="flex w-full items-center gap-3 px-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-menta-clara text-sm font-medium text-navy">
          {userName
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start whitespace-nowrap">
          <p className="w-full truncate text-legenda leading-legenda text-white">
            {userName}
          </p>
          <p className="w-full truncate text-caption leading-caption text-sidebar-muted-2">
            {isDiretor ? "Diretor Comercial" : "Executiva Comercial"}
          </p>
        </div>
      </div>
    </div>
  );
}
