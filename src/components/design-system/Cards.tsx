"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowDown, ArrowUp, CloudUpload, Eye, EyeOff } from "lucide-react";
import {
  BadgeGeradoPorIA,
  BadgePrioridade,
  BadgeSinalComercial,
  BadgeStatus,
} from "./Badges";
import { ButtonPrimary } from "./Button";
import type { AnaliseIA, PrioridadeAlerta, SinalComercial } from "@/types/domain";

/**
 * Cards do Design System — os 11 `Card/*` do frame CARDS no Figma
 * (node 82:921): Upload-Transcricao (19:123), Login-Form (67:517),
 * KPI (82:703), Sinais-Risco (47:563), Oportunidades (47:577),
 * Sugestao-Estrategica (127:1456), Clientes-Atencao (82:716),
 * Tendencia-Sinais (82:848), Resumo-Executivo (38:241),
 * Historico-Analises (38:473), Sinais-Comerciais (38:343).
 *
 * Nota de cor: vários desses cards usam no Figma dois hex "soltos" (sem
 * variável vinculada) pra título (#1c3c3a) e texto de corpo (#444441),
 * enquanto os cards vizinhos no mesmo arquivo usam a variável
 * `Neutro/Dark` (#2c2c2a) pros mesmos papéis — confirmado via
 * `get_variable_defs` (nenhum dos dois hex aparece vinculado em nenhum
 * dos 3 nodes inspecionados). A diferença visual é imperceptível, então
 * tratamos como drift de cópia e unificamos tudo em `text-neutro-dark`
 * em vez de criar um token quase-duplicado — registrado no adendo de
 * identidade visual do projeto.
 *
 * Nota de largura: o Figma define largura fixa por card (ex.: 480px,
 * 1156px, 218px) porque cada um vive numa posição fixa no frame CARDS.
 * Aqui todos são `w-full` — quem controla a largura real é o grid da
 * tela onde o card é usado (ver comentário de largura de referência em
 * cada um).
 */

// ---------- Card/Upload-Transcricao (704px de referência) ----------

export function CardUploadTranscricao({
  onFilesSelected,
  acceptDescription = "Formatos aceitos: .txt, .docx, .pdf, .srt",
  accept = ".txt,.docx,.pdf,.srt",
  className,
}: {
  onFilesSelected?: (files: FileList) => void;
  acceptDescription?: string;
  accept?: string;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) onFilesSelected?.(e.dataTransfer.files);
      }}
      className={clsx(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-menta-clara bg-menta-suave p-10 text-center transition-colors",
        isDragging && "bg-menta-clara/25",
        className
      )}
      data-node-id="19:123"
      data-name="Card/Upload-Transcricao"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected?.(e.target.files)}
      />
      <div className="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.03)]">
        <CloudUpload className="size-6 text-menta" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-subtitulo font-medium text-navy">
          Arraste o arquivo ou clique para selecionar
        </p>
        <p className="text-corpo text-neutro-muted">{acceptDescription}</p>
      </div>
    </div>
  );
}

// ---------- Card/Login-Form (420px de referência) ----------

export function CardLoginForm({
  onSubmit,
  forgotPasswordHref = "/esqueci-senha",
  loading = false,
  className,
}: {
  onSubmit?: (data: { email: string; senha: string }) => void;
  forgotPasswordHref?: string;
  loading?: boolean;
  className?: string;
}) {
  const [showSenha, setShowSenha] = useState(false);

  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-8 rounded-xl bg-white p-10 shadow-[0px_8px_12px_rgba(15,42,69,0.08)]",
        className
      )}
      data-node-id="67:517"
      data-name="Card/Login-Form"
    >
      <div className="flex w-full flex-col items-start gap-2">
        <p className="text-[20px] leading-[28px] font-semibold text-neutro-dark">
          Entrar na plataforma
        </p>
        <p className="text-corpo text-neutro-muted">Acesse sua conta para continuar</p>
      </div>

      <form
        className="flex w-full flex-col items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          onSubmit?.({
            email: String(data.get("email") ?? ""),
            senha: String(data.get("senha") ?? ""),
          });
        }}
      >
        <div className="flex w-full flex-col gap-5">
          <label className="flex w-full flex-col items-start gap-1.5">
            <span className="text-[12px] leading-4 font-medium text-neutro-muted">E-mail</span>
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="h-11 w-full rounded-lg border border-neutro-border px-3 text-corpo text-neutro-dark placeholder:text-neutro-muted focus:outline-none focus:ring-2 focus:ring-menta-clara"
            />
          </label>
          <label className="flex w-full flex-col items-start gap-1.5">
            <span className="text-[12px] leading-4 font-medium text-neutro-muted">Senha</span>
            <div className="flex h-11 w-full items-center justify-between rounded-lg border border-neutro-border px-3">
              <input
                type={showSenha ? "text" : "password"}
                name="senha"
                required
                placeholder="••••••••"
                className="w-full flex-1 text-corpo text-neutro-dark placeholder:text-neutro-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                className="shrink-0 text-neutro-muted"
              >
                {showSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <ButtonPrimary type="submit" disabled={loading} className="w-full justify-center">
            {loading ? "Entrando..." : "Entrar"}
          </ButtonPrimary>
          <Link
            href={forgotPasswordHref}
            className="text-[13px] leading-[18px] font-medium text-menta"
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  );
}

// ---------- Card/KPI (218px de referência — usado 4x lado a lado no Dashboard) ----------

export function CardKPI({
  titulo,
  valor,
  tendencia,
  className,
}: {
  titulo: string;
  valor: string | number;
  tendencia?: { direcao: "up" | "down"; texto: string };
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-3 rounded-lg border border-neutro-border bg-white p-5",
        className
      )}
      data-node-id="82:703"
      data-name="Card/KPI"
    >
      <p className="text-legenda text-neutro-muted">{titulo}</p>
      <p className="text-[36px] leading-[42px] font-bold text-neutro-dark">{valor}</p>
      {tendencia && (
        <div
          className={clsx(
            "flex items-center gap-1 text-caption leading-caption",
            tendencia.direcao === "up" ? "text-menta" : "text-sinal-risco-churn"
          )}
        >
          {tendencia.direcao === "up" ? (
            <ArrowUp className="size-2.5" />
          ) : (
            <ArrowDown className="size-2.5" />
          )}
          <span className="whitespace-nowrap">{tendencia.texto}</span>
        </div>
      )}
    </div>
  );
}

// ---------- Card/Sinais-Risco (47:563) e Card/Oportunidades (47:577) ----------
// Mesma estrutura visual (indicador + título, número grande + legenda, lista
// com bullet) — implementadas em cima de um componente interno compartilhado.

function CardListaIndicador({
  corIndicador,
  corNumero,
  titulo,
  quantidade,
  legenda,
  itens,
  nodeId,
  nodeName,
  className,
}: {
  corIndicador: string;
  corNumero: string;
  titulo: string;
  quantidade: number;
  legenda: string;
  itens: string[];
  nodeId: string;
  nodeName: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id={nodeId}
      data-name={nodeName}
    >
      <div className="flex w-full items-center gap-2">
        <span className={clsx("size-2 shrink-0 rounded-full", corIndicador)} />
        <p className="text-subtitulo font-medium text-neutro-dark">{titulo}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <p className={clsx("text-[48px] leading-[48px] font-bold", corNumero)}>{quantidade}</p>
        <p className="whitespace-nowrap text-corpo text-neutro-muted">{legenda}</p>
      </div>
      <div className="flex w-full flex-col items-start gap-2.5 text-corpo text-neutro-dark">
        {itens.map((item, i) => (
          <p key={i} className="w-full">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function CardSinaisRisco({
  quantidade,
  itens,
  className,
}: {
  quantidade: number;
  itens: string[];
  className?: string;
}) {
  return (
    <CardListaIndicador
      corIndicador="bg-sinal-risco-churn"
      corNumero="text-sinal-risco-churn"
      titulo="Sinais de Risco"
      quantidade={quantidade}
      legenda="sinais identificados no histórico"
      itens={itens}
      nodeId="47:563"
      nodeName="Card/Sinais-Risco"
      className={className}
    />
  );
}

export function CardOportunidades({
  quantidade,
  itens,
  className,
}: {
  quantidade: number;
  itens: string[];
  className?: string;
}) {
  return (
    <CardListaIndicador
      corIndicador="bg-sinal-oportunidade"
      corNumero="text-sinal-oportunidade"
      titulo="Oportunidades"
      quantidade={quantidade}
      legenda="oportunidades identificadas"
      itens={itens}
      nodeId="47:577"
      nodeName="Card/Oportunidades"
      className={className}
    />
  );
}

// ---------- Card/Sugestao-Estrategica (127:1456) — feature F11, Breno ----------
// O domínio hoje não tem uma entidade "SugestaoEstrategica" separada; a
// leitura mais provável é `Insight` com `tipo: "ESTRATEGICO"`, que só tem um
// campo `descricao` — sem a divisão título/justificativa que o Figma mostra.
// Por ora o componente recebe as duas strings explicitamente; quando a F11
// for implementada de fato (backend), vale revisitar se `Insight.descricao`
// deveria virar dois campos ou se o título é derivado no frontend.

export function CardSugestaoEstrategica({
  titulo,
  justificativa,
  className,
}: {
  titulo: string;
  justificativa: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-3 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="127:1456"
      data-name="Card/Sugestao-Estrategica"
    >
      <p className="w-full text-subtitulo font-medium text-neutro-dark">{titulo}</p>
      <p className="w-full text-corpo text-neutro-dark">{justificativa}</p>
    </div>
  );
}

// ---------- Card/Clientes-Atencao (711px de referência) ----------

export interface ClienteAtencaoRow {
  cliente: string;
  motivo: string;
  prioridade: PrioridadeAlerta;
}

export function CardClientesAtencao({
  clientes,
  className,
}: {
  clientes: ClienteAtencaoRow[];
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="82:716"
      data-name="Card/Clientes-Atencao"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-subtitulo font-medium text-neutro-dark">
            Clientes que Precisam de Atenção
          </p>
          <BadgeGeradoPorIA />
        </div>
        <div className="flex items-start rounded-xl bg-sinal-risco-churn px-2.5 py-1">
          <p className="whitespace-nowrap text-caption leading-caption text-white">
            {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-start overflow-hidden rounded-md">
        <div className="flex w-full items-start border-b border-neutro-border bg-[#f8fafc] px-3 py-2.5 text-legenda text-neutro-muted">
          <p className="w-45 shrink-0">CLIENTE</p>
          <p className="flex-1">MOTIVO DO ALERTA</p>
          <p className="w-25 shrink-0 text-center">PRIORIDADE</p>
        </div>
        {clientes.map((row, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center border-b border-neutro-border px-3 py-3.5 last:border-b-0",
              i % 2 === 1 && "bg-[#f8fafc]"
            )}
          >
            <p className="w-45 shrink-0 truncate text-corpo text-navy">{row.cliente}</p>
            <p className="flex-1 truncate text-corpo text-neutro-dark">{row.motivo}</p>
            <div className="flex w-25 shrink-0 items-start justify-center">
              <BadgePrioridade nivel={row.prioridade} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Card/Tendencia-Sinais (82:848) ----------
// O Figma representa a linha do tempo com 3 imagens de sparkline exportadas
// (SVGs estáticos) — mas isso é um gráfico movido a dado real (varia por
// cliente/período), não um ícone fixo, então não faz sentido versionar como
// asset estático. Reconstruído aqui como SVG gerado a partir de `pontos`,
// igual a qualquer lib de charting faria — mesma decisão de espírito que a
// troca de ícones por lucide-react (documentada no README).

export interface TendenciaMes {
  mes: string;
  oportunidades: number;
  alertas: number;
  riscos: number;
}

export interface ResumoGeralSinais {
  oportunidades: number;
  alertas: number;
  riscos: number;
  concorrencia: number;
}

function LegendaItem({ cor, label }: { cor: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={clsx("size-2 shrink-0 rounded-full", cor)} />
      <span className="whitespace-nowrap text-caption leading-caption text-neutro-muted">
        {label}
      </span>
    </div>
  );
}

const CHART_WIDTH = 380;
const CHART_HEIGHT = 120;
const CHART_PAD_TOP = 8;

function buildPontos(pontos: TendenciaMes[], key: keyof Omit<TendenciaMes, "mes">, max: number) {
  return pontos
    .map((p, i) => {
      const x = pontos.length > 1 ? (i / (pontos.length - 1)) * CHART_WIDTH : CHART_WIDTH / 2;
      const y = CHART_PAD_TOP + (1 - p[key] / max) * (CHART_HEIGHT - CHART_PAD_TOP);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function CardTendenciaSinais({
  periodoLabel = "Últimos 6 meses",
  pontos,
  resumo,
  className,
}: {
  periodoLabel?: string;
  pontos: TendenciaMes[];
  resumo: ResumoGeralSinais;
  className?: string;
}) {
  const maxValor = Math.max(1, ...pontos.flatMap((p) => [p.oportunidades, p.alertas, p.riscos]));
  const maxResumo = Math.max(
    1,
    resumo.oportunidades,
    resumo.alertas,
    resumo.riscos,
    resumo.concorrencia
  );

  const BARRAS = [
    { label: "Oportunidades", valor: resumo.oportunidades, cor: "bg-sinal-oportunidade" },
    { label: "Alertas", valor: resumo.alertas, cor: "bg-sinal-alerta" },
    { label: "Riscos", valor: resumo.riscos, cor: "bg-sinal-risco-churn" },
    { label: "Concorrência", valor: resumo.concorrencia, cor: "bg-sinal-concorrencia" },
  ];

  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-5 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="82:848"
      data-name="Card/Tendencia-Sinais"
    >
      <div className="flex w-full items-center justify-between">
        <p className="text-subtitulo font-medium text-neutro-dark">
          Tendência de Sinais Comerciais
        </p>
        <p className="text-legenda text-neutro-muted">{periodoLabel}</p>
      </div>

      <div className="flex w-full flex-col items-start gap-3">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-[120px] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de tendência de sinais comerciais"
        >
          {[0, 40, 80, 120].map((y) => (
            <line
              key={y}
              x1={0}
              y1={y}
              x2={CHART_WIDTH}
              y2={y}
              stroke="var(--color-neutro-border)"
              strokeWidth={1}
            />
          ))}
          <polyline
            points={buildPontos(pontos, "oportunidades", maxValor)}
            fill="none"
            stroke="var(--color-sinal-oportunidade)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={buildPontos(pontos, "alertas", maxValor)}
            fill="none"
            stroke="var(--color-sinal-alerta)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={buildPontos(pontos, "riscos", maxValor)}
            fill="none"
            stroke="var(--color-sinal-risco-churn)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex w-full items-center justify-between text-caption leading-caption text-neutro-muted">
          {pontos.map((p, i) => (
            <span key={`${p.mes}-${i}`}>{p.mes}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LegendaItem cor="bg-sinal-oportunidade" label="Oportunidades" />
          <LegendaItem cor="bg-sinal-alerta" label="Alertas" />
          <LegendaItem cor="bg-sinal-risco-churn" label="Riscos" />
        </div>
      </div>

      <div className="h-px w-full bg-neutro-border" />

      <div className="flex w-full flex-col items-start gap-3">
        <p className="text-legenda text-neutro-dark">Resumo Geral</p>
        <div className="flex w-full flex-col items-start gap-2.5">
          {BARRAS.map((row) => (
            <div key={row.label} className="flex w-full items-center gap-3">
              <p className="w-25 shrink-0 text-caption leading-caption text-neutro-dark">
                {row.label}
              </p>
              <div className="flex h-2 flex-1 items-start overflow-hidden rounded bg-neutro-background">
                <div
                  className={clsx("h-full", row.cor)}
                  style={{ width: `${(row.valor / maxResumo) * 100}%` }}
                />
              </div>
              <p className="w-5 shrink-0 text-right text-caption leading-caption text-neutro-dark">
                {row.valor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Card/Resumo-Executivo (1156px de referência) ----------

export function CardResumoExecutivo({
  resumoExecutivo,
  className,
}: {
  resumoExecutivo: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="38:241"
      data-name="Card/Resumo-Executivo"
    >
      <div className="flex items-center gap-3">
        <p className="text-subtitulo font-medium text-neutro-dark">Resumo Executivo</p>
        <BadgeGeradoPorIA />
      </div>
      <p className="w-full text-corpo text-neutro-dark">{resumoExecutivo}</p>
    </div>
  );
}

// ---------- Card/Historico-Analises (1156px de referência) ----------
// Recebe a `AnaliseIA` inteira — Início/Fim/Duração/Status são todos
// derivados dos campos que já existem na entidade (iniciadoEm, finalizadoEm,
// statusProcessamento), sem duplicar dado formatado no domínio.

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuracao(iniciadoEm: string, finalizadoEm: string | null) {
  if (!finalizadoEm) return "—";
  const totalSeg = Math.max(
    0,
    Math.round((new Date(finalizadoEm).getTime() - new Date(iniciadoEm).getTime()) / 1000)
  );
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return min > 0 ? `${min} min ${seg}s` : `${seg}s`;
}

export function CardHistoricoAnalises({
  analise,
  className,
}: {
  analise: Pick<AnaliseIA, "iniciadoEm" | "finalizadoEm" | "statusProcessamento">;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="38:473"
      data-name="Card/Historico-Analises"
    >
      <p className="text-subtitulo font-medium text-neutro-dark">Histórico de Análises</p>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4 py-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-legenda text-neutro-muted">
            Início do processamento
          </p>
          <p className="text-corpo text-neutro-dark">
            {formatDataHora(analise.iniciadoEm)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-legenda text-neutro-muted">Fim do processamento</p>
          <p className="text-corpo text-neutro-dark">
            {analise.finalizadoEm ? formatDataHora(analise.finalizadoEm) : "—"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-legenda text-neutro-muted">Duração</p>
          <p className="text-corpo text-neutro-dark">
            {formatDuracao(analise.iniciadoEm, analise.finalizadoEm)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-legenda text-neutro-muted">Status</p>
          <BadgeStatus status={analise.statusProcessamento} />
        </div>
      </div>
    </div>
  );
}

// ---------- Card/Sinais-Comerciais (1156px de referência) ----------
// Recebe `SinalComercial[]` direto — cada linha reusa `BadgeSinalComercial`
// (mesmo componente da vitrine de Badges) + `descricao` + `evidencia`.

export function CardSinaisComerciais({
  sinais,
  className,
}: {
  sinais: SinalComercial[];
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6",
        className
      )}
      data-node-id="38:343"
      data-name="Card/Sinais-Comerciais"
    >
      <div className="flex items-center gap-3">
        <p className="text-subtitulo font-medium text-neutro-dark">
          Sinais Comerciais Identificados
        </p>
        <BadgeGeradoPorIA />
      </div>
      <div className="flex w-full flex-col items-start">
        {sinais.map((sinal) => (
          <div
            key={sinal.id}
            className="flex w-full items-center gap-4 border-b border-neutro-border py-3 last:border-b-0"
          >
            <BadgeSinalComercial tipo={sinal.tipo} className="w-35 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <p className="w-full text-corpo text-neutro-dark">{sinal.descricao}</p>
              <p className="w-full text-legenda text-neutro-muted">&ldquo;{sinal.evidencia}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
