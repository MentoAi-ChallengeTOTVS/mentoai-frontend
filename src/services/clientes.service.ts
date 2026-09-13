import type { Cliente } from "@/types/domain";
import type { ClientePageResponse } from "@/types/api";
import { chamarApi, chamarApiOuNull } from "./api";

/**
 * Camada de serviço — bounded context Reunião (entidade `Cliente`).
 *
 * A partir de 13/09/2026, `listarClientes`/`buscarClientePorId` chamam a API
 * real via `chamarApi`/`chamarApiOuNull` (`GET /api/v1/clientes`,
 * `GET /api/v1/clientes/{id}` — confirmados no `ClienteController` do
 * backend). `Cliente` (domain.ts) bate campo a campo com a resposta real do
 * backend, então usamos o tipo de domínio direto como genérico — sem DTO
 * próprio em `types/api.ts` pra isso. `criarCliente`/`atualizarCliente`
 * continuam mock — fora do escopo das 4 telas atribuídas nesta rodada
 * (Fila, Reuniões, Detalhe da Reunião, Alertas).
 */

/**
 * Lista clientes. `GET /api/v1/clientes` é paginado no backend (máx. 100 por
 * página, validado no controller) — pedimos o teto pra cobrir os usos atuais
 * (dropdown de filtro em Reuniões, resolução de nome por id na listagem).
 * Se a base crescer além de 100 clientes isso deixa de ser suficiente e
 * passa a precisar de paginação de verdade aqui — não é o caso hoje.
 * Endpoint: `GET /api/v1/clientes?page=0&size=100&sort=nome&direction=asc`
 */
export async function listarClientes(): Promise<Cliente[]> {
  const pagina = await chamarApi<ClientePageResponse<Cliente>>(
    "/api/v1/clientes?page=0&size=100&sort=nome&direction=asc",
    { cache: "no-store" }
  );
  return pagina.conteudo;
}

/**
 * Busca um cliente por id. Devolve `null` em 404 (cliente inexistente) —
 * quem chama decide se isso vira `notFound()`, mensagem de erro, etc.
 * Endpoint: `GET /api/v1/clientes/{id}`
 */
export async function buscarClientePorId(id: number): Promise<Cliente | null> {
  return chamarApiOuNull<Cliente>(`/api/v1/clientes/${id}`, { cache: "no-store" });
}

/** Dado de formulário pra criar/editar cliente (mesmo formato usado por `PanelCadastroCliente`). */
export interface NovoClienteInput {
  nome: string;
  segmento: string;
  porte: string;
}

/**
 * Cria um cliente novo. Ainda mock — não faz parte das 4 telas atribuídas
 * nesta rodada. O backend já tem `POST /api/v1/clientes` implementado
 * (`ClienteController.criar`); trocar isto por `chamarApi` real é o próximo
 * passo natural quando essa tela entrar em escopo.
 */
export async function criarCliente(dados: NovoClienteInput): Promise<Cliente> {
  return { id: Date.now(), criacao: new Date().toISOString(), ...dados };
}

/**
 * Atualiza um cliente existente. Ainda mock, mesmo motivo de `criarCliente`
 * — o backend já expõe `PUT /api/v1/clientes/{id}`.
 */
export async function atualizarCliente(id: number, dados: NovoClienteInput): Promise<void> {
  void id;
  void dados;
}
