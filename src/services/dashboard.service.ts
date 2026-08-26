import type {
  ClienteAtencaoRow,
  ResumoGeralSinais,
  TendenciaMes,
} from "@/components/design-system/Cards";
import type { SinalComercial, TipoSinalComercial } from "@/types/domain";
import { MOCK_CLIENTES } from "@/mocks/clientes";
import { MOCK_ANALISES, MOCK_SINAIS } from "@/mocks/reunioes";
import { MOCK_ALERTAS_USUARIO } from "@/mocks/alertas";

/**
 * Camada de serviço — Dashboard Executivo (issue #90, BL009).
 *
 * Diferente dos outros services, o Dashboard não tem entidade própria no
 * domínio: KPIs, tendência e "clientes que precisam de atenção" são
 * agregações sobre `Cliente`/`Reuniao`/`AnaliseIA`/`SinalComercial`/`Alerta`
 * que já existem. Calcular isso aqui é de propósito — é exatamente a
 * responsabilidade que um endpoint agregado do backend teria (`GET
 * /api/dashboard`), e deixa a tela como um render puro do resultado.
 *
 * **Todos os números saem do dado mockado real, não dos números de exemplo
 * do Figma** (que mostra 128 clientes / 47 reuniões / 8 riscos / 23
 * oportunidades). Mesma decisão já registrada nas telas do Breno: dado real
 * derivado prevalece, e a diferença fica documentada em vez de o mock ser
 * forçado a bater com o Figma. Os quatro KPIs, os rótulos e a ordem seguem o
 * frame `dashboard-executivo-mentoai` (74:590).
 */

// ---------- Classificação de sinal ----------
// As 4 famílias do "Resumo Geral" do Card/Tendencia-Sinais. `alertas` é a
// categoria guarda-chuva: tudo que não é oportunidade, risco de churn ou
// concorrência (necessidade, dor, objeção, orçamento, prazo, momento).

type FamiliaSinal = "oportunidades" | "riscos" | "concorrencia" | "alertas";

function familiaDoSinal(tipo: TipoSinalComercial): FamiliaSinal {
  if (tipo === "OPORTUNIDADE") return "oportunidades";
  if (tipo === "RISCO_CHURN") return "riscos";
  if (tipo === "CONCORRENCIA") return "concorrencia";
  return "alertas";
}

export interface DashboardKpis {
  /** Clientes na carteira. `Cliente` não tem flag de ativo/inativo no domínio, então é a base inteira. */
  totalClientes: number;
  /** Clientes cadastrados no mês corrente — vira o "+N este mês" do primeiro card. */
  novosClientesNoMes: number;
  /** Reuniões com análise concluída no mês corrente. */
  reunioesAnalisadasNoMes: number;
  /** Clientes distintos com pelo menos um sinal de `RISCO_CHURN`. */
  clientesEmRisco: number;
  /** Sinais do tipo `OPORTUNIDADE` identificados pela IA (base inteira). */
  oportunidades: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  clientesAtencao: ClienteAtencaoRow[];
  tendencia: TendenciaMes[];
  resumo: ResumoGeralSinais;
}

const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Quantos meses o gráfico de tendência cobre (bate com "Últimos 6 meses" do card). */
const MESES_TENDENCIA = 6;

/** Máximo de linhas na tabela "Clientes que Precisam de Atenção" — o card não rola. */
const MAX_CLIENTES_ATENCAO = 6;

function chaveMes(iso: string) {
  return iso.slice(0, 7); // "2026-08"
}

/**
 * Últimos N meses terminando no mês corrente, do mais antigo pro mais novo.
 *
 * A base temporal é a data de execução. Hoje a rota é estática (nada nela é
 * dinâmico, então o Next prerenderiza no build) — ou seja, "mês corrente" é o
 * mês do build. Assim que o corpo destas funções virar `fetch` de verdade a
 * rota passa a ser dinâmica sozinha e isso se resolve; não vale forçar
 * `dynamic = "force-dynamic"` agora só por causa do mock.
 *
 * Com o mock congelado em 2026, os meses vão esvaziando conforme o tempo real
 * passa — mesma coisa, some quando o backend entrar.
 */
function ultimosMeses(agora: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - (quantidade - 1 - i), 1));
    return {
      chave: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: MESES_CURTOS[d.getUTCMonth()],
    };
  });
}

/**
 * Dados completos do Dashboard, em uma chamada só.
 * Endpoint esperado: `GET /api/dashboard`
 */
export async function buscarDashboard(): Promise<DashboardData> {
  const agora = new Date();
  const mesAtual = chaveMes(agora.toISOString());

  const todosSinais: SinalComercial[] = Object.values(MOCK_SINAIS).flat();
  const analises = Object.values(MOCK_ANALISES);

  // ---------- KPIs ----------
  const clientesEmRisco = new Set(
    todosSinais
      .filter((s) => s.tipo === "RISCO_CHURN")
      .map((s) => s.analise.reuniao.cliente.id)
  ).size;

  const kpis: DashboardKpis = {
    totalClientes: MOCK_CLIENTES.length,
    novosClientesNoMes: MOCK_CLIENTES.filter((c) => chaveMes(c.criacao) === mesAtual).length,
    reunioesAnalisadasNoMes: analises.filter(
      (a) => a.statusProcessamento === "PROCESSADA" && chaveMes(a.reuniao.dataReuniao) === mesAtual
    ).length,
    clientesEmRisco,
    oportunidades: todosSinais.filter((s) => s.tipo === "OPORTUNIDADE").length,
  };

  // ---------- Clientes que precisam de atenção ----------
  // Derivado dos alertas de prioridade ALTA (não de uma regra própria), pra
  // não existirem duas definições de "cliente em risco" no código. Um cliente
  // aparece uma vez só, pelo alerta mais recente dele — que já vem primeiro
  // na lista de `MOCK_ALERTAS_USUARIO`.
  const clientesAtencao: ClienteAtencaoRow[] = [];
  const jaListados = new Set<string>();
  for (const { alerta } of MOCK_ALERTAS_USUARIO) {
    if (alerta.prioridade !== "ALTA") continue;
    const nome = alerta.sinalComercial.analise.reuniao.cliente.nome;
    if (jaListados.has(nome)) continue;
    jaListados.add(nome);
    clientesAtencao.push({ cliente: nome, motivo: alerta.descricao, prioridade: alerta.prioridade });
    if (clientesAtencao.length === MAX_CLIENTES_ATENCAO) break;
  }

  // ---------- Tendência mensal ----------
  // Agregação real por mês de criação do sinal (que é o fim da análise da
  // reunião). Meses sem reunião no mock aparecem zerados de propósito — é o
  // dado que existe, não um enfeite.
  const tendencia: TendenciaMes[] = ultimosMeses(agora, MESES_TENDENCIA).map(({ chave, label }) => {
    const doMes = todosSinais.filter((s) => chaveMes(s.criacao) === chave);
    return {
      mes: label,
      oportunidades: doMes.filter((s) => familiaDoSinal(s.tipo) === "oportunidades").length,
      alertas: doMes.filter((s) => familiaDoSinal(s.tipo) === "alertas").length,
      riscos: doMes.filter((s) => familiaDoSinal(s.tipo) === "riscos").length,
    };
  });

  // ---------- Resumo geral (base inteira, não só os 6 meses do gráfico) ----------
  const resumo: ResumoGeralSinais = {
    oportunidades: todosSinais.filter((s) => familiaDoSinal(s.tipo) === "oportunidades").length,
    alertas: todosSinais.filter((s) => familiaDoSinal(s.tipo) === "alertas").length,
    riscos: todosSinais.filter((s) => familiaDoSinal(s.tipo) === "riscos").length,
    concorrencia: todosSinais.filter((s) => familiaDoSinal(s.tipo) === "concorrencia").length,
  };

  return { kpis, clientesAtencao, tendencia, resumo };
}
