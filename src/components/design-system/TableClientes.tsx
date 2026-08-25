"use client";

import clsx from "clsx";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { Cliente } from "@/types/domain";

/**
 * Table/Row-Cliente (105:1235) — linha da tabela de Clientes, e os
 * companheiros `table-header`/`table-footer` do mesmo card (105:1229 /
 * 105:1281), incluídos aqui porque completam a tabela e são usados juntos
 * na tela Clientes (feature F02, Breno — issue #64).
 *
 * Usei o frame "crm-clientes-mentoai" atual (105:1228), não o mais antigo
 * (8:52) que já está marcado como stale em
 * `claude/decisoes_tecnicas_stack.md`.
 */

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ---------- Badge/Porte — chip neutro simples, não é um badge semântico de sinal ----------
// Corrigido em 24/08/2026: a 1ª versão usava uma cor fixa (neutro-muted) pra
// qualquer porte. Ao implementar a tela real (issue #64), `get_design_context`
// no frame atual mostrou 3 cores diferentes por porte — Pequeno usa fundo
// claro com texto escuro (contraste invertido), Médio/Grande usam fundo
// escuro com texto branco. Corrigido pra bater com o Figma de verdade.

const PORTE_ESTILO: Record<string, string> = {
  Pequeno: "bg-neutro-border text-neutro-dark",
  Médio: "bg-neutro-muted text-white",
  Grande: "bg-neutro-dark text-white",
};

export function BadgePorte({ porte, className }: { porte: string; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-1 text-caption leading-caption",
        PORTE_ESTILO[porte] ?? "bg-neutro-muted text-white",
        className
      )}
    >
      {porte}
    </span>
  );
}

// ---------- Table/Row-Cliente ----------

export function RowCliente({
  cliente,
  striped = false,
  onEditar,
  className,
}: {
  cliente: Cliente;
  /** O Figma mostra a 1ª linha da tabela já listrada — controlado pelo chamador. */
  striped?: boolean;
  /** Abre o painel de cadastro em modo de edição (ver nota de escopo em `clientes/page.tsx`). */
  onEditar?: (cliente: Cliente) => void;
  className?: string;
}) {
  const bg = striped ? "bg-[#f8fafc]" : "bg-white";

  return (
    <div
      className={clsx("w-full border-b border-neutro-border", bg, className)}
      data-node-id="105:1235"
      data-name="Table/Row-Cliente"
    >
      {/* Linha de tabela — telas lg+, layout original do Figma. */}
      <div className="hidden w-full items-center gap-4 px-6 py-4 lg:flex">
        <p className="flex-1 truncate text-corpo text-navy">{cliente.nome}</p>
        <p className="w-50 shrink-0 truncate text-corpo text-sidebar-muted-2">{cliente.segmento}</p>
        <div className="flex w-30 shrink-0 items-center">
          <BadgePorte porte={cliente.porte} />
        </div>
        <p className="w-40 shrink-0 text-corpo text-sidebar-muted-2">{formatData(cliente.criacao)}</p>
        <div className="flex w-40 shrink-0 items-center gap-3">
          <Link href={`/clientes/${cliente.id}`} className="text-corpo text-menta">
            Ver detalhes
          </Link>
          <button
            type="button"
            onClick={() => onEditar?.(cliente)}
            aria-label="Editar cliente"
            className="flex items-center justify-center rounded bg-neutro-background p-1.5"
          >
            <Pencil className="size-3.5 text-neutro-dark" />
          </button>
        </div>
      </div>

      {/* Card empilhado — abaixo de lg, a tabela vira uma lista de cards (responsivo, 25/08/2026). */}
      <div className="flex w-full flex-col items-start gap-2.5 px-4 py-4 lg:hidden">
        <div className="flex w-full items-start justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-corpo font-medium text-navy">{cliente.nome}</p>
          <BadgePorte porte={cliente.porte} className="shrink-0" />
        </div>
        <p className="text-caption leading-caption text-sidebar-muted-2">{cliente.segmento}</p>
        <div className="flex w-full items-center justify-between gap-3 pt-1">
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Cadastrado em {formatData(cliente.criacao)}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link href={`/clientes/${cliente.id}`} className="text-legenda font-medium text-menta">
              Ver detalhes
            </Link>
            <button
              type="button"
              onClick={() => onEditar?.(cliente)}
              aria-label="Editar cliente"
              className="flex items-center justify-center rounded bg-neutro-background p-1.5"
            >
              <Pencil className="size-3.5 text-neutro-dark" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- table-header ----------

export function TabelaClientesCabecalho({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        // Responsivo (25/08/2026): cabeçalho da tabela só faz sentido no
        // layout de colunas fixas de lg+ — some quando RowCliente vira card.
        "hidden w-full items-start gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda text-sidebar-muted-2 lg:flex",
        className
      )}
      data-node-id="105:1229"
      data-name="table-header"
    >
      <p className="flex-1">Nome / Razão Social</p>
      <p className="w-50 shrink-0">Segmento</p>
      <p className="w-30 shrink-0">Porte</p>
      <p className="w-40 shrink-0">Data de Cadastro</p>
      <p className="w-40 shrink-0">Ação</p>
    </div>
  );
}

// ---------- table-footer ----------

export function TabelaClientesRodape({
  exibindo,
  total,
  onAnterior,
  onProximo,
  podeAnterior = true,
  podeProximo = true,
  className,
}: {
  exibindo: number;
  total: number;
  onAnterior?: () => void;
  onProximo?: () => void;
  podeAnterior?: boolean;
  podeProximo?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-stretch gap-3 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
      data-node-id="105:1281"
      data-name="table-footer"
    >
      <p className="whitespace-nowrap text-legenda text-sidebar-muted-2">
        Exibindo {exibindo} de {total} clientes
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAnterior}
          disabled={!podeAnterior}
          className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onProximo}
          disabled={!podeProximo}
          className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
