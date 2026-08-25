import { listarUsuarios } from "@/services/usuarios.service";
import { UsuariosPageClient } from "./UsuariosPageClient";

/**
 * Tela Usuários (Figma: frame "admin-usuarios-mentoai", 69:532) — feature
 * F01, issue #61. Diferente da tela de Clientes, o Figma aqui não tem
 * barra de busca no header — só o botão "Novo usuário" — então não
 * reproduzi uma. `table-header`/`table-footer` ficaram inline (não viraram
 * componentes exportados como em `TableClientes.tsx`) porque, ao contrário
 * de `Table/Row-Cliente`, o Figma não promoveu esses frames a componentes
 * nomeados — só `Row/Usuario` é.
 *
 * "Cadastro/edição" e "gerenciamento de status" (do texto da issue #61) são
 * cobertos pelo mesmo `PanelEditarUsuario`, agora com `usuario` opcional
 * (ausente = criação) — mesmo padrão da issue #64 com `PanelCadastroCliente`.
 *
 * A tela é restrita ao perfil Diretor Comercial (confirmado em
 * `claude/roteiro_validacao_telas.md`) — a Sidebar já só mostra o item
 * "Usuários" pra esse perfil, mas a rota em si também guarda esse acesso,
 * caso alguém digite a URL direto (guard fica no Client Component, porque
 * `useAuth()` — sessão mockada em `localStorage` — só existe lá; quando a
 * sessão vier de cookie/JWT real, esse guard pode migrar pra cá).
 *
 * Server Component (busca a lista inicial via `usuariosService`) + Client
 * Component (`UsuariosPageClient`, paginação/drawer/guard) — mesmo padrão
 * adotado em todas as telas com listagem em 24/08/2026 pra preparar o
 * frontend pro backend.
 */
export default async function UsuariosPage() {
  const usuarios = await listarUsuarios();
  return <UsuariosPageClient usuariosIniciais={usuarios} />;
}
