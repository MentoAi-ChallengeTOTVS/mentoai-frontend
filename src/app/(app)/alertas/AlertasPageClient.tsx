"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { RowAlerta } from "@/components/design-system/Rows";
import { marcarComoLido } from "@/services/alertas.service";
import type { AlertaUsuario, PrioridadeAlerta } from "@/types/domain";

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
 * marcação de lido.
 *
 * A marcação é otimista e local: sem estado global entre rotas (gap já
 * documentado nas outras telas), marcar um alerta aqui não se reflete no
 * KPI do Dashboard nem sobrevive a um F5. Isso é esperado até o backend
 * existir.
 */
export function AlertasPageClient({ alertasIniciais }: { alertasIniciais: AlertaUsuario[] }) {
  const [alertas, setAlertas] = useState(alertasIniciais);
  const [filtroPrioridade, setFiltroPrioridade] = useState<OpcaoPrioridade>("Todas");
  const [filtroStatus, setFiltroStatus] = useState<OpcaoStatus>("Todos");
  const [pagina, setPagina] = useState(1);

  const naoLidos = alertas.filter((au) => !au.lido).length;

  const filtrados = useMemo(
    () =>
      alertas.filter((au) => {
        if (
          filtroPrioridade !== "Todas" &&
          au.alerta.prioridade !== PRIORIDADE_LABEL_TO_ENUM[filtroPrioridade]
        ) {
          return false;
        }
        if (filtroStatus === "Lidos" && !au.lido) return false;
        if (filtroStatus === "Não lidos" && au.lido) return false;
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

  async function handleMarcarLido(alertaUsuarioId: number) {
    // Atualização otimista: a linha muda de estado na hora e a chamada ao
    // serviço acontece depois (hoje é no-op, amanhã é um PATCH).
    setAlertas((prev) =>
      prev.map((au) =>
        au.id === alertaUsuarioId ? { ...au, lido: true, lidoEm: new Date().toISOString() } : au
      )
    );
    await marcarComoLido(alertaUsuarioId);
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
          <p className="w-55 shrink-0">CLIENTE</p>
          <p className="flex-1">MOTIVO DO ALERTA (ANÁLISE COMERCIAL IA)</p>
          <p className="w-30 shrink-0 text-center">PRIORIDADE</p>
          <p className="w-30 shrink-0 text-right">STATUS</p>
        </div>

        {itensDaPagina.length === 0 ? (
          <p className="w-full px-6 py-10 text-center text-corpo text-neutro-muted">
            Nenhum alerta encontrado para os filtros selecionados.
          </p>
        ) : (
          itensDaPagina.map((au) => {
            const linha = (
              <RowAlerta
                clienteNome={au.alerta.sinalComercial.analise.reuniao.cliente.nome}
                motivo={au.alerta.descricao}
                prioridade={au.alerta.prioridade}
                lido={au.lido}
              />
            );

            // O frame não mostra botão dedicado de "marcar como lido" — a
            // própria linha é o alvo do clique. Já lida, deixa de ser botão
            // (não há o que fazer com ela, e um botão inerte só atrapalharia
            // quem navega por teclado).
            return au.lido ? (
              <div key={au.id} className="w-full">
                {linha}
              </div>
            ) : (
              <button
                key={au.id}
                type="button"
                onClick={() => handleMarcarLido(au.id)}
                aria-label={`Marcar alerta de ${au.alerta.sinalComercial.analise.reuniao.cliente.nome} como lido`}
                className="w-full cursor-pointer text-left transition-colors hover:bg-neutro-background/60"
              >
                {linha}
              </button>
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
