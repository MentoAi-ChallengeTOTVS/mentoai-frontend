"use client";

import { useEffect, useState } from "react";
import { listarClientes } from "@/services/clientes.service";
import { ClientesPageClient } from "./ClientesPageClient";
import type { Cliente } from "@/types/domain";

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
 * A carga inicial ocorre no navegador para que o cliente HTTP possa ler o
 * token JWT da sessão antes de chamar `clientesService.listarClientes()`.
 */
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarClientes().then(setClientes).catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os clientes."));
  }, []);

  if (erro) return <p role="alert" className="text-corpo text-sinal-risco-churn">{erro}</p>;
  if (!clientes) return <p role="status" className="text-corpo text-neutro-muted">Carregando clientes...</p>;
  return <ClientesPageClient clientesIniciais={clientes} />;
}
