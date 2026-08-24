"use client";

import clsx from "clsx";
import type { Cliente } from "@/types/domain";

/**
 * Table/Row-Cliente (105:1235) — linha da tabela de Clientes, e os
 * companheiros `table-header`/`table-footer` do mesmo card (105:1229 /
 * 105:1281), incluídos aqui porque completam a tabela e são usados juntos
 * na tela Clientes (feature F01, Breno).
 *
 * Usei o frame "crm-clientes-mentoai" atual (105:1228), não o mais antigo
 * (8:52) que já está marcado como stale em
 * `claude/decisoes_tecnicas_stack.md`.
 */

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ---------- Badge/Porte — chip neutro simples, não é um badge semântico de sinal ----------

export function BadgePorte({ porte, className }: { porte: string; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded bg-neutro-muted px-2 py-1 text-caption leading-caption text-white",
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
  onVerDetalhes,
  className,
}: {
  cliente: Cliente;
  /** O Figma mostra a 1ª linha da tabela já listrada — controlado pelo chamador. */
  striped?: boolean;
  onVerDetalhes?: () => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full items-center gap-4 border-b border-neutro-border px-6 py-4",
        striped ? "bg-[#f8fafc]" : "bg-white",
        className
      )}
      data-node-id="105:1235"
      data-name="Table/Row-Cliente"
    >
      <p className="flex-1 truncate text-corpo text-navy">{cliente.nome}</p>
      <p className="w-50 shrink-0 truncate text-corpo text-sidebar-muted-2">{cliente.segmento}</p>
      <div className="flex w-30 shrink-0 items-center">
        <BadgePorte porte={cliente.porte} />
      </div>
      <p className="w-40 shrink-0 text-corpo text-sidebar-muted-2">{formatData(cliente.criacao)}</p>
      <div className="flex w-30 shrink-0 items-center">
        <button type="button" onClick={onVerDetalhes} className="text-corpo text-menta">
          Ver detalhes
        </button>
      </div>
    </div>
  );
}

// ---------- table-header ----------

export function TabelaClientesCabecalho({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex w-full items-start gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda text-sidebar-muted-2",
        className
      )}
      data-node-id="105:1229"
      data-name="table-header"
    >
      <p className="flex-1">Nome / Razão Social</p>
      <p className="w-50 shrink-0">Segmento</p>
      <p className="w-30 shrink-0">Porte</p>
      <p className="w-40 shrink-0">Data de Cadastro</p>
      <p className="w-30 shrink-0">Ação</p>
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
      className={clsx("flex w-full items-center justify-between bg-white px-6 py-3.5", className)}
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
