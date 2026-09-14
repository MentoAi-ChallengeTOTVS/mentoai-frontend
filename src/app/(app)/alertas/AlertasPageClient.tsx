"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { RowAlerta } from "@/components/design-system/Rows";
import { marcarComoLido, type AlertaListItem } from "@/services/alertas.service";
import type { PrioridadeAlerta } from "@/types/domain";

const TAMANHO_PAGINA = 8; // bate com o "Exibindo 8 de 8 alertas comerciais" do Figma

const OPCOES_PRIORIDADE = ["Todas", "Alta", "Média", "Baixa"] as const;
const OPCOES_STATUS = ["Todos", "Não lidos", "Lidos"] as const;

type OpcaoPrioridade = (typeof OPCOES_PRIORIDADE)[number];
type OpcaoStatus = (typeof OPCOES_STATUS)[number];

const PRIORIDADE_LABEL_TO_ENUM: Record<Exclude<OpcaoPrioridade, "Todas">, PrioridadeAlerta> = {
  Alta: "ALTA",
  Média: "MEDIA",
  Baixa: "BAIXA",
};

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Chip de filtro da Central de Alertas. Não é o `FilterSelect` (dropdown) das
 * outras telas — aqui o Figma usa pílulas selecionáveis, e como são poucas
 * opções fixas por grupo isso cabe melhor mesmo.
 */
function ChipFiltro({
  label,
  ativo,
  onClick,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={clsx(
        "flex h-8 shrink-0 items-center rounded-full border px-3.5 text-legenda leading-legenda transition-colors",
        ativo
          ? "border-menta bg-menta-suave font-medium text-menta"
          : "border-neutro-border bg-white text-neutro-dark hover:bg-neutro-background"
      )}
    >
      {label}
    </button>
  );
}

function GrupoChips<T extends string>({
  titulo,
  opcoes,
  valor,
  onChange,
}: {
  titulo: string;
  opcoes: readonly T[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-1 whitespace-nowrap text-legenda leading-legenda text-neutro-muted">
        {titulo}
      </p>
      {opcoes.map((opcao) => (
        <ChipFiltro
          key={opcao}
          label={opcao}
          ativo={valor === opcao}
          onClick={() => onChange(opcao)}
        />
      ))}
    </div>
  );
}

/**
 * Client Component da Central de Alertas — filtros por chip, paginação e
 * marcação de lido e acesso à análise de origem.
 *
 * Desde 13/09/2026 os alertas vêm da API real (`GET /api/v1/alertas`), mas
 * o item não é mais `AlertaUsuario` (domain.ts) — é `AlertaListItem`
 * (`alertas.service.ts`), mais plano. Dois efeitos disso na tela:
 *
 * 1. A coluna que antes mostrava o nome do cliente agora mostra a data de
 *    criação do alerta.
 * 2. "Lido" continua sendo estado local otimista (sem persistência real —
 *    mesma limitação de antes), mas agora a chamada que dispara ao marcar
 *    é um `PATCH` de verdade contra o backend, não mais um no-op.
 */
export function AlertasPageClient({ alertasIniciais }: { alertasIniciais: AlertaListItem[] }) {
  const [alertas, setAlertas] = useState(alertasIniciais);
  const [filtroPrioridade, setFiltroPrioridade] = useState<OpcaoPrioridade>("Todas");
  const [filtroStatus, setFiltroStatus] = useState<OpcaoStatus>("Todos");
  const [pagina, setPagina] = useState(1);

  const naoLidos = alertas.filter((a) => !a.lido).length;

  const filtrados = useMemo(
    () =>
      alertas.filter((a) => {
        if (filtroPrioridade !== "Todas" && a.prioridade !== PRIORIDADE_LABEL_TO_ENUM[filtroPrioridade]) {
          return false;
        }
        if (filtroStatus === "Lidos" && !a.lido) return false;
        if (filtroStatus === "Não lidos" && a.lido) return false;
        return true;
      }),
    [alertas, filtroPrioridade, filtroStatus]
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
  const itensDaPagina = filtrados.slice(inicio, inicio + TAMANHO_PAGINA);

  function trocarFiltro<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPagina(1);
    };
  }

  async function handleMarcarLido(alertaId: number) {
    // Atualização otimista: a linha muda de estado na hora e o PATCH real
    // acontece depois — se falhar, a linha só volta a ficar "não lido" no
    // próximo F5 (sem estado global entre rotas, gap já documentado nas
    // outras telas).
    setAlertas((prev) => prev.map((a) => (a.id === alertaId ? { ...a, lido: true } : a)));
    await marcarComoLido(alertaId);
  }

  return (
    <>
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">Central de Alertas</p>
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Monitore sinais comerciais críticos, riscos de churn e oportunidades detectados pela IA
            nas conversas
          </p>
        </div>
        {naoLidos > 0 && (
          <div className="flex shrink-0 items-start rounded-xl bg-sinal-risco-churn px-3 py-1">
            <p className="whitespace-nowrap text-caption leading-caption text-white">
              {naoLidos} não {naoLidos === 1 ? "lido" : "lidos"}
            </p>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-4 lg:flex-row lg:items-center lg:gap-6">
        <GrupoChips
          titulo="Prioridade:"
          opcoes={OPCOES_PRIORIDADE}
          valor={filtroPrioridade}
          onChange={trocarFiltro(setFiltroPrioridade)}
        />
        {/* Divisória vertical entre os dois grupos — some quando eles empilham. */}
        <div className="hidden h-6 w-px shrink-0 bg-neutro-border lg:block" />
        <GrupoChips
          titulo="Status:"
          opcoes={OPCOES_STATUS}
          valor={filtroStatus}
          onChange={trocarFiltro(setFiltroStatus)}
        />
      </div>

      <div
        className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white"
        data-node-id="84:723"
        data-name="table-card"
      >
        <div className="hidden w-full items-start gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda leading-legenda text-sidebar-muted-2 sm:flex">
          <p className="w-55 shrink-0">DATA</p>
          <p className="flex-1">MOTIVO DO ALERTA (ANÁLISE COMERCIAL IA)</p>
          <p className="w-30 shrink-0 text-center">PRIORIDADE</p>
          <p className="w-30 shrink-0 text-right">STATUS</p>
          <p className="w-40 shrink-0 text-right">AÇÕES</p>
        </div>

        {itensDaPagina.length === 0 ? (
          <p className="w-full px-6 py-10 text-center text-corpo text-neutro-muted">
            Nenhum alerta encontrado para os filtros selecionados.
          </p>
        ) : (
          itensDaPagina.map((item) => {
            return (
              <RowAlerta
                key={item.id}
                rotulo={formatDataHora(item.criacao)}
                motivo={item.motivo}
                prioridade={item.prioridade}
                lido={item.lido}
                acoes={
                  <>
                    {item.reuniaoId !== null && (
                      <Link
                        href={`/reunioes/${item.reuniaoId}`}
                        className="whitespace-nowrap text-legenda font-medium text-menta hover:underline"
                      >
                        Ver análise
                      </Link>
                    )}
                    {!item.lido && (
                      <button
                        type="button"
                        onClick={() => handleMarcarLido(item.id)}
                        aria-label={`Marcar alerta "${item.motivo}" como lido`}
                        className="whitespace-nowrap text-legenda text-neutro-muted hover:text-neutro-dark hover:underline"
                      >
                        Marcar como lido
                      </button>
                    )}
                  </>
                }
              />
            );
          })
        )}
      </div>

      <div className="flex w-full flex-col items-stretch gap-3 rounded-lg border border-neutro-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-legenda leading-legenda text-neutro-muted">
          Exibindo {itensDaPagina.length} de {filtrados.length}{" "}
          {filtrados.length === 1 ? "alerta comercial" : "alertas comerciais"}
        </p>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPagina(n)}
              aria-current={n === paginaAtual ? "page" : undefined}
              className={clsx(
                "flex size-7 items-center justify-center rounded text-caption leading-caption transition-colors",
                n === paginaAtual
                  ? "bg-menta font-medium text-white"
                  : "border border-neutro-border text-sidebar-muted-2 hover:bg-neutro-background"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
