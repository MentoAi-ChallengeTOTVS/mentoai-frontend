"use client";

import clsx from "clsx";
import { ChevronDown, Search } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Filter-Bar (Figma node 59:670) — barra branca com filtros em dropdown +
 * campo de busca à direita. No Figma o exemplo é a tela de Reuniões
 * (Cliente / Período / Status + busca), mas os filtros variam por tela
 * (ex.: Alertas usa Prioridade + status de leitura) — por isso os filtros
 * são passados como children (<FilterSelect />), em vez de fixos.
 */
export function FilterBar({
  children,
  searchLabel = "Pesquisa",
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  className,
}: {
  children?: ReactNode;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full items-end gap-4 rounded-lg border border-neutro-border bg-white p-5",
        className
      )}
      data-node-id="59:670"
      data-name="Filter-Bar"
    >
      {children}
      <div className="h-[100px] min-w-px flex-1" />
      <div className="flex w-80 shrink-0 flex-col items-start gap-1.5">
        <p className="text-legenda text-neutro-muted">{searchLabel}</p>
        <div className="flex h-10 w-full items-center gap-2 rounded-md border border-neutro-border bg-white px-3">
          <Search className="size-4 shrink-0 text-sidebar-muted-2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 text-corpo text-navy placeholder:text-sidebar-muted-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={clsx("flex w-45 shrink-0 flex-col items-start gap-1.5", className)}>
      <p className="text-legenda text-neutro-muted">{label}</p>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-neutro-border bg-white px-3 text-corpo text-navy focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutro-muted" />
      </div>
    </div>
  );
}
