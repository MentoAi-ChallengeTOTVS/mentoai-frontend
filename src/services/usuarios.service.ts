import type { PerfilUsuario, Usuario } from "@/types/domain";
import { MOCK_USUARIOS } from "@/mocks/usuarios";

/**
 * Camada de serviço — bounded context Usuário e Acesso (entidade `Usuario`).
 * Mesmo racional de `clientes.service.ts`: hoje devolve mock, formato já
 * pronto pra virar `fetch` real.
 */

/**
 * Lista todos os usuários.
 * Endpoint esperado: `GET /api/usuarios` (restrito a `DIRETOR_COMERCIAL` —
 * a tela `usuarios/page.tsx` já bloqueia acesso por perfil no frontend, mas
 * o backend deve aplicar a mesma regra na API).
 */
export async function listarUsuarios(): Promise<Usuario[]> {
  return MOCK_USUARIOS;
}

/** Dado de formulário pra criar/editar usuário (mesmo formato de `PanelEditarUsuario`). */
export interface NovoUsuarioInput {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  /** Vazio/ausente na edição = manter a senha atual. Obrigatória na criação. */
  senha?: string;
  ativo: boolean;
}

/**
 * Cria um usuário novo. Sem persistência real (mesmo gap documentado nas
 * outras telas).
 * Endpoint esperado: `POST /api/usuarios`
 */
export async function criarUsuario(dados: NovoUsuarioInput): Promise<Usuario> {
  const { senha: _senha, ...resto } = dados;
  void _senha;
  const agora = new Date().toISOString();
  return { id: Date.now(), criacao: agora, atualizacao: agora, ...resto };
}

/**
 * Atualiza um usuário existente. Devolve `void` — quem chama já tem os
 * dados atualizados em mãos (mesmo racional de `clientes.service.
 * atualizarCliente`).
 * Endpoint esperado: `PUT /api/usuarios/{id}`
 */
export async function atualizarUsuario(id: number, dados: NovoUsuarioInput): Promise<void> {
  void id;
  void dados;
}
