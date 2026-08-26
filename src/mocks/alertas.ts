import type { Alerta, AlertaUsuario, PrioridadeAlerta, SinalComercial } from "@/types/domain";
import { MOCK_SINAIS } from "@/mocks/reunioes";
import { MOCK_USUARIOS } from "@/mocks/usuarios";

/**
 * Dados fictícios de alertas — issue #88 (BL010), mesmo padrão de
 * `clientes.ts`/`usuarios.ts`/`reunioes.ts`.
 *
 * Nenhum alerta é inventado do zero: cada `Alerta` nasce de um
 * `SinalComercial` que já existe em `src/mocks/reunioes.ts`, respeitando o
 * vínculo encadeado do DDD (`Alerta -> SinalComercial -> AnaliseIA ->
 * Reuniao -> Cliente`). Assim todo alerta aponta pra uma reunião/cliente
 * reais da base mock — sem risco de citar um cliente que não existe na tela
 * de Clientes, e sem precisar da FK direta pra `Cliente` que o domínio não
 * tem (gap conhecido, item 4 do roteiro de validação).
 *
 * **Regra de geração** (decisão nossa, não do domínio): nem todo sinal
 * comercial vira alerta — senão a tela viraria um espelho da base inteira de
 * sinais. Vira alerta o sinal que pede ação do executivo:
 * - qualquer sinal de severidade `ALTA`; ou
 * - qualquer `RISCO_CHURN`/`CONCORRENCIA`/`OPORTUNIDADE` (esses pedem atenção
 *   mesmo em severidade menor — os dois primeiros por ameaça, o terceiro por
 *   janela de venda que fecha).
 * Quando o backend existir, essa regra passa a viver lá (é ele quem cria os
 * registros de `Alerta`) — aqui ela só reproduz o resultado esperado.
 */

const TIPOS_SEMPRE_ALERTA: readonly string[] = ["RISCO_CHURN", "CONCORRENCIA", "OPORTUNIDADE"];

function viraAlerta(sinal: SinalComercial): boolean {
  return sinal.severidade === "ALTA" || TIPOS_SEMPRE_ALERTA.includes(sinal.tipo);
}

/**
 * Prioridade do alerta a partir do sinal de origem. `RISCO_CHURN` sobe pra
 * ALTA mesmo em severidade média — perder o cliente é o pior desfecho do
 * produto. Concorrência fica em MEDIA (ameaça, mas com tempo de reagir) e o
 * resto — oportunidades sem urgência declarada — cai em BAIXA.
 */
function prioridadeDoSinal(sinal: SinalComercial): PrioridadeAlerta {
  if (sinal.severidade === "ALTA" || sinal.tipo === "RISCO_CHURN") return "ALTA";
  if (sinal.tipo === "CONCORRENCIA") return "MEDIA";
  return "BAIXA";
}

/**
 * Teto de alertas por reunião. A reunião com roteiro dedicado do Figma tem 9
 * sinais, 6 deles de severidade ALTA — sem teto, ela sozinha ocupa a primeira
 * página inteira da Central de Alertas e o executivo não vê mais nada. Um
 * limite por origem é o que qualquer sistema de alerta real faz pra não
 * afogar a caixa; aqui ele fica no mock porque é o mock que gera os alertas.
 */
const MAX_ALERTAS_POR_REUNIAO = 3;

const SINAIS_RELEVANTES: SinalComercial[] = Object.values(MOCK_SINAIS)
  .flatMap((sinaisDaReuniao) => sinaisDaReuniao.filter(viraAlerta).slice(0, MAX_ALERTAS_POR_REUNIAO))
  // Mais recentes primeiro — é a ordem que a tela mostra por padrão.
  .sort((a, b) => new Date(b.criacao).getTime() - new Date(a.criacao).getTime());

export const MOCK_ALERTAS: Alerta[] = SINAIS_RELEVANTES.map((sinal, i) => ({
  id: i + 1,
  prioridade: prioridadeDoSinal(sinal),
  descricao: sinal.descricao,
  sinalComercial: sinal,
  criacao: sinal.criacao,
}));

/**
 * Usuário-alvo dos alertas neste mock. `AlertaUsuario` é a tabela de
 * junção que marca leitura por usuário — como não existe sessão real
 * (`src/lib/auth.tsx` é mockado), todos os alertas apontam pro mesmo
 * usuário. Quando a autenticação real existir, o backend já devolve só os
 * alertas do usuário logado e este campo sai daqui.
 */
const USUARIO_ALVO = MOCK_USUARIOS[1]; // Carlos Mendes — Executivo Comercial

export const MOCK_ALERTAS_USUARIO: AlertaUsuario[] = MOCK_ALERTAS.map((alerta, i) => ({
  id: i + 1,
  alerta,
  usuario: USUARIO_ALVO,
  // Determinístico (sem Math.random) pra não variar a cada reload: 1 em cada
  // 3 já lido, o suficiente pro filtro de Lido/Não lido ter os dois casos.
  lido: i % 3 === 0,
  lidoEm: i % 3 === 0 ? alerta.criacao : null,
}));
