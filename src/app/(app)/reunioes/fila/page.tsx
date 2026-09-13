import { listarFilaProcessamento } from "@/services/reunioes.service";
import { FilaProcessamentoClient } from "./FilaProcessamentoClient";

/**
 * Fila de Processamento das Análises — issue #80 (F04, Pipeline de Análise
 * IA — atribuído ao Breno). Sem frame correspondente no Figma, montada
 * seguindo o Manual de Identidade Visual e os padrões já usados nas demais
 * telas, mesmo espírito do gap já documentado em "Meu Perfil".
 *
 * A partir de 13/09/2026 (tarefa "conectar Fila de Processamento ->
 * Analysis/getFila"): a simulação local de progresso (`setInterval`
 * incrementando um percentual fake) saiu — a tela agora faz polling real a
 * cada 2s contra `GET /api/v1/analises/fila` e renderiza exatamente o que o
 * backend devolve (sem barra de progresso/percentual, removida a pedido).
 *
 * Server Component (busca o estado inicial via `reunioesService.
 * listarFilaProcessamento()`, evita a tela nascer vazia até o primeiro
 * poll) + Client Component (`FilaProcessamentoClient`, dono do
 * `setInterval` de polling).
 */
export default async function FilaProcessamentoPage() {
  const seed = await listarFilaProcessamento();
  return <FilaProcessamentoClient seed={seed} />;
}
