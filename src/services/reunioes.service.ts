import type { Cliente, Reuniao, StatusProcessamento, TipoSinalComercial, Usuario } from "@/types/domain";
import type {
  AnaliseFilaResponse,
  AnaliseIAResponse,
  InsightResponse,
  ReuniaoResponse,
  SinalComercialResponse,
} from "@/types/api";
import { chamarApi, chamarApiOuNull } from "./api";
import { buscarClientePorId, listarClientes } from "./clientes.service";

/**
 * Camada de serviço — bounded contexts Reunião (`Reuniao`, `Transcricao`) e
 * Análise (`AnaliseIA`, `SinalComercial`, `Insight`).
 *
 * A partir de 13/09/2026 as 4 funções abaixo usadas pelas telas atribuídas
 * nesta rodada (Fila de Processamento, Listar Reuniões, Detalhe da Reunião)
 * chamam a API real (`mentoai-api`, branch `dev`) via `chamarApi`/
 * `chamarApiOuNull` (`services/api.ts`) em vez dos mocks de
 * `src/mocks/reunioes.ts`. `enviarTranscricao` (Nova Reunião) continua mock —
 * fora do escopo desta rodada.
 */

// ---------- Reconstrução de `Reuniao` (domain.ts) a partir dos DTOs planos da API ----------

/**
 * GAP conhecido: `GET /api/v1/reunioes(/{id})` só devolve `usuarioId`, nunca
 * o `Usuario` aninhado — e nenhuma das telas atuais (listagem, detalhe,
 * fila) exibe nome/e-mail do executivo responsável. Placeholder mínimo só
 * pra satisfazer `domain.Reuniao.usuario`; se uma tela futura precisar desse
 * dado de verdade, isso vira uma chamada a `GET /api/v1/usuarios/{id}`.
 */
function usuarioPlaceholder(usuarioId: number): Usuario {
  return {
    id: usuarioId,
    nome: "",
    email: "",
    perfil: "EXECUTIVO_COMERCIAL",
    ativo: true,
    criacao: "",
    atualizacao: "",
  };
}

function clientePlaceholder(clienteId: number, criacao: string): Cliente {
  return { id: clienteId, nome: "Cliente não encontrado", segmento: "", porte: "", criacao };
}

function toReuniao(dto: ReuniaoResponse, cliente: Cliente): Reuniao {
  return {
    id: dto.id,
    dataReuniao: dto.dataReuniao,
    duracaoMinutos: dto.duracaoMinutos,
    criacao: dto.criacao,
    cliente,
    usuario: usuarioPlaceholder(dto.usuarioId),
  };
}

// ---------- Reuniões — lista ----------

export interface ReuniaoListItem {
  reuniao: Reuniao;
  status: StatusProcessamento;
  tiposSinais: TipoSinalComercial[];
}

/**
 * Lista todas as reuniões, já combinadas com o status de processamento da
 * análise e os tipos de sinal comercial identificados (pro badge da linha
 * na tela de listagem).
 *
 * `GET /api/v1/reunioes` só devolve `clienteId` — resolvemos o nome buscando
 * todos os clientes uma vez (`listarClientes`) e caindo pra
 * `buscarClientePorId` individual só se um id não aparecer nessa lista (ex.:
 * mais de 100 clientes, ver nota em `clientes.service.ts`). Status/sinais
 * vêm de `GET /api/v1/analises/reuniao/{id}` por reunião — 404 (sem análise
 * ainda) vira status PENDENTE e sinais vazios, mesmo comportamento do mock
 * anterior.
 * Endpoint: `GET /api/v1/reunioes`
 */
export async function listarReunioesComStatus(): Promise<ReuniaoListItem[]> {
  const [reunioes, clientes] = await Promise.all([
    chamarApi<ReuniaoResponse[]>("/api/v1/reunioes", { cache: "no-store" }),
    listarClientes(),
  ]);
  const clientePorId = new Map(clientes.map((c) => [c.id, c]));

  return Promise.all(
    reunioes.map(async (r) => {
      const cliente =
        clientePorId.get(r.clienteId) ??
        (await buscarClientePorId(r.clienteId)) ??
        clientePlaceholder(r.clienteId, r.criacao);
      const analise = await chamarApiOuNull<AnaliseIAResponse>(
        `/api/v1/analises/reuniao/${r.id}`,
        { cache: "no-store" }
      );
      return {
        reuniao: toReuniao(r, cliente),
        status: analise?.statusProcessamento ?? "PENDENTE",
        tiposSinais: (analise?.sinaisComerciais ?? []).map((s) => s.tipo),
      };
    })
  );
}

/**
 * Conta reuniões com análise em fila (`PENDENTE`/`PROCESSANDO`) — usado só
 * pro badge do link "Fila de processamento" no header de `/reunioes`.
 * Reaproveita `GET /api/v1/analises/fila` (o array `fila` já é, por
 * definição do backend, só PENDENTE/PROCESSANDO) em vez de recontar a
 * listagem inteira de reuniões.
 * Endpoint: `GET /api/v1/analises/fila`
 */
export async function contarEmProcessamento(): Promise<number> {
  const fila = await chamarApi<AnaliseFilaResponse>("/api/v1/analises/fila", { cache: "no-store" });
  return fila.fila.length;
}

// ---------- Reunião — detalhe ----------

export interface DetalheReuniao {
  reuniao: Reuniao;
  analise: AnaliseIAResponse | null;
  sinais: SinalComercialResponse[];
  insights: InsightResponse[];
}

/**
 * Busca os dados completos da tela Detalhe da Reunião — reunião, cliente,
 * análise, sinais comerciais e insights, já combinados. Devolve `null` se a
 * reunião não existir (quem chama decide se isso vira `notFound()`).
 *
 * Encadeamento: `Buscar reunião por ID` -> pega `clienteId` -> `Buscar
 * cliente por ID` -> nome do cliente (pro título "Reunião — {{NOME_CLIENTE}}"
 * na página). Análise vem de `GET /api/v1/analises/reuniao/{id}` — 404 (sem
 * análise ainda, reunião recém-criada) vira `analise: null` e listas vazias;
 * o backend também devolve `insights`/`sinaisComerciais` vazios enquanto o
 * status não é `PROCESSADA`, mesmo com análise já existindo.
 * Endpoints: `GET /api/v1/reunioes/{id}`, `GET /api/v1/clientes/{id}`,
 * `GET /api/v1/analises/reuniao/{id}`
 */
export async function buscarDetalheReuniao(reuniaoId: number): Promise<DetalheReuniao | null> {
  const reuniaoDto = await chamarApiOuNull<ReuniaoResponse>(`/api/v1/reunioes/${reuniaoId}`, {
    cache: "no-store",
  });
  if (!reuniaoDto) return null;

  const cliente =
    (await buscarClientePorId(reuniaoDto.clienteId)) ?? clientePlaceholder(reuniaoDto.clienteId, reuniaoDto.criacao);
  const analise = await chamarApiOuNull<AnaliseIAResponse>(
    `/api/v1/analises/reuniao/${reuniaoId}`,
    { cache: "no-store" }
  );

  return {
    reuniao: toReuniao(reuniaoDto, cliente),
    analise,
    sinais: analise?.sinaisComerciais ?? [],
    insights: analise?.insights ?? [],
  };
}

// ---------- Fila de Processamento (issue #80) ----------

/**
 * Estado atual da fila de processamento — `fila` (PENDENTE/PROCESSANDO) e
 * `finalizados` (PROCESSADA/ERRO), ambos já com `clienteNome` resolvido pelo
 * próprio backend. Chamado tanto pela carga inicial (Server Component) quanto
 * pelo polling a cada 2s do Client Component (`FilaProcessamentoClient`) — a
 * progressão de estado agora vem inteiramente do servidor, sem simulação
 * local de progresso/percentual.
 * Endpoint: `GET /api/v1/analises/fila`
 */
export async function listarFilaProcessamento(): Promise<AnaliseFilaResponse> {
  return chamarApi<AnaliseFilaResponse>("/api/v1/analises/fila", { cache: "no-store" });
}

// ---------- Nova Reunião — envio de transcrição (issue #70) ----------

export interface EnvioTranscricao {
  clienteId: number;
  data: string;
  nomeArquivo: string;
  tamanhoBytes: number;
}

/**
 * Envia uma transcrição para análise. Ainda mock — fora do escopo das 4
 * telas atribuídas nesta rodada. O backend já expõe um endpoint de upload
 * (multipart, ver "Enviar transcrição para análise" na collection) — trocar
 * isto por `chamarApi` real é o próximo passo natural quando essa tela
 * entrar em escopo.
 */
export async function enviarTranscricao(
  payload: EnvioTranscricao
): Promise<{ reuniaoId: number; status: "PENDENTE" }> {
  void payload;
  return { reuniaoId: Date.now(), status: "PENDENTE" };
}
