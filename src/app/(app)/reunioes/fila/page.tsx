import { listarFilaProcessamento } from "@/services/reunioes.service";
import { FilaProcessamentoClient } from "./FilaProcessamentoClient";

/**
 * Fila de Processamento das Análises — issue #80 (F04, Pipeline de Análise
 * IA — confirmado atribuído ao Breno). Sem frame correspondente no Figma
 * (conferido em `page1_metadata.xml` — só existem os frames já usados nas
 * outras telas de Reunião), então montada do zero seguindo o Manual de
 * Identidade Visual e os padrões já usados nas demais telas, mesmo espírito
 * do gap já documentado em "Meu Perfil".
 *
 * Escopo da issue: "fila de processamento, indicadores visuais de status,
 * atualizações periódicas simples e navegação para análises concluídas."
 * Critério de aceite: "Usuário identifica o estado de cada análise."
 *
 * Server Component (busca o seed inicial via `reunioesService.
 * listarFilaProcessamento()`) + Client Component (`FilaProcessamentoClient`,
 * `setInterval` simulando as "atualizações periódicas") — mesmo padrão
 * adotado em todas as telas em 24/08/2026 pra preparar o frontend pro
 * backend. A simulação de progresso em si continua no client: no mundo
 * real ela seria substituída por polling contra o mesmo endpoint ou uma
 * conexão de push (WebSocket/SSE), não por uma resposta única — ver nota
 * completa em `reunioesService.listarFilaProcessamento`.
 */
export default async function FilaProcessamentoPage() {
  const seed = await listarFilaProcessamento();
  return <FilaProcessamentoClient seed={seed} />;
}
