import type { AlertaUsuario } from "@/types/domain";
import { MOCK_ALERTAS_USUARIO } from "@/mocks/alertas";

/**
 * Camada de serviço — bounded context Alertas (`Alerta`, `AlertaUsuario`).
 *
 * Mesmo racional de `clientes.service.ts`/`reunioes.service.ts`: hoje envolve
 * os mocks de `src/mocks/alertas.ts`, mas a assinatura já é a que uma chamada
 * `fetch` real teria — trocar mock por API significa reescrever só o corpo
 * destas funções, sem tocar na tela.
 */

/**
 * Lista os alertas do usuário logado, já combinados com o sinal comercial de
 * origem (e, por tabela, com a análise/reunião/cliente encadeados). É um
 * "view model" de propósito, mesmo padrão de `listarReunioesComStatus`: a
 * tela precisa do nome do cliente em cada linha e não deveria fazer uma
 * chamada extra por alerta pra descobrir isso.
 *
 * Sem parâmetro de usuário porque não há sessão real ainda — o endpoint real
 * deduz o usuário do token e devolve só os alertas dele.
 *
 * Ordenação: mais recentes primeiro (já vem assim do mock). Filtro de
 * prioridade/leitura continua client-side, mesmo comportamento das outras
 * listagens.
 *
 * Endpoint esperado: `GET /api/alertas`
 */
export async function listarAlertas(): Promise<AlertaUsuario[]> {
  return MOCK_ALERTAS_USUARIO;
}

/**
 * Marca um alerta como lido. Sem persistência real — sem estado global entre
 * rotas (gap já documentado nas outras telas), a marcação vale só pro state
 * local da tela e não sobrevive a um F5. Quem chama atualiza o estado
 * otimisticamente antes de aguardar esta função.
 *
 * O id é o de `AlertaUsuario` (a junção alerta↔usuário), não o do `Alerta` —
 * é a linha de leitura que muda, não o alerta em si, que é o mesmo pra todos
 * os destinatários.
 *
 * Endpoint esperado: `PATCH /api/alertas/{alertaUsuarioId}/lido`
 */
export async function marcarComoLido(alertaUsuarioId: number): Promise<void> {
  void alertaUsuarioId;
}
