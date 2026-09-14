import type { PrioridadeAlerta } from "@/types/domain";
import type { AlertaResponse, AlertaUsuarioResponse, SpringPage } from "@/types/api";
import { chamarApi } from "./api";

/**
 * Camada de serviço — bounded context Alertas (`Alerta`, `AlertaUsuario`).
 *
 * A partir de 13/09/2026 chama a API real (`AlertaController` do backend,
 * branch `dev`) via `chamarApi`. O "view model" mudou de `AlertaUsuario`
 * (domain.ts, cadeia aninhada `alerta.sinalComercial.analise.reuniao.
 * cliente`) pra `AlertaListItem`, mais plano — ver o GAP documentado abaixo
 * sobre por que a cadeia até o cliente não dá pra reconstruir hoje.
 */

export interface AlertaListItem {
  /** Id do `Alerta` (não de `AlertaUsuario`) — é o que `GET /api/v1/alertas` devolve. */
  id: number;
  analiseId: number | null;
  reuniaoId: number | null;
  motivo: string;
  prioridade: PrioridadeAlerta;
  criacao: string;
  /**
   * Local ao cliente, não vem do backend: `GET /api/v1/alertas` devolve
   * `Alerta`, não `AlertaUsuario` (não tem campo `lido`/`lidoEm` por
   * usuário). Sem endpoint de listagem por usuário ainda, a marcação de
   * lido feita aqui é otimista e não sobrevive a um F5 — mesma limitação já
   * documentada nas outras telas, só que agora a chamada de marcar-como-lido
   * em si é real (ver `marcarComoLido`).
   */
  lido: boolean;
}

function toAlertaListItem(dto: AlertaResponse): AlertaListItem {
  return {
    id: dto.id,
    analiseId: dto.analiseId,
    reuniaoId: dto.reuniaoId,
    motivo: dto.motivo,
    prioridade: dto.prioridade,
    criacao: dto.criacao,
    lido: false,
  };
}

/**
 * Lista os alertas mais recentes.
 *
 * A resposta inclui os IDs da análise e reunião vinculadas ao sinal para que
 * a Central de Alertas possa levar diretamente ao detalhe da análise.
 * Endpoint: `GET /api/v1/alertas?page=0&size=50&sort=criacao,desc`
 */
export async function listarAlertas(): Promise<AlertaListItem[]> {
  const pagina = await chamarApi<SpringPage<AlertaResponse>>(
    "/api/v1/alertas?page=0&size=50&sort=criacao,desc",
    { cache: "no-store" }
  );
  return pagina.content.map(toAlertaListItem);
}

/**
 * Marca um alerta como lido. Quem chama atualiza o estado local
 * otimisticamente antes de aguardar esta função (mesmo padrão de antes).
 *
 * Nota sobre o id: o endpoint real (`PATCH /api/v1/alertas/{id}/lido`)
 * resolve `{id}` internamente como o id de `AlertaUsuario`
 * (`AlertaUsuarioService.marcarComoLido`), não o de `Alerta` — mas
 * `GET /api/v1/alertas` (e portanto esta tela) só expõe ids de `Alerta`, e é
 * esse id que a collection (`PATCH .../alertas/1/lido` logo após
 * `GET .../alertas/1`) usa como exemplo. Ou seja: hoje há uma divergência
 * entre o que o path da rota sugere e o que o serviço espera — vale
 * confirmar com quem mantém o backend qual dos dois ids este endpoint
 * deveria aceitar antes de depender disso em produção.
 * Endpoint: `PATCH /api/v1/alertas/{id}/lido`
 */
export async function marcarComoLido(alertaId: number): Promise<void> {
  await chamarApi<AlertaUsuarioResponse>(`/api/v1/alertas/${alertaId}/lido`, {
    method: "PATCH",
    cache: "no-store",
  });
}
