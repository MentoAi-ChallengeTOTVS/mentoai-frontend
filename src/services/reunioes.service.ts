import type {
  AnaliseIA,
  Reuniao,
  SinalComercial,
  StatusProcessamento,
  TipoSinalComercial,
} from "@/types/domain";
import { MOCK_REUNIOES, MOCK_ANALISES, MOCK_SINAIS, tiposSinaisDaReuniao as tiposSinaisDaReuniaoMock } from "@/mocks/reunioes";

/**
 * Camada de serviço — bounded contexts Reunião (`Reuniao`, `Transcricao`) e
 * Análise (`AnaliseIA`, `SinalComercial`). Mesmo racional de
 * `clientes.service.ts`: hoje envolve os mocks de `src/mocks/reunioes.ts`,
 * pronta pra virar `fetch` real.
 *
 * Algumas funções aqui devolvem um "view model" (dado já combinado, ex.:
 * reunião + status + sinais) em vez do tipo de domínio puro — de propósito:
 * é o formato que a tela precisa pra renderizar sem N chamadas extras por
 * linha, e é razoável esperar que os endpoints reais do backend também
 * devolvam os dados já combinados assim (mesmo padrão que uma lista
 * paginada de qualquer API bem desenhada faria).
 */

// ---------- Reuniões — lista ----------

export interface ReuniaoListItem {
  reuniao: Reuniao;
  status: StatusProcessamento;
  tiposSinais: TipoSinalComercial[];
}

/**
 * Lista todas as reuniões, já combinadas com o status de processamento da
 * análise e os tipos de sinal comercial identificados (pro badge da linha
 * na tela de listagem). Filtro/paginação continuam client-side, mesmo
 * comportamento de hoje — só a origem do dado muda.
 * Endpoint esperado: `GET /api/reunioes`
 */
export async function listarReunioesComStatus(): Promise<ReuniaoListItem[]> {
  return MOCK_REUNIOES.map((reuniao) => ({
    reuniao,
    status: MOCK_ANALISES[reuniao.id]?.statusProcessamento ?? "PENDENTE",
    tiposSinais: tiposSinaisDaReuniaoMock(reuniao.id),
  }));
}

/**
 * Conta reuniões com análise `PENDENTE` ou `PROCESSANDO` — usado só pro
 * badge do link "Fila de processamento" no header de `/reunioes`. Contagem
 * estática (não é a simulação de progresso de verdade, que vive em
 * `listarFilaProcessamento`/`/reunioes/fila`).
 * Endpoint esperado: agregado no mesmo `GET /api/reunioes` acima (contagem
 * no backend), ou um `GET /api/analises/fila/contagem` dedicado.
 */
export async function contarEmProcessamento(): Promise<number> {
  return Object.values(MOCK_ANALISES).filter(
    (a) => a.statusProcessamento === "PENDENTE" || a.statusProcessamento === "PROCESSANDO"
  ).length;
}

// ---------- Reunião — detalhe ----------

export interface DetalheReuniao {
  reuniao: Reuniao;
  analise: AnaliseIA | null;
  sinais: SinalComercial[];
}

/**
 * Busca os dados completos da tela Detalhe da Reunião — reunião, análise e
 * sinais comerciais associados, já combinados. Devolve `null` se a reunião
 * não existir (quem chama decide se isso vira `notFound()`).
 * Endpoint esperado: `GET /api/reunioes/{id}` (com análise/sinais
 * aninhados na resposta, ou 2-3 chamadas combinadas aqui dentro do service
 * se o backend preferir endpoints separados — a tela não precisa saber
 * disso, só consome `DetalheReuniao`).
 */
export async function buscarDetalheReuniao(reuniaoId: number): Promise<DetalheReuniao | null> {
  const reuniao = MOCK_REUNIOES.find((r) => r.id === reuniaoId);
  if (!reuniao) return null;
  return {
    reuniao,
    analise: MOCK_ANALISES[reuniaoId] ?? null,
    sinais: MOCK_SINAIS[reuniaoId] ?? [],
  };
}

// ---------- Fila de Processamento (issue #80) ----------

export interface ItemFilaSeed {
  reuniaoId: number;
  reuniao: Reuniao;
  status: "PENDENTE" | "PROCESSANDO";
  progresso: number;
}

/**
 * Estado inicial da fila de processamento — reuniões com análise `PENDENTE`
 * ou `PROCESSANDO` no momento em que a tela carrega, já com a reunião
 * embutida (a tela precisa do nome do cliente/data/duração pra cada linha).
 * A progressão em tempo real (`PENDENTE` -> `PROCESSANDO` -> concluído)
 * continua sendo simulada no client (`setInterval` em
 * `FilaProcessamentoClient.tsx`) — no mundo real isso seria substituído por
 * polling contra este mesmo endpoint ou uma conexão de push
 * (WebSocket/SSE), não por uma resposta única.
 * Endpoint esperado: `GET /api/analises/fila`
 */
export async function listarFilaProcessamento(): Promise<ItemFilaSeed[]> {
  return Object.values(MOCK_ANALISES)
    .filter((a) => a.statusProcessamento === "PENDENTE" || a.statusProcessamento === "PROCESSANDO")
    .map((a) => ({
      reuniaoId: a.reuniao.id,
      reuniao: a.reuniao,
      status: a.statusProcessamento as "PENDENTE" | "PROCESSANDO",
      progresso: a.statusProcessamento === "PROCESSANDO" ? 40 : 0,
    }));
}

// ---------- Nova Reunião — envio de transcrição (issue #70) ----------

export interface EnvioTranscricao {
  clienteId: number;
  data: string;
  nomeArquivo: string;
  tamanhoBytes: number;
}

/**
 * Envia uma transcrição para análise. No mundo real isso seria um
 * `multipart/form-data` com o arquivo; aqui só simula o registro (o
 * conteúdo do arquivo nunca é lido, mesma limitação de hoje). A resposta
 * real de um `POST` assim devolve o registro recém-criado com status
 * `PENDENTE` — a progressão `PROCESSANDO`/`PROCESSADA` que a tela anima
 * depois é responsabilidade da fila (ver `listarFilaProcessamento` acima),
 * não do retorno deste envio.
 * Endpoint esperado: `POST /api/reunioes` (multipart)
 */
export async function enviarTranscricao(
  payload: EnvioTranscricao
): Promise<{ reuniaoId: number; status: "PENDENTE" }> {
  void payload;
  // Sem persistência real (sem estado global entre rotas, gap já
  // documentado) — devolve um id qualquer só pra manter o formato de
  // resposta esperado de uma criação.
  return { reuniaoId: Date.now(), status: "PENDENTE" };
}
