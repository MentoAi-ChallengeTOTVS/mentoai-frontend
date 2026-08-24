"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/design-system/Sidebar";
import {
  BadgeStatus,
  BadgeSinalComercial,
  BadgePrioridade,
  BadgeGeradoPorIA,
  BadgeStatusAcesso,
} from "@/components/design-system/Badges";
import { ButtonPrimary } from "@/components/design-system/Button";
import { FilterBar, FilterSelect } from "@/components/design-system/FilterBar";
import {
  RowReuniao,
  RowUsuario,
  RowAlerta,
  RowBuscaCliente,
  RowBuscaReuniao,
} from "@/components/design-system/Rows";
import {
  CardUploadTranscricao,
  CardLoginForm,
  CardKPI,
  CardSinaisRisco,
  CardOportunidades,
  CardSugestaoEstrategica,
  CardClientesAtencao,
  CardTendenciaSinais,
  CardResumoExecutivo,
  CardHistoricoAnalises,
  CardSinaisComerciais,
} from "@/components/design-system/Cards";
import {
  PanelCadastroCliente,
  PanelStatusEnvio,
  PanelBoasVindasLogin,
  PanelEditarUsuario,
  PanelBuscaGlobal,
} from "@/components/design-system/Panels";
import { ItemTimelineReuniao } from "@/components/design-system/Timeline";
import { ItemConversa, BubblePergunta, BubbleRespostaIa } from "@/components/design-system/Chat";
import { StarRating, ModalAvaliarServico } from "@/components/design-system/Avaliacao";
import {
  RowCliente,
  TabelaClientesCabecalho,
  TabelaClientesRodape,
} from "@/components/design-system/TableClientes";
import type { SinalComercial } from "@/types/domain";

const CLIENTE_EXEMPLO = {
  id: 1,
  nome: "Construtora Horizonte Ltda",
  segmento: "Construção Civil",
  porte: "Grande",
  criacao: "2026-01-10T10:00:00Z",
};

const USUARIO_EXEMPLO = {
  id: 1,
  nome: "Fernanda Costa",
  email: "fernanda@mentoai.com",
  perfil: "DIRETOR_COMERCIAL" as const,
  ativo: true,
  criacao: "2026-01-10T10:00:00Z",
  atualizacao: "2026-01-10T10:00:00Z",
};

const REUNIAO_EXEMPLO = {
  id: 1,
  dataReuniao: "2026-08-12T14:00:00Z",
  duracaoMinutos: 47,
  criacao: "2026-08-12T15:00:00Z",
  cliente: CLIENTE_EXEMPLO,
  usuario: USUARIO_EXEMPLO,
};

const ANALISE_EXEMPLO = {
  id: 1,
  sentimentoGeral: "POSITIVO" as const,
  statusProcessamento: "PROCESSADA" as const,
  reuniao: REUNIAO_EXEMPLO,
  resumoExecutivo:
    "A reunião com Carlos Mendes da Construtora Horizonte focou na expansão do contrato atual de ERP para incluir o módulo de gestão de obras. O cliente demonstrou interesse claro, mencionando dificuldades com o sistema atual de controle de cronograma. Há urgência declarada para implantação no Q4 2026, com orçamento já aprovado pela diretoria.",
  criacao: "2026-08-12T15:32:00Z",
  iniciadoEm: "2026-08-12T15:32:00Z",
  finalizadoEm: "2026-08-12T15:34:12Z",
  mensagemErro: null,
};

const SINAIS_EXEMPLO: SinalComercial[] = [
  {
    id: 1,
    analise: ANALISE_EXEMPLO,
    tipo: "NECESSIDADE",
    descricao: "Necessidade de módulo de gestão de obras integrado ao ERP",
    severidade: "MEDIA",
    evidencia: "Precisamos de algo que converse com o ERP, hoje temos três planilhas separadas...",
    criacao: "2026-08-12T15:33:00Z",
  },
  {
    id: 2,
    analise: ANALISE_EXEMPLO,
    tipo: "ORCAMENTO",
    descricao: "Budget aprovado pela diretoria para Q4 2026",
    severidade: "BAIXA",
    evidencia: "Já temos o budget aprovado, a diretoria deu sinal verde",
    criacao: "2026-08-12T15:33:00Z",
  },
  {
    id: 3,
    analise: ANALISE_EXEMPLO,
    tipo: "CONCORRENCIA",
    descricao: "SoftPlan apresentou proposta concorrente na semana anterior",
    severidade: "ALTA",
    evidencia: "A SoftPlan esteve aqui na terça e deixou uma proposta",
    criacao: "2026-08-12T15:33:00Z",
  },
  {
    id: 4,
    analise: ANALISE_EXEMPLO,
    tipo: "OPORTUNIDADE",
    descricao: "Upsell de módulo de gestão de obras + possível cross-sell de BI",
    severidade: "MEDIA",
    evidencia: "Se o módulo de obras funcionar bem, quero ver aquele painel de BI também",
    criacao: "2026-08-12T15:33:00Z",
  },
];

const TENDENCIA_EXEMPLO = [
  { mes: "Mar", oportunidades: 14, alertas: 9, riscos: 6 },
  { mes: "Abr", oportunidades: 17, alertas: 8, riscos: 7 },
  { mes: "Mai", oportunidades: 16, alertas: 10, riscos: 5 },
  { mes: "Jun", oportunidades: 19, alertas: 12, riscos: 8 },
  { mes: "Jul", oportunidades: 21, alertas: 13, riscos: 7 },
  { mes: "Ago", oportunidades: 23, alertas: 15, riscos: 8 },
];

/**
 * Página de preview do Design System em construção — não faz parte do
 * backlog, é só uma vitrine pra conferir os componentes enquanto o
 * frontend é montado a partir do Figma.
 */
const CHAT_EXEMPLO = {
  id: 1,
  titulo: "Estratégia Construtora Horizonte",
  usuario: USUARIO_EXEMPLO,
  criacao: "2026-08-14T14:32:00Z",
};

const CLIENTES_TABELA_EXEMPLO = [
  { id: 2, nome: "FarmaTech Distribuidora", segmento: "Saúde / Farmacêutica", porte: "Médio", criacao: "2026-04-28T10:00:00Z" },
  { id: 3, nome: "Construtora Horizonte Ltda", segmento: "Construção Civil", porte: "Grande", criacao: "2026-01-10T10:00:00Z" },
  { id: 4, nome: "Tech Solutions BR", segmento: "Tecnologia", porte: "Pequeno", criacao: "2026-03-02T10:00:00Z" },
];

export default function DesignSystemPreview() {
  const [buscaQuery, setBuscaQuery] = useState("Tech");
  const [nota, setNota] = useState(3);
  const [comentario, setComentario] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeHref="/dashboard" perfil="DIRETOR_COMERCIAL" userName="Fernanda Costa" />
      <div className="flex-1 space-y-10 p-10">
        <h1 className="text-titulo font-medium">Design System — preview</h1>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Badge/Status</h2>
          <div className="flex flex-wrap gap-3">
            <BadgeStatus status="PENDENTE" />
            <BadgeStatus status="PROCESSANDO" />
            <BadgeStatus status="PROCESSADA" />
            <BadgeStatus status="ERRO" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Badge/Sinal-Comercial (9 tipos)</h2>
          <div className="flex flex-wrap gap-3">
            <BadgeSinalComercial tipo="NECESSIDADE" />
            <BadgeSinalComercial tipo="DOR" />
            <BadgeSinalComercial tipo="OBJECAO" />
            <BadgeSinalComercial tipo="ORCAMENTO" />
            <BadgeSinalComercial tipo="PRAZO" />
            <BadgeSinalComercial tipo="MOMENTO_CLIENTE" />
            <BadgeSinalComercial tipo="CONCORRENCIA" />
            <BadgeSinalComercial tipo="OPORTUNIDADE" />
            <BadgeSinalComercial tipo="RISCO_CHURN" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Badge/Prioridade</h2>
          <div className="flex flex-wrap gap-3">
            <BadgePrioridade nivel="BAIXA" />
            <BadgePrioridade nivel="MEDIA" />
            <BadgePrioridade nivel="ALTA" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Badge/Gerado-por-IA e Status-Acesso</h2>
          <div className="flex flex-wrap gap-3">
            <BadgeGeradoPorIA />
            <BadgeStatusAcesso ativo />
            <BadgeStatusAcesso ativo={false} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Button/Primary</h2>
          <ButtonPrimary icon={<Plus className="size-4" />}>Novo cliente</ButtonPrimary>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Filter-Bar</h2>
          <FilterBar searchPlaceholder="Buscar por cliente...">
            <FilterSelect label="Cliente" value="Todos os clientes" options={["Todos os clientes"]} />
            <FilterSelect label="Período" value="Últimos 30 dias" options={["Últimos 30 dias"]} />
            <FilterSelect label="Status" value="Todos" options={["Todos"]} />
          </FilterBar>
        </section>

        <section className="max-w-3xl space-y-3">
          <h2 className="text-subtitulo font-medium">Rows</h2>
          <div className="overflow-hidden rounded-md border border-neutro-border">
            <RowReuniao reuniao={REUNIAO_EXEMPLO} tiposSinais={["OPORTUNIDADE", "RISCO_CHURN", "CONCORRENCIA"]} />
            <RowUsuario usuario={USUARIO_EXEMPLO} />
            <RowAlerta
              clienteNome="Cervejaria Artesanal SP"
              motivo="Mencionou insatisfação recorrente com o prazo de entrega nas últimas 3 reuniões"
              prioridade="ALTA"
              lido={false}
            />
          </div>
          <div className="flex max-w-md flex-col gap-2">
            <RowBuscaCliente cliente={CLIENTE_EXEMPLO} />
            <RowBuscaReuniao reuniao={REUNIAO_EXEMPLO} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Cards</h2>

          <div className="flex flex-wrap items-start gap-6">
            <CardUploadTranscricao className="max-w-[352px]" />
            <CardLoginForm className="max-w-[420px]" onSubmit={() => {}} />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <CardKPI titulo="Total de Clientes" valor={128} tendencia={{ direcao: "up", texto: "+12 este mês" }} className="max-w-[220px]" />
            <CardKPI titulo="Reuniões no Mês" valor={34} tendencia={{ direcao: "up", texto: "+5 este mês" }} className="max-w-[220px]" />
            <CardKPI titulo="Alertas Ativos" valor={7} tendencia={{ direcao: "down", texto: "-2 este mês" }} className="max-w-[220px]" />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <CardSinaisRisco
              quantidade={3}
              itens={[
                "Concorrente SoftPlan com proposta ativa",
                "Insatisfação com tempo de resposta do suporte",
                "Prazo apertado para implantação Q4",
              ]}
              className="max-w-[440px]"
            />
            <CardOportunidades
              quantidade={5}
              itens={[
                "Upsell módulo gestão de obras",
                "Cross-sell painel de BI",
                "Expansão para filiais (3 novos canteiros)",
              ]}
              className="max-w-[440px]"
            />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <CardSugestaoEstrategica
              titulo="Priorizar proposta de expansão antes do fim do trimestre"
              justificativa="O cliente demonstrou interesse recorrente no módulo de obras nas últimas 3 reuniões e o contrato atual vence em Q4 2026. Janela de negociação ideal."
              className="max-w-[280px]"
            />
            <CardTendenciaSinais
              pontos={TENDENCIA_EXEMPLO}
              resumo={{ oportunidades: 23, alertas: 15, riscos: 8, concorrencia: 6 }}
              className="max-w-[440px]"
            />
          </div>

          <CardClientesAtencao
            clientes={[
              { cliente: "Construtora Horizonte Ltda", motivo: "Mencionou concorrente em 3 reuniões seguidas", prioridade: "ALTA" },
              { cliente: "Tech Solutions BR", motivo: "Sem reunião há 45 dias - risco de churn", prioridade: "ALTA" },
              { cliente: "Grupo Meridiano", motivo: "Insatisfação com prazo de implantação", prioridade: "MEDIA" },
              { cliente: "Farmacêutica Vida", motivo: "Novo decisor - relacionamento ainda frio", prioridade: "BAIXA" },
            ]}
          />

          <CardResumoExecutivo resumoExecutivo={ANALISE_EXEMPLO.resumoExecutivo} />

          <CardHistoricoAnalises analise={ANALISE_EXEMPLO} />

          <CardSinaisComerciais sinais={SINAIS_EXEMPLO} />
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Panels</h2>

          <div className="rounded-md bg-navy p-8">
            <PanelBoasVindasLogin />
          </div>

          <div className="flex flex-wrap items-start gap-6">
            <div className="h-[560px] w-[380px] overflow-hidden rounded-md border border-neutro-border">
              <PanelCadastroCliente onSubmit={() => {}} onCancel={() => {}} onClose={() => {}} />
            </div>
            <div className="h-[560px] w-[420px] overflow-hidden rounded-md border border-neutro-border">
              <PanelEditarUsuario
                usuario={USUARIO_EXEMPLO}
                onSubmit={() => {}}
                onCancel={() => {}}
                onClose={() => {}}
              />
            </div>
          </div>

          <PanelStatusEnvio
            status="PROCESSANDO"
            nomeArquivo="reuniao_cliente_abc.txt"
            tamanhoArquivo="1.2 MB"
            progresso={65}
            enviadoEm="2026-08-20T14:32:00Z"
            className="max-w-[380px]"
          />

          <PanelBuscaGlobal
            query={buscaQuery}
            onQueryChange={setBuscaQuery}
            onClear={() => setBuscaQuery("")}
            clientes={[CLIENTE_EXEMPLO]}
            reunioes={[REUNIAO_EXEMPLO]}
            className="max-w-[480px]"
          />
        </section>

        <section className="max-w-3xl space-y-3">
          <h2 className="text-subtitulo font-medium">Timeline de Reuniões</h2>
          <div className="flex flex-col gap-4">
            <ItemTimelineReuniao
              reuniao={REUNIAO_EXEMPLO}
              resumo="Expansão do contrato ERP para módulo de gestão de obras. Interesse claro do cliente."
              status="PROCESSADA"
            />
            <ItemTimelineReuniao
              reuniao={{ dataReuniao: "2026-07-02T14:00:00Z" }}
              resumo="Reunião de acompanhamento — cliente mencionou insatisfação com prazo de suporte."
              status="PROCESSADA"
              ultimo
            />
          </div>
        </section>

        <section className="max-w-3xl space-y-3">
          <h2 className="text-subtitulo font-medium">Copiloto (chat)</h2>
          <div className="flex gap-4">
            <div className="w-64 shrink-0 space-y-2">
              <ItemConversa chat={CHAT_EXEMPLO} ativo />
              <ItemConversa chat={{ titulo: "Onboarding Tech Solutions BR", criacao: "2026-08-08T09:00:00Z" }} />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex justify-end">
                <BubblePergunta pergunta="Quais são os principais sinais de risco identificados na última reunião com a Construtora Horizonte?" />
              </div>
              <BubbleRespostaIa resposta={"Agora analisando a transcrição da reunião de 12/08/2026, identifiquei 3 sinais de risco de churn importantes que demandam atenção imediata da equipe comercial:\n\nRecomendo agendar uma chamada de alinhamento técnico para sanar as dúvidas de suporte e reforçar o cronograma de implantação antes do encerramento de Q3."} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Avaliação</h2>
          <div className="flex items-center gap-6">
            <StarRating value={nota} onChange={setNota} />
            <ButtonPrimary onClick={() => setModalAberto(true)}>Abrir modal de avaliação</ButtonPrimary>
          </div>
          <ModalAvaliarServico
            aberto={modalAberto}
            nota={nota}
            onNotaChange={setNota}
            comentario={comentario}
            onComentarioChange={setComentario}
            onEnviar={() => setModalAberto(false)}
            onDispensar={() => setModalAberto(false)}
            onClose={() => setModalAberto(false)}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-subtitulo font-medium">Tabela de Clientes</h2>
          <div className="overflow-hidden rounded-lg border border-neutro-border">
            <TabelaClientesCabecalho />
            {CLIENTES_TABELA_EXEMPLO.map((cliente, i) => (
              <RowCliente key={cliente.id} cliente={cliente} striped={i === 0} />
            ))}
            <TabelaClientesRodape exibindo={CLIENTES_TABELA_EXEMPLO.length} total={128} podeAnterior={false} />
          </div>
        </section>
      </div>
    </div>
  );
}
