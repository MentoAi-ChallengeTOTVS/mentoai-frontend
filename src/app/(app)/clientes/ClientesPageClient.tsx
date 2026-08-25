"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import {
  RowCliente,
  TabelaClientesCabecalho,
  TabelaClientesRodape,
} from "@/components/design-system/TableClientes";
import { PanelCadastroCliente, type ClienteFormInput } from "@/components/design-system/Panels";
import { criarCliente, atualizarCliente } from "@/services/clientes.service";
import type { Cliente } from "@/types/domain";

/**
 * Client Component da tela Clientes — busca/paginação/drawer de
 * cadastro-edição, mesmo comportamento de antes. Recebe a lista inicial já
 * carregada pelo Server Component (`page.tsx`), que chama
 * `clientesService.listarClientes()`; daqui pra frente o state é local
 * (mesmo gap de "sem estado global entre rotas" já documentado nas outras
 * telas — criar/editar aqui não volta pro backend de verdade ainda, só
 * passa pelo `clientesService` pra manter a chamada no formato que uma API
 * real teria).
 */
const TAMANHO_PAGINA = 6; // bate com o "Exibindo 6 de 128 clientes" do Figma

export function ClientesPageClient({ clientesIniciais }: { clientesIniciais: Cliente[] }) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [painelAberto, setPainelAberto] = useState<null | "novo" | Cliente>(null);
  const [salvando, setSalvando] = useState(false);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.segmento.toLowerCase().includes(q)
    );
  }, [clientes, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
  const clientesDaPagina = filtrados.slice(inicio, inicio + TAMANHO_PAGINA);

  const clienteEmEdicao = painelAberto && typeof painelAberto === "object" ? painelAberto : undefined;

  function handleBuscaChange(value: string) {
    setBusca(value);
    setPagina(1);
  }

  async function handleSalvar({ id, ...dados }: ClienteFormInput) {
    setSalvando(true);
    try {
      if (id !== undefined) {
        await atualizarCliente(id, dados);
        setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...dados } : c)));
      } else {
        const novoCliente = await criarCliente(dados);
        setClientes((prev) => [novoCliente, ...prev]);
      }
      setPainelAberto(null);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">Clientes</p>
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Gerencie sua carteira de clientes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-80 items-center gap-2 rounded-md border border-neutro-border bg-white px-3">
            <Search className="size-4 shrink-0 text-sidebar-muted-2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
              placeholder="Buscar por nome ou segmento..."
              className="flex-1 text-corpo text-navy placeholder:text-sidebar-muted-2 focus:outline-none"
            />
          </div>
          <ButtonPrimary icon={<Plus className="size-4" />} onClick={() => setPainelAberto("novo")}>
            Novo cliente
          </ButtonPrimary>
        </div>
      </div>

      <div
        className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white"
        data-node-id="105:1228"
        data-name="table-card"
      >
        <TabelaClientesCabecalho />
        {clientesDaPagina.length === 0 ? (
          <p className="w-full px-6 py-10 text-center text-corpo text-neutro-muted">
            Nenhum cliente encontrado para &quot;{busca}&quot;.
          </p>
        ) : (
          clientesDaPagina.map((cliente, i) => (
            <RowCliente
              key={cliente.id}
              cliente={cliente}
              striped={i % 2 === 1}
              onEditar={() => setPainelAberto(cliente)}
            />
          ))
        )}
        <TabelaClientesRodape
          exibindo={clientesDaPagina.length}
          total={filtrados.length}
          onAnterior={() => setPagina((p) => Math.max(1, p - 1))}
          onProximo={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          podeAnterior={paginaAtual > 1}
          podeProximo={paginaAtual < totalPaginas}
        />
      </div>

      {painelAberto && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30"
          onClick={() => !salvando && setPainelAberto(null)}
        >
          <div className="h-full w-[380px]" onClick={(e) => e.stopPropagation()}>
            <PanelCadastroCliente
              cliente={clienteEmEdicao}
              onClose={() => setPainelAberto(null)}
              onCancel={() => setPainelAberto(null)}
              onSubmit={handleSalvar}
            />
          </div>
        </div>
      )}
    </>
  );
}
