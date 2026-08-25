import type { Cliente } from "@/types/domain";
import { MOCK_CLIENTES } from "@/mocks/clientes";

/**
 * Camada de serviço — bounded context Reunião (entidade `Cliente`).
 *
 * Ponto único de acesso a dado de cliente pras telas consumirem. Hoje
 * devolve os mocks de `src/mocks/clientes.ts`; quando o backend Java
 * existir, o corpo de cada função troca pra um `fetch` contra a API — a
 * assinatura (parâmetros, tipo de retorno, `Promise`) já é a mesma que uma
 * chamada real teria, então nenhuma tela que consome este serviço precisa
 * mudar.
 *
 * Nenhum artificial delay aqui de propósito: essas funções só leem uma
 * lista/registro em memória, sem nada assíncrono de verdade — o delay
 * artificial existe só onde a tela já simula uma ação de rede específica
 * (ex.: envio de reunião, geração de sugestões).
 */

/**
 * Lista todos os clientes.
 * Endpoint esperado: `GET /api/clientes`
 */
export async function listarClientes(): Promise<Cliente[]> {
  return MOCK_CLIENTES;
}

/**
 * Busca um cliente por id. Devolve `null` se não existir (ao invés de
 * lançar) — quem chama decide se isso vira `notFound()`, mensagem de erro,
 * etc.
 * Endpoint esperado: `GET /api/clientes/{id}`
 */
export async function buscarClientePorId(id: number): Promise<Cliente | null> {
  return MOCK_CLIENTES.find((c) => c.id === id) ?? null;
}

/** Dado de formulário pra criar/editar cliente (mesmo formato usado por `PanelCadastroCliente`). */
export interface NovoClienteInput {
  nome: string;
  segmento: string;
  porte: string;
}

/**
 * Cria um cliente novo. Sem persistência real (sem estado global entre
 * rotas, mesmo gap documentado nas outras telas) — a tela mantém o
 * resultado só no próprio state local.
 * Endpoint esperado: `POST /api/clientes`
 */
export async function criarCliente(dados: NovoClienteInput): Promise<Cliente> {
  return { id: Date.now(), criacao: new Date().toISOString(), ...dados };
}

/**
 * Atualiza um cliente existente. Devolve `void` (um `PUT` real responderia
 * 200/204 sem precisar devolver o registro inteiro) — quem chama já tem os
 * dados atualizados em mãos e faz o merge no state local.
 * Endpoint esperado: `PUT /api/clientes/{id}`
 */
export async function atualizarCliente(id: number, dados: NovoClienteInput): Promise<void> {
  void id;
  void dados;
}
