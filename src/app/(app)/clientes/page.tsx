import { listarClientes } from "@/services/clientes.service";
import { ClientesPageClient } from "./ClientesPageClient";

/**
 * Tela Clientes (Figma: frame "crm-clientes-mentoai", 105:1214) — feature
 * F02, issue #64 do Breno: "listagem, pesquisa, filtros, paginação,
 * cadastro/edição e gerenciamento de status".
 *
 * Duas notas de escopo, documentadas também em
 * `claude/decisoes_tecnicas_stack.md`:
 *
 * 1. "Gerenciamento de status" do texto da issue não tem campo
 *    correspondente em `Cliente` no domínio (`id`, `nome`, `segmento`,
 *    `porte`, `criacao` — sem status/ativo, diferente de `Usuario`, que tem
 *    `ativo`). Não inventei um campo novo sem validar com o time — fica
 *    como gap documentado, não implementado aqui.
 * 2. A ação "Ver detalhes" navega para a tela de detalhes dedicada
 *    (issue #65 + #86, `/clientes/[id]`) desde que ela passou a existir.
 *    Como essa ação deixou de abrir o painel de cadastro, foi adicionado um
 *    ícone de edição (mesmo padrão do `Pencil` em `Row/Usuario`) pra manter
 *    a edição acessível na própria listagem.
 *
 * Server Component (busca a lista inicial via `clientesService`) + Client
 * Component (`ClientesPageClient`, busca/paginação/drawer) — mesmo padrão
 * já usado em Perfil do Cliente e Detalhe da Reunião, adotado aqui em
 * 24/08/2026 pra preparar a tela pro backend: quando a API existir, só
 * `clientesService.listarClientes()` muda (de mock pra `fetch`), a tela não
 * precisa saber disso.
 */
export default async function ClientesPage() {
  const clientes = await listarClientes();
  return <ClientesPageClient clientesIniciais={clientes} />;
}
