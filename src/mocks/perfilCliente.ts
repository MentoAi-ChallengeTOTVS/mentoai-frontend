import type { TipoSinalComercial } from "@/types/domain";
import { MOCK_REUNIOES, MOCK_ANALISES, MOCK_SINAIS } from "./reunioes";

/**
 * Dados derivados/curados para a tela Perfil do Cliente / Visão 360°
 * (Figma: frame "perfil-cliente-mentoai", node 44:326) — features F02/F06,
 * issues #65 ("estrutura da tela de detalhes do cliente") e #86 ("Visão
 * 360° do Cliente — histórico + IA").
 *
 * Diferente de `clientes.ts`/`usuarios.ts`/`reunioes.ts`, este arquivo não
 * cria uma nova lista de entidades — deriva agregações por cliente em cima
 * de `MOCK_REUNIOES`/`MOCK_SINAIS` (que já existem) e cura conteúdo pontual
 * pra dois pontos sem entidade de domínio formal (resumo de reunião na
 * timeline, resumo estratégico e sugestões estratégicas do cliente).
 *
 * Gap de domínio (mesmo espírito do comentário em `Card/Sugestao-Estrategica`
 * dentro de `Cards.tsx`): "Resumo Estratégico" e "Sugestões Estratégicas" não
 * têm uma entidade dedicada — o candidato mais próximo é `Insight` com
 * `tipo: "ESTRATEGICO"`, mas esse é por `AnaliseIA` (por reunião), não um
 * agregado por cliente, e `Insight` ainda não tem dado mockado em lugar
 * nenhum do projeto. Por ora curamos esse conteúdo aqui mesmo, documentado
 * como decisão de escopo — não uma entidade nova inventada no domínio.
 */

// ---------- Linha do Tempo — resumo curto por reunião ----------
// `Item/Timeline-Reuniao` no Figma mostra uma síntese de uma linha, não o
// `AnaliseIA.resumoExecutivo` inteiro (que costuma ter várias frases) — não
// existe campo curto equivalente no domínio, então curamos manualmente as
// reuniões da Construtora Horizonte (cliente id 1, o mesmo exemplo do
// Figma) pra bater com o roteiro da reunião 1 (já usado no Detalhe da
// Reunião) e dar contexto plausível às outras duas. Reuniões de outros
// clientes caem no fallback: resumoExecutivo genérico truncado.

const RESUMOS_TIMELINE_CURADOS: Record<number, string> = {
  1: "Expansão do contrato ERP para módulo de gestão de obras. Interesse claro do cliente.",
  7: "Levantamento de necessidades para consolidação de relatórios e cronograma de obras.",
  24: "Primeiro contato para renovação anual. Cliente mencionou interesse em novos módulos.",
};

export function resumoTimelineDaReuniao(reuniaoId: number): string {
  if (RESUMOS_TIMELINE_CURADOS[reuniaoId]) return RESUMOS_TIMELINE_CURADOS[reuniaoId];
  const resumo = MOCK_ANALISES[reuniaoId]?.resumoExecutivo;
  return resumo && resumo.length > 0 ? resumo : "Resumo ainda não disponível para essa reunião.";
}

// ---------- Reuniões do cliente, mais recente primeiro ----------

export function reunioesDoCliente(clienteId: number) {
  return MOCK_REUNIOES.filter((r) => r.cliente.id === clienteId).sort(
    (a, b) => new Date(b.dataReuniao).getTime() - new Date(a.dataReuniao).getTime()
  );
}

// ---------- Sinais de Risco / Oportunidades agregados ----------
// Filtra SinalComercial por tipo em todas as reuniões do cliente — decisão
// deliberada de derivar do dado real em vez de fixar os números ilustrativos
// do Figma (que mostra 3 sinais de risco e 5 oportunidades pra Construtora
// Horizonte). Com os 3 registros mockados hoje pra esse cliente, a contagem
// real dá 1 sinal de risco e 2 oportunidades — menor que o exemplo do Figma,
// mas consistente com os dados que a tela realmente tem disponíveis. Ver
// nota equivalente em `claude/decisoes_tecnicas_stack.md`.

function sinaisDoClientePorTipo(clienteId: number, tipo: TipoSinalComercial) {
  return reunioesDoCliente(clienteId)
    .flatMap((r) => MOCK_SINAIS[r.id] ?? [])
    .filter((s) => s.tipo === tipo);
}

export function sinaisRiscoDoCliente(clienteId: number) {
  return sinaisDoClientePorTipo(clienteId, "RISCO_CHURN");
}

export function oportunidadesDoCliente(clienteId: number) {
  return sinaisDoClientePorTipo(clienteId, "OPORTUNIDADE");
}

// ---------- Resumo Estratégico e Sugestões Estratégicas ----------

export interface SugestaoEstrategica {
  titulo: string;
  justificativa: string;
}

const RESUMOS_ESTRATEGICOS_CURADOS: Record<number, string> = {
  1: "Cliente em fase de expansão com alto potencial de upsell. Atenção ao risco competitivo da SoftPlan e ao prazo crítico de Q4 2026. Priorizar proposta comercial do módulo de obras com condições diferenciadas.",
};

const SUGESTOES_CURADAS: Record<number, SugestaoEstrategica[]> = {
  1: [
    {
      titulo: "Priorizar proposta de expansão antes do fim do trimestre",
      justificativa:
        "O cliente demonstrou interesse recorrente no módulo de obras nas últimas reuniões e o contrato atual vence em Q4 2026. Janela de negociação ideal.",
    },
    {
      titulo: "Preparar contra-argumentação competitiva para SoftPlan",
      justificativa:
        "A concorrente apresentou proposta ativa na reunião mais recente. Recomenda-se material comparativo focado em integração ERP.",
    },
    {
      titulo: "Agendar reunião executiva com decisor de TI",
      justificativa:
        "As últimas interações foram majoritariamente com a área operacional. Envolvimento do diretor de TI pode acelerar a aprovação do módulo de obras.",
    },
  ],
};

export function resumoEstrategicoDoCliente(clienteId: number, nomeCliente: string): string {
  if (RESUMOS_ESTRATEGICOS_CURADOS[clienteId]) return RESUMOS_ESTRATEGICOS_CURADOS[clienteId];
  const riscos = sinaisRiscoDoCliente(clienteId).length;
  const oportunidades = oportunidadesDoCliente(clienteId).length;
  if (riscos === 0 && oportunidades === 0) {
    return `Ainda não há sinais de risco ou oportunidade suficientes no histórico de ${nomeCliente} para gerar um resumo estratégico.`;
  }
  return `${nomeCliente} tem ${oportunidades} ${
    oportunidades === 1 ? "oportunidade identificada" : "oportunidades identificadas"
  } e ${riscos} ${
    riscos === 1 ? "sinal de risco identificado" : "sinais de risco identificados"
  } no histórico de reuniões analisadas até agora.`;
}

// Fallback usado pela "geração" quando o cliente não tem conteúdo curado —
// deriva sugestões reais a partir dos sinais de risco/oportunidade já
// calculados acima, em vez de devolver sempre o mesmo texto genérico solto.
function gerarSugestoesFallback(clienteId: number, nomeCliente: string): SugestaoEstrategica[] {
  const riscos = sinaisRiscoDoCliente(clienteId);
  const oportunidades = oportunidadesDoCliente(clienteId);
  const sugestoes: SugestaoEstrategica[] = [];

  if (oportunidades.length > 0) {
    sugestoes.push({
      titulo: `Explorar as oportunidades identificadas em ${nomeCliente}`,
      justificativa: `A IA identificou ${oportunidades.length} ${
        oportunidades.length === 1 ? "oportunidade" : "oportunidades"
      } no histórico de reuniões: ${oportunidades.map((s) => s.descricao).join("; ")}.`,
    });
  }
  if (riscos.length > 0) {
    sugestoes.push({
      titulo: `Endereçar os sinais de risco de ${nomeCliente}`,
      justificativa: `A IA identificou ${riscos.length} ${
        riscos.length === 1 ? "sinal de risco" : "sinais de risco"
      } no histórico de reuniões: ${riscos.map((s) => s.descricao).join("; ")}.`,
    });
  }
  if (sugestoes.length === 0) {
    sugestoes.push({
      titulo: "Aprofundar o histórico de reuniões para gerar sugestões",
      justificativa: `Ainda não há sinais suficientes no histórico de ${nomeCliente} para a IA sugerir próximos passos estratégicos.`,
    });
  }
  return sugestoes;
}

/**
 * Estado inicial da seção "Sugestões Estratégicas" — só clientes com
 * conteúdo curado (Construtora Horizonte) já chegam com sugestões
 * "geradas"; os demais começam com `null` (estado vazio de verdade, issue
 * #101 pede um estado de vazio explícito antes da 1ª geração).
 */
export function sugestoesJaGeradasDoCliente(clienteId: number): SugestaoEstrategica[] | null {
  return SUGESTOES_CURADAS[clienteId] ?? null;
}

/**
 * Simula a ação de gerar/atualizar sugestões (issue #101) — usada tanto
 * pelo botão "Gerar sugestões" (estado vazio) quanto "Atualizar sugestões"
 * (já existem sugestões). Pra clientes com conteúdo curado, "atualizar"
 * devolve a mesma lista curada (simulando uma nova chamada de IA sobre os
 * mesmos dados); os demais recebem o fallback derivado dos sinais reais.
 */
export function gerarSugestoesEstrategicasDoCliente(
  clienteId: number,
  nomeCliente: string
): SugestaoEstrategica[] {
  return SUGESTOES_CURADAS[clienteId] ?? gerarSugestoesFallback(clienteId, nomeCliente);
}
