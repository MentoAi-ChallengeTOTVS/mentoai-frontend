import type {
  AnaliseIA,
  Reuniao,
  SinalComercial,
  StatusProcessamento,
  TipoSinalComercial,
} from "@/types/domain";
import { MOCK_CLIENTES } from "./clientes";
import { MOCK_USUARIOS } from "./usuarios";

/**
 * Dados fictícios de reuniões/análises, mesmo padrão de `clientes.ts` e
 * `usuarios.ts`. Cobre as 3 telas de reunião do Breno (issues #70/#71):
 * Nova Reunião, Reuniões — lista (node Figma 49:403) e Detalhe da Reunião
 * (node 27:155).
 *
 * `MOCK_REUNIOES` tem 24 registros pra bater com o "Exibindo 8 de 24
 * reuniões" do rodapé da tabela no Figma (TAMANHO_PAGINA = 8 na tela).
 *
 * Cada reunião tem uma `AnaliseIA` correspondente em `MOCK_ANALISES`
 * (indexado por `reuniaoId`) — mesmo pra reuniões PENDENTE/PROCESSANDO/ERRO,
 * já que a entidade `AnaliseIA` existe desde a criação da reunião (ver DDD).
 * `resumoExecutivo` só é preenchido quando `statusProcessamento ===
 * "PROCESSADA"`; a tela de detalhe trata os outros estados como "análise
 * ainda não disponível" em vez de mostrar um resumo vazio.
 *
 * `MOCK_SINAIS` (indexado por `reuniaoId`) só existe pras reuniões
 * PROCESSADA. A reunião id 1 (Construtora Horizonte Ltda, 12/08/2026) usa o
 * conteúdo exato do frame `detalhe-reuniao-mentoai` do Figma — os 9 tipos de
 * sinal, evidências e resumo executivo copiados 1:1. As demais reuniões
 * PROCESSADA usam um conjunto menor e mais genérico de sinais, só pra
 * popular a lista/tabela de forma plausível.
 */

function usuario(id: number) {
  const u = MOCK_USUARIOS.find((x) => x.id === id);
  if (!u) throw new Error(`usuario mock ${id} não encontrado`);
  return u;
}

function cliente(id: number) {
  const c = MOCK_CLIENTES.find((x) => x.id === id);
  if (!c) throw new Error(`cliente mock ${id} não encontrado`);
  return c;
}

// clienteId, dataReuniao, duracaoMinutos, status, usuarioId
const REUNIOES_RAW: [number, string, number, StatusProcessamento, number][] = [
  [1, "2026-08-12T15:32:00Z", 47, "PROCESSADA", 2],
  [2, "2026-08-08T10:00:00Z", 32, "PROCESSADA", 3],
  [3, "2026-08-05T14:00:00Z", 55, "PROCESSADA", 2],
  [4, "2026-08-01T09:30:00Z", 28, "PENDENTE", 6],
  [5, "2026-07-28T11:00:00Z", 41, "PROCESSADA", 7],
  [6, "2026-07-22T16:00:00Z", 38, "PROCESSADA", 3],
  [1, "2026-07-15T10:30:00Z", 50, "PROCESSADA", 2],
  [2, "2026-07-10T13:00:00Z", 25, "PENDENTE", 6],
  [7, "2026-07-04T09:00:00Z", 33, "PROCESSADA", 9],
  [8, "2026-06-29T15:00:00Z", 44, "PROCESSADA", 7],
  [9, "2026-06-24T10:00:00Z", 19, "ERRO", 3],
  [10, "2026-06-18T14:30:00Z", 36, "PROCESSADA", 9],
  [3, "2026-06-12T11:00:00Z", 52, "PROCESSADA", 2],
  [11, "2026-06-07T09:00:00Z", 29, "PROCESSADA", 12],
  [12, "2026-06-01T16:00:00Z", 47, "PROCESSADA", 7],
  [5, "2026-05-26T10:00:00Z", 31, "PROCESSANDO", 9],
  [13, "2026-05-20T13:30:00Z", 40, "PROCESSADA", 3],
  [14, "2026-05-14T09:00:00Z", 22, "PROCESSADA", 12],
  [4, "2026-05-08T15:00:00Z", 35, "PROCESSADA", 6],
  [6, "2026-05-02T11:30:00Z", 48, "PROCESSADA", 7],
  [15, "2026-04-26T10:00:00Z", 27, "PENDENTE", 9],
  [16, "2026-04-20T14:00:00Z", 39, "PROCESSADA", 2],
  [17, "2026-04-14T09:30:00Z", 45, "PROCESSADA", 12],
  [1, "2026-04-08T16:00:00Z", 30, "PROCESSADA", 2],
];

export const MOCK_REUNIOES: Reuniao[] = REUNIOES_RAW.map(
  ([clienteId, dataReuniao, duracaoMinutos, , usuarioId], i) => ({
    id: i + 1,
    dataReuniao,
    duracaoMinutos,
    criacao: dataReuniao,
    cliente: cliente(clienteId),
    usuario: usuario(usuarioId),
  })
);

function minutosDepois(iso: string, min: number) {
  return new Date(new Date(iso).getTime() + min * 60_000).toISOString();
}

// Conjunto genérico de sinais pra reuniões PROCESSADA sem roteiro dedicado —
// cicla por essas entradas conforme a quantidade indicada por reunião.
//
// Ampliado em 26/08/2026 (issue #90): antes havia uma entrada por tipo, então
// todo `RISCO_CHURN` do mock tinha exatamente a mesma descrição — e o card
// "Clientes que Precisam de Atenção" do Dashboard, que lista um cliente por
// motivo, saía com 5 linhas de texto idêntico. Agora são duas variantes por
// tipo, o que também dá mais variedade aos badges da lista de Reuniões.
const SINAIS_GENERICOS: { tipo: TipoSinalComercial; descricao: string; evidencia: string }[] = [
  {
    tipo: "NECESSIDADE",
    descricao: "Necessidade de relatórios gerenciais consolidados",
    evidencia: "Hoje eu junto tudo manualmente numa planilha toda semana",
  },
  {
    tipo: "DOR",
    descricao: "Processo atual gera retrabalho entre equipes",
    evidencia: "A gente troca a mesma informação três vezes por e-mail",
  },
  {
    tipo: "ORCAMENTO",
    descricao: "Orçamento já reservado para o próximo trimestre",
    evidencia: "Já temos verba separada, só falta fechar o fornecedor",
  },
  {
    tipo: "PRAZO",
    descricao: "Prazo apertado por conta de um evento do cliente",
    evidencia: "Precisamos disso rodando antes da nossa convenção anual",
  },
  {
    tipo: "OPORTUNIDADE",
    descricao: "Potencial de expansão para outras unidades do cliente",
    evidencia: "Se der certo aqui, quero levar pras outras três filiais",
  },
  {
    tipo: "CONCORRENCIA",
    descricao: "Cliente também está em conversa com outro fornecedor",
    evidencia: "Estamos comparando com mais uma opção do mercado",
  },
  {
    tipo: "RISCO_CHURN",
    descricao: "Insatisfação recorrente com tempo de resposta do suporte",
    evidencia: "Já é a segunda vez que demora mais de um dia pra responder",
  },
  {
    tipo: "NECESSIDADE",
    descricao: "Necessidade de integração com o sistema fiscal já em uso",
    evidencia: "Se não conversar com o nosso fiscal, não adianta pra gente",
  },
  {
    tipo: "DOR",
    descricao: "Falta de visibilidade do estoque entre filiais",
    evidencia: "Ninguém sabe o que tem na outra unidade sem ligar e perguntar",
  },
  {
    tipo: "ORCAMENTO",
    descricao: "Verba depende de aprovação do conselho no próximo ciclo",
    evidencia: "Isso só passa se o conselho aprovar na reunião de dezembro",
  },
  {
    tipo: "PRAZO",
    descricao: "Implantação precisa acontecer fora do período de safra",
    evidencia: "De janeiro a março a gente não para pra treinar ninguém",
  },
  {
    tipo: "OPORTUNIDADE",
    descricao: "Interesse declarado em módulo de relatórios avançados",
    evidencia: "Aquele painel que você mostrou resolveria meu problema",
  },
  {
    tipo: "CONCORRENCIA",
    descricao: "Renovação com fornecedor atual vence no próximo trimestre",
    evidencia: "O contrato com eles termina em março e não vamos renovar no automático",
  },
  {
    tipo: "RISCO_CHURN",
    descricao: "Patrocinador do projeto saiu da empresa",
    evidencia: "Quem tocava isso aqui não trabalha mais com a gente",
  },
];

export const MOCK_ANALISES: Record<number, AnaliseIA> = {};
export const MOCK_SINAIS: Record<number, SinalComercial[]> = {};

REUNIOES_RAW.forEach(([, dataReuniao, , status], idx) => {
  const reuniaoId = idx + 1;
  const iniciadoEm = minutosDepois(dataReuniao, 5);

  if (status === "PENDENTE") {
    MOCK_ANALISES[reuniaoId] = {
      id: reuniaoId,
      sentimentoGeral: "NEUTRO",
      statusProcessamento: "PENDENTE",
      reuniao: MOCK_REUNIOES[idx],
      resumoExecutivo: "",
      criacao: dataReuniao,
      iniciadoEm,
      finalizadoEm: null,
      mensagemErro: null,
    };
    return;
  }

  if (status === "PROCESSANDO") {
    MOCK_ANALISES[reuniaoId] = {
      id: reuniaoId,
      sentimentoGeral: "NEUTRO",
      statusProcessamento: "PROCESSANDO",
      reuniao: MOCK_REUNIOES[idx],
      resumoExecutivo: "",
      criacao: dataReuniao,
      iniciadoEm,
      finalizadoEm: null,
      mensagemErro: null,
    };
    return;
  }

  if (status === "ERRO") {
    MOCK_ANALISES[reuniaoId] = {
      id: reuniaoId,
      sentimentoGeral: "NEUTRO",
      statusProcessamento: "ERRO",
      reuniao: MOCK_REUNIOES[idx],
      resumoExecutivo: "",
      criacao: dataReuniao,
      iniciadoEm,
      finalizadoEm: minutosDepois(iniciadoEm, 1),
      mensagemErro: "Não foi possível transcrever o arquivo enviado — formato de áudio incompatível.",
    };
    return;
  }

  // PROCESSADA
  const finalizadoEm = minutosDepois(iniciadoEm, 2);

  if (reuniaoId === 1) {
    // Roteiro dedicado — bate 1:1 com o frame detalhe-reuniao-mentoai (27:155).
    MOCK_ANALISES[reuniaoId] = {
      id: reuniaoId,
      sentimentoGeral: "POSITIVO",
      statusProcessamento: "PROCESSADA",
      reuniao: MOCK_REUNIOES[idx],
      resumoExecutivo:
        "A reunião com Carlos Mendes da Construtora Horizonte focou na expansão do contrato atual de ERP para incluir o módulo de gestão de obras. O cliente demonstrou interesse claro, mencionando dificuldades com o sistema atual de controle de cronograma. Há urgência declarada para implantação no Q4 2026, com orçamento já aprovado pela diretoria. Foi mencionado que a concorrente SoftPlan apresentou proposta na semana anterior. O sentimento geral da reunião foi positivo, com abertura para próximos passos.",
      criacao: dataReuniao,
      iniciadoEm,
      finalizadoEm,
      mensagemErro: null,
    };
    MOCK_SINAIS[reuniaoId] = [
      {
        id: 1,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "NECESSIDADE",
        descricao: "Necessidade de módulo de gestão de obras integrado ao ERP",
        evidencia: "Precisamos de algo que converse com o ERP, hoje temos três planilhas separadas...",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
      {
        id: 2,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "DOR",
        descricao: "Controle de cronograma ineficiente com ferramentas atuais",
        evidencia: "Toda semana perco meio dia consolidando cronograma manualmente",
        severidade: "MEDIA",
        criacao: finalizadoEm,
      },
      {
        id: 3,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "OBJECAO",
        descricao: "Preocupação com tempo de implantação e curva de aprendizado",
        evidencia: "Minha equipe de campo não é muito tech, preciso saber do treinamento",
        severidade: "MEDIA",
        criacao: finalizadoEm,
      },
      {
        id: 4,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "ORCAMENTO",
        descricao: "Budget aprovado pela diretoria para Q4 2026",
        evidencia: "Já temos o budget aprovado, a diretoria deu sinal verde",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
      {
        id: 5,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "PRAZO",
        descricao: "Urgência para implantação até outubro/2026",
        evidencia: "Precisamos estar rodando antes da temporada de obras em novembro",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
      {
        id: 6,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "MOMENTO_CLIENTE",
        descricao: "Cliente em fase de expansão, abrindo 3 novos canteiros",
        evidencia: "Estamos crescendo, abrimos três canteiros novos este semestre",
        severidade: "MEDIA",
        criacao: finalizadoEm,
      },
      {
        id: 7,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "CONCORRENCIA",
        descricao: "SoftPlan apresentou proposta concorrente na semana anterior",
        evidencia: "A SoftPlan esteve aqui na terça e deixou uma proposta",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
      {
        id: 8,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "OPORTUNIDADE",
        descricao: "Upsell de módulo de gestão de obras + possível cross-sell de BI",
        evidencia: "Se o módulo de obras funcionar bem, quero ver aquele painel de BI também",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
      {
        id: 9,
        analise: MOCK_ANALISES[reuniaoId],
        tipo: "RISCO_CHURN",
        descricao: "Concorrente com proposta ativa pode acelerar decisão contra nós",
        evidencia: "Se não tivermos resposta até o fim do mês, vou ter que considerar a outra proposta",
        severidade: "ALTA",
        criacao: finalizadoEm,
      },
    ];
    return;
  }

  // Demais reuniões PROCESSADA — sinais genéricos, quantidade variando por id
  // (2 a 4), ciclando pelo pool acima. Determinístico (sem Math.random) pra
  // não variar a cada reload.
  MOCK_ANALISES[reuniaoId] = {
    id: reuniaoId,
    sentimentoGeral: reuniaoId % 3 === 0 ? "NEUTRO" : "POSITIVO",
    statusProcessamento: "PROCESSADA",
    reuniao: MOCK_REUNIOES[idx],
    resumoExecutivo: `Reunião com ${MOCK_REUNIOES[idx].cliente.nome} — a IA identificou os sinais comerciais abaixo a partir da transcrição enviada.`,
    criacao: dataReuniao,
    iniciadoEm,
    finalizadoEm,
    mensagemErro: null,
  };
  const quantidade = 2 + (reuniaoId % 3);
  MOCK_SINAIS[reuniaoId] = Array.from({ length: quantidade }, (_, i) => {
    const base = SINAIS_GENERICOS[(reuniaoId + i) % SINAIS_GENERICOS.length];
    return {
      id: reuniaoId * 100 + i,
      analise: MOCK_ANALISES[reuniaoId],
      tipo: base.tipo,
      descricao: base.descricao,
      evidencia: base.evidencia,
      severidade: "MEDIA",
      criacao: finalizadoEm,
    };
  });
});

export function tiposSinaisDaReuniao(reuniaoId: number): TipoSinalComercial[] {
  return (MOCK_SINAIS[reuniaoId] ?? []).map((s) => s.tipo);
}
