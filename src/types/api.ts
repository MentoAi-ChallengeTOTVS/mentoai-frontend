/**
 * DTOs da API real (`mentoai-api`) — espelham exatamente os `record`/response
 * do backend (branch `dev`, pacotes `*.presentation.rest.response` e
 * `analysis.application.dto`), confirmados lendo o código-fonte em
 * 13/09/2026, não só a collection `mentoai-collection`.
 *
 * `domain.ts` documenta as entidades DDD tal como o time desenhou — com
 * relações aninhadas (`Reuniao.cliente: Cliente`, `AnaliseIA.reuniao:
 * Reuniao`, etc.) — mas vários endpoints reais devolvem chaves estrangeiras
 * (`clienteId`, `analiseId`...), não objetos aninhados. `Cliente` é a
 * exceção: bate campo a campo com `ClienteResponse` (por isso os services
 * chamam `chamarApi<Cliente>(...)` direto, sem DTO próprio aqui) — os
 * outros tipos abaixo existem só onde `domain.ts` não serve pra tipar a
 * resposta crua da API; os services combinam esses DTOs pra reconstruir o
 * formato que as telas/design system esperam.
 */

import type {
  PrioridadeAlerta,
  SentimentoGeral,
  StatusProcessamento,
  TipoInsight,
  TipoSinalComercial,
} from "./domain";

/** Página no formato que `ClienteController.listar` devolve (não é o `Page<T>` padrão do Spring, é um shape próprio do backend). */
export interface ClientePageResponse<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface ReuniaoResponse {
  id: number;
  dataReuniao: string;
  duracaoMinutos: number;
  clienteId: number;
  usuarioId: number;
  criacao: string;
}

export interface InsightResponse {
  id: number;
  analiseId: number;
  tipo: TipoInsight;
  descricao: string;
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  criacao: string;
}

/** `RelevanciaSinal` do backend — mesmos 3 valores de `Severidade`/`PrioridadeAlerta`, mas é o nome real do campo em `SinalComercial` (não "severidade", como `domain.ts` documentava). */
export type RelevanciaSinal = "BAIXA" | "MEDIA" | "ALTA";

export interface SinalComercialResponse {
  id: number;
  analiseId: number;
  tipo: TipoSinalComercial;
  descricao: string;
  evidencia: string;
  relevancia: RelevanciaSinal;
  criacao: string;
}

export interface AnaliseIAResponse {
  id: number;
  reuniaoId: number;
  resumoExecutivo: string;
  sentimentoGeral: SentimentoGeral;
  statusProcessamento: StatusProcessamento;
  criacao: string;
  iniciadoEm: string;
  finalizadoEm: string | null;
  mensagemErro: string | null;
  insights: InsightResponse[];
  sinaisComerciais: SinalComercialResponse[];
}

/** Item de `GET /api/v1/analises/fila` — já vem com `clienteNome` resolvido pelo backend, ao contrário dos outros endpoints de reunião/análise. */
export interface AnaliseFilaItemResponse {
  analiseId: number;
  reuniaoId: number;
  clienteId: number;
  clienteNome: string;
  status: StatusProcessamento;
  criadoEm: string;
  iniciadoEm: string | null;
  finalizadoEm: string | null;
  mensagemErro: string | null;
}

export interface AnaliseFilaResponse {
  fila: AnaliseFilaItemResponse[];
  finalizados: AnaliseFilaItemResponse[];
}

export interface AlertaResponse {
  id: number;
  sinalComercialId: number | null;
  prioridade: PrioridadeAlerta;
  motivo: string;
  criacao: string;
}

export interface AlertaUsuarioResponse {
  id: number;
  alertaId: number | null;
  usuarioId: number | null;
  lido: boolean;
  lidoEm: string | null;
}

/** Formato padrão de página do Spring Data (`Page<T>` serializado) — usado por `GET /api/v1/alertas`, ao contrário de `ClientePageResponse` acima. */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual, 0-based
  size: number;
}
