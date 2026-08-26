"use client";

import clsx from "clsx";
import Link from "next/link";
import { Calendar, Building2, ChevronRight, Pencil } from "lucide-react";
import { BadgeStatus, BadgePrioridade, BadgeStatusAcesso } from "./Badges";
import type {
  Cliente,
  Reuniao,
  Usuario,
  TipoSinalComercial,
  PrioridadeAlerta,
  StatusProcessamento,
} from "@/types/domain";

/**
 * Rows do Design System — `Row/Reuniao` (59:646), `Row/Usuario` (67:560),
 * `Row/Alerta` (91:1151), `Row/Busca-Cliente` (127:1318),
 * `Row/Busca-Reuniao` (127:1330).
 *
 * Correção 26/08/2026 (issue #88): o ponto de "não lido" da `Row/Alerta`
 * estava em `sinal-alerta` (laranja) — conferindo o componente no frame ROWS
 * do Design System e as linhas da tela Central de Alertas, ele é verde
 * (`menta`) nos dois. O laranja era drift do port original; corrigido aqui em
 * vez de na tela, pra vitrine `/design-system` e tela continuarem iguais.
 */

function formatData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

// Cor do "dot" de sinal na Row/Reuniao — só os 3 tipos com cor fixa têm cor
// própria; os 6 neutros (ver adendo item 2) caem no cinza padrão.
const SINAL_DOT_COLOR: Partial<Record<TipoSinalComercial, string>> = {
  OPORTUNIDADE: "bg-sinal-oportunidade",
  RISCO_CHURN: "bg-sinal-risco-churn",
  CONCORRENCIA: "bg-sinal-concorrencia",
};

// ---------- Row/Reuniao ----------

export function RowReuniao({
  reuniao,
  tiposSinais = [],
  status = "PROCESSADA",
  href,
  className,
}: {
  reuniao: Reuniao;
  /** Tipos de SinalComercial identificados nessa reunião (pra render dos dots). */
  tiposSinais?: TipoSinalComercial[];
  /** Status do processamento da AnaliseIA — Figma só mostra o exemplo "Processada". */
  status?: StatusProcessamento;
  /** Quando presente, a row inteira vira link (Reuniões -> Detalhe da Reunião). */
  href?: string;
  className?: string;
}) {
  const rowClassName = clsx(
    "block w-full border-b border-neutro-border bg-white",
    href && "transition-colors hover:bg-neutro-background",
    className
  );

  const sinaisContent =
    tiposSinais.length > 0 ? (
      <>
        <div className="flex items-center gap-1.5">
          {tiposSinais.slice(0, 3).map((tipo, i) => (
            <span
              key={i}
              className={clsx(
                "size-2.5 shrink-0 rounded-[5px]",
                SINAL_DOT_COLOR[tipo] ?? "bg-neutro-muted"
              )}
            />
          ))}
        </div>
        <p className="whitespace-nowrap text-[11px] text-neutro-muted">
          {tiposSinais.length} {tiposSinais.length === 1 ? "sinal" : "sinais"}
        </p>
      </>
    ) : (
      <p className="whitespace-nowrap text-corpo text-neutro-muted">—</p>
    );

  const content = (
    <>
      {/* Linha de tabela — telas lg+, layout original do Figma. */}
      <div className="hidden w-full items-center gap-4 px-6 py-4 lg:flex">
        <p className="flex-1 truncate text-subtitulo font-medium text-navy">
          {reuniao.cliente.nome}
        </p>
        <p className="w-40 shrink-0 text-corpo text-sidebar-muted-2">
          {formatData(reuniao.dataReuniao)}
        </p>
        <p className="w-30 shrink-0 text-corpo text-sidebar-muted-2">
          {reuniao.duracaoMinutos} min
        </p>
        <div className="flex w-40 shrink-0 items-center">
          <BadgeStatus status={status} />
        </div>
        <div className="flex w-50 shrink-0 items-center gap-1.5">{sinaisContent}</div>
      </div>

      {/* Card empilhado — abaixo de lg (responsivo, 25/08/2026). */}
      <div className="flex w-full flex-col items-start gap-2.5 px-4 py-4 lg:hidden">
        <div className="flex w-full items-start justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-subtitulo font-medium text-navy">
            {reuniao.cliente.nome}
          </p>
          <BadgeStatus status={status} />
        </div>
        <div className="flex items-center gap-3 text-caption leading-caption text-sidebar-muted-2">
          <span>{formatData(reuniao.dataReuniao)}</span>
          <span>•</span>
          <span>{reuniao.duracaoMinutos} min</span>
        </div>
        <div className="flex items-center gap-1.5">{sinaisContent}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName} data-node-id="59:646" data-name="Row/Reuniao">
        {content}
      </Link>
    );
  }

  return (
    <div className={rowClassName} data-node-id="59:646" data-name="Row/Reuniao">
      {content}
    </div>
  );
}

// ---------- Row/Usuario ----------

const PERFIL_LABEL: Record<Usuario["perfil"], string> = {
  EXECUTIVO_COMERCIAL: "Executivo Comercial",
  DIRETOR_COMERCIAL: "Diretor Comercial",
};

export function RowUsuario({
  usuario,
  onEdit,
  className,
}: {
  usuario: Usuario;
  onEdit?: (usuario: Usuario) => void;
  className?: string;
}) {
  return (
    <div
      className={clsx("w-full border-b border-neutro-border bg-[#f8fafc]", className)}
      data-node-id="67:560"
      data-name="Row/Usuario"
    >
      {/* Linha de tabela — telas lg+, layout original do Figma. */}
      <div className="hidden w-full items-center gap-4 px-6 py-4 lg:flex">
        <p className="flex-1 text-corpo text-navy">{usuario.nome}</p>
        <p className="w-60 shrink-0 text-corpo text-neutro-muted">{usuario.email}</p>
        <p className="w-45 shrink-0 text-corpo text-neutro-dark">
          {PERFIL_LABEL[usuario.perfil]}
        </p>
        <div className="flex w-30 shrink-0 items-center">
          <BadgeStatusAcesso ativo={usuario.ativo} />
        </div>
        <div className="flex w-20 shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={() => onEdit?.(usuario)}
            className="flex items-center justify-center rounded bg-neutro-background p-2"
            aria-label="Editar usuário"
          >
            <Pencil className="size-3.5 text-neutro-dark" />
          </button>
        </div>
      </div>

      {/* Card empilhado — abaixo de lg (responsivo, 25/08/2026). */}
      <div className="flex w-full flex-col items-start gap-2.5 px-4 py-4 lg:hidden">
        <div className="flex w-full items-start justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-corpo font-medium text-navy">{usuario.nome}</p>
          <button
            type="button"
            onClick={() => onEdit?.(usuario)}
            className="flex shrink-0 items-center justify-center rounded bg-neutro-background p-1.5"
            aria-label="Editar usuário"
          >
            <Pencil className="size-3.5 text-neutro-dark" />
          </button>
        </div>
        <p className="w-full truncate text-caption leading-caption text-neutro-muted">{usuario.email}</p>
        <div className="flex w-full items-center justify-between gap-3 pt-1">
          <p className="text-legenda leading-legenda text-neutro-dark">
            {PERFIL_LABEL[usuario.perfil]}
          </p>
          <BadgeStatusAcesso ativo={usuario.ativo} />
        </div>
      </div>
    </div>
  );
}

// ---------- Row/Alerta ----------

export function RowAlerta({
  clienteNome,
  motivo,
  prioridade,
  lido,
  className,
}: {
  clienteNome: string;
  motivo: string;
  prioridade: PrioridadeAlerta;
  lido: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        // Responsivo: abaixo de sm a linha empilha (cliente/motivo em cima,
        // prioridade + status embaixo), mesmo racional das outras rows.
        "flex w-full flex-col items-start gap-2 border-b border-neutro-border bg-white px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4",
        className
      )}
      data-node-id="91:1151"
      data-name="Row/Alerta"
    >
      <div className="flex w-full min-w-0 items-center gap-3 sm:w-55 sm:shrink-0">
        {/* O ponto de "não lido" ocupa lugar fixo: numa linha já lida ele fica
            invisível em vez de sumir, senão o nome do cliente escorrega pra
            esquerda e as linhas param de alinhar (é assim no Figma). */}
        <span
          className={clsx("size-2.5 shrink-0 rounded-full", lido ? "invisible" : "bg-menta")}
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 truncate text-corpo text-navy">{clienteNome}</p>
      </div>
      {/* Linha já lida fica com o motivo em cinza — é o que separa lida de não
          lida visualmente na tela de Alertas, junto com o ponto acima. */}
      <p className={clsx("flex-1 text-corpo", lido ? "text-neutro-muted" : "text-neutro-dark")}>
        {motivo}
      </p>
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
        <div className="flex shrink-0 items-start sm:w-30 sm:justify-center">
          <BadgePrioridade nivel={prioridade} />
        </div>
        <div className="flex shrink-0 items-start justify-end sm:w-30">
          <p
            className={clsx(
              "whitespace-nowrap text-caption",
              lido ? "text-neutro-muted" : "text-menta"
            )}
          >
            {lido ? "Lido" : "Não lido"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Row/Busca-Cliente ----------

export function RowBuscaCliente({
  cliente,
  className,
}: {
  cliente: Cliente;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full items-center gap-3 rounded-md border-b border-neutro-border bg-white px-4 py-2.5",
        className
      )}
      data-node-id="127:1318"
      data-name="Row/Busca-Cliente"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-menta-suave">
        <Building2 className="size-4 text-menta" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <p className="text-corpo font-medium text-neutro-dark">{cliente.nome}</p>
        <p className="text-legenda text-neutro-muted">
          Segmento: <span className="font-medium text-neutro-dark">{cliente.segmento}</span>
        </p>
      </div>
      <ChevronRight className="size-3.5 shrink-0 text-neutro-muted" />
    </div>
  );
}

// ---------- Row/Busca-Reuniao ----------

export function RowBuscaReuniao({
  reuniao,
  className,
}: {
  reuniao: Reuniao;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full items-center gap-3 rounded-md border-b border-neutro-border bg-white px-4 py-2.5",
        className
      )}
      data-node-id="127:1330"
      data-name="Row/Busca-Reuniao"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-navy/[0.07]">
        <Calendar className="size-4 text-navy" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <p className="truncate text-corpo font-medium text-neutro-dark">
          {reuniao.cliente.nome}
        </p>
        <p className="text-legenda text-neutro-muted">
          Reunião realizada em:{" "}
          <span className="font-medium text-neutro-dark">{formatData(reuniao.dataReuniao)}</span>
        </p>
      </div>
    </div>
  );
}
