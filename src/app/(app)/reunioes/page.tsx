"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { FilterBar, FilterSelect } from "@/components/design-system/FilterBar";
import { RowReuniao } from "@/components/design-system/Rows";
import { MOCK_REUNIOES, MOCK_ANALISES, tiposSinaisDaReuniao } from "@/mocks/reunioes";

/**
 * Tela Reuniões — lista (Figma: frame "reunioes-lista-mentoai", 49:403) —
 * feature F03, issue #71 (parte 1: "Criar listagem e detalhes de reuniões").
 * Ponto de entrada pra Nova Reunião (#70, `/reunioes/nova`) e Detalhe da
 * Reunião (`/reunioes/[id]`).
 *
 * `Filter-Bar` e `Row/Reuniao` já existiam no design system (showcase em
 * `/design-system`) — reaproveitados aqui como estão. `table-header`/
 * `table-footer` ficaram inline, mesmo padrão de `usuarios/page.tsx` (Figma
 * não promoveu esses frames a componentes nomeados nesta tela).
 *
 * Filtros de Cliente/Período aplicados sobre os dados mockados no
 * client-side; "Status" e a busca por nome de cliente também. Sem
 * dependência de backend — mesmo espírito de `clientes/page.tsx`.
 */

const TAMANHO_PAGINA = 8; // bate com o "Exibindo 8 de 24 reuniões" do Figma

const OPCAO_TODOS_CLIENTES = "Todos os clientes";
const OPCOES_STATUS = ["Todos", "Pendente", "Processando", "Processada", "Erro"] as const;
const OPCOES_PERIODO = ["Todo o período", "Últimos 30 dias", "Últimos 90 dias"] as const;

const STATUS_LABEL_TO_ENUM = {
  Pendente: "PENDENTE",
  Processando: "PROCESSANDO",
  Processada: "PROCESSADA",
  Erro: "ERRO",
} as const;

export default function ReunioesPage() {
  const router = useRouter();
  const [filtroCliente, setFiltroCliente] = useState(OPCAO_TODOS_CLIENTES);
  const [filtroPeriodo, setFiltroPeriodo] = useState<(typeof OPCOES_PERIODO)[number]>(
    "Todo o período"
  );
  const [filtroStatus, setFiltroStatus] = useState<(typeof OPCOES_STATUS)[number]>("Todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const opcoesCliente = useMemo(() => {
    const nomes = Array.from(new Set(MOCK_REUNIOES.map((r) => r.cliente.nome))).sort();
    return [OPCAO_TODOS_CLIENTES, ...nomes];
  }, []);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const agora = new Date("2026-08-24T00:00:00Z").getTime();
    const limitePeriodo =
      filtroPeriodo === "Últimos 30 dias" ? 30 : filtroPeriodo === "Últimos 90 dias" ? 90 : null;

    return MOCK_REUNIOES.filter((r) => {
      if (filtroCliente !== OPCAO_TODOS_CLIENTES && r.cliente.nome !== filtroCliente) return false;
      if (q && !r.cliente.nome.toLowerCase().includes(q)) return false;
      if (filtroStatus !== "Todos") {
        const status = MOCK_ANALISES[r.id]?.statusProcessamento;
        if (status !== STATUS_LABEL_TO_ENUM[filtroStatus]) return false;
      }
      if (limitePeriodo !== null) {
        const dias = (agora - new Date(r.dataReuniao).getTime()) / (1000 * 60 * 60 * 24);
        if (dias > limitePeriodo) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.dataReuniao).getTime() - new Date(a.dataReuniao).getTime());
  }, [filtroCliente, filtroPeriodo, filtroStatus, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
  const reunioesDaPagina = filtradas.slice(inicio, inicio + TAMANHO_PAGINA);

  function handleFiltroChange(setter: (v: never) => void) {
    return (v: string) => {
      setter(v as never);
      setPagina(1);
    };
  }

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">Reuniões</p>
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Gerencie as reuniões comerciais e acompanhe as análises de IA
          </p>
        </div>
        <ButtonPrimary
          icon={<Plus className="size-4" />}
          onClick={() => router.push("/reunioes/nova")}
        >
          Nova reunião
        </ButtonPrimary>
      </div>

      <FilterBar
        searchLabel="Pesquisa"
        searchPlaceholder="Buscar por cliente..."
        searchValue={busca}
        onSearchChange={(v) => {
          setBusca(v);
          setPagina(1);
        }}
      >
        <FilterSelect
          label="Cliente"
          value={filtroCliente}
          options={opcoesCliente}
          onChange={handleFiltroChange(setFiltroCliente)}
        />
        <FilterSelect
          label="Período"
          value={filtroPeriodo}
          options={[...OPCOES_PERIODO]}
          onChange={handleFiltroChange(setFiltroPeriodo)}
        />
        <FilterSelect
          label="Status"
          value={filtroStatus}
          options={[...OPCOES_STATUS]}
          onChange={handleFiltroChange(setFiltroStatus)}
        />
      </FilterBar>

      <div
        className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white"
        data-node-id="49:482"
        data-name="table-card"
      >
        <div className="flex w-full items-start gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda leading-legenda text-sidebar-muted-2">
          <p className="flex-1">CLIENTE</p>
          <p className="w-40 shrink-0">DATA</p>
          <p className="w-30 shrink-0">DURAÇÃO</p>
          <p className="w-40 shrink-0">STATUS</p>
          <p className="w-50 shrink-0">SINAIS IDENTIFICADOS</p>
        </div>
        {reunioesDaPagina.length === 0 ? (
          <p className="w-full px-6 py-10 text-center text-corpo text-neutro-muted">
            Nenhuma reunião encontrada para os filtros selecionados.
          </p>
        ) : (
          reunioesDaPagina.map((reuniao) => (
            <RowReuniao
              key={reuniao.id}
              reuniao={reuniao}
              status={MOCK_ANALISES[reuniao.id]?.statusProcessamento ?? "PENDENTE"}
              tiposSinais={tiposSinaisDaReuniao(reuniao.id)}
              href={`/reunioes/${reuniao.id}`}
            />
          ))
        )}
        <div className="flex w-full items-center justify-between bg-white px-6 py-3.5">
          <p className="text-legenda leading-legenda text-neutro-muted">
            Exibindo {reunioesDaPagina.length} de {filtradas.length} reuniões
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
