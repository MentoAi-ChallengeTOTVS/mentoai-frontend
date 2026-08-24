/**
 * Tipos de domínio — MentoAI
 *
 * Espelham exatamente as entidades e enumerações documentadas em
 * `mentoai_documentacao_ddd.pdf` / `diagrama_de_classes.png`. Nomes de
 * entidades, campos e enums permanecem em português, como documentado —
 * não traduzir para inglês.
 *
 * Convenções de tipo: Long -> number, LocalDateTime -> string (ISO 8601),
 * Boolean/boolean -> boolean.
 *
 * Gaps de domínio conhecidos (ver claude/auditoria_status_telas.md no projeto):
 * - `Chat` não tem FK direta pra `Cliente` nem `Reuniao`.
 * - `Alerta` não tem FK direta pra `Cliente` (vínculo encadeado via
 *   SinalComercial -> AnaliseIA -> Reuniao -> Cliente).
 */

// ---------- Enumerações ----------

export type TipoInsight = "RISCO" | "OPORTUNIDADE" | "TENDENCIA" | "ESTRATEGICO";

export type SentimentoGeral = "POSITIVO" | "NEUTRO" | "NEGATIVO";

export type Severidade = "BAIXA" | "MEDIA" | "ALTA";

export type StatusProcessamento =
  | "PENDENTE"
  | "PROCESSANDO"
  | "PROCESSADA"
  | "ERRO";

export type TipoSinalComercial =
  | "NECESSIDADE"
  | "DOR"
  | "OBJECAO"
  | "ORCAMENTO"
  | "PRAZO"
  | "MOMENTO_CLIENTE"
  | "CONCORRENCIA"
  | "OPORTUNIDADE"
  | "RISCO_CHURN";

export type PerfilUsuario = "EXECUTIVO_COMERCIAL" | "DIRETOR_COMERCIAL";

export type PrioridadeAlerta = "BAIXA" | "MEDIA" | "ALTA";

// ---------- Entidades ----------

export interface Cliente {
  id: number;
  nome: string;
  segmento: string;
  porte: string;
  criacao: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  // senha nunca deve trafegar/renderizar no frontend
  perfil: PerfilUsuario;
  ativo: boolean;
  criacao: string;
  atualizacao: string;
}

export interface Reuniao {
  id: number;
  dataReuniao: string;
  duracaoMinutos: number;
  criacao: string;
  cliente: Cliente;
  usuario: Usuario;
}

export interface Transcricao {
  id: number;
  conteudo: string;
  nomeArquivo: string;
  formatoArquivo: string;
  idioma: string;
  reuniao: Reuniao;
  criacao: string;
}

export interface AnaliseIA {
  id: number;
  sentimentoGeral: SentimentoGeral;
  statusProcessamento: StatusProcessamento;
  reuniao: Reuniao;
  resumoExecutivo: string;
  criacao: string;
  iniciadoEm: string;
  finalizadoEm: string | null;
  mensagemErro: string | null;
}

export interface Insight {
  id: number;
  tipo: TipoInsight;
  descricao: string;
  severidade: Severidade;
  analise: AnaliseIA;
  criacao: string;
}

export interface SinalComercial {
  id: number;
  analise: AnaliseIA;
  tipo: TipoSinalComercial;
  descricao: string;
  severidade: Severidade;
  evidencia: string;
  criacao: string;
}

export interface Alerta {
  id: number;
  prioridade: PrioridadeAlerta;
  descricao: string;
  sinalComercial: SinalComercial;
  criacao: string;
}

export interface AlertaUsuario {
  id: number;
  alerta: Alerta;
  usuario: Usuario;
  lido: boolean;
  lidoEm: string | null;
}

export interface Chat {
  id: number;
  titulo: string;
  usuario: Usuario;
  criacao: string;
}

export interface PerguntaChat {
  id: number;
  pergunta: string;
  resposta: string;
  chat: Chat;
  criacao: string;
}
