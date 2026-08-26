"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelBuscaGlobal } from "./Panels";
import { listarClientes } from "@/services/clientes.service";
import { listarReunioesComStatus } from "@/services/reunioes.service";
import type { Cliente, Reuniao } from "@/types/domain";

/**
 * Busca Global (Figma: frame "busca-global-aberta-mentoai", 108:972; painel
 * `Panel/Busca-Global` 127:1340) — feature BL011, issue #92.
 *
 * Não é uma rota: é um overlay montado no `layout.tsx` das telas
 * autenticadas e aberto pelo item "Buscar" da Sidebar (que até aqui tinha a
 * prop `onOpenSearch` sem ninguém passando — clicar não fazia nada).
 *
 * Por não ter rota própria, também não tem Server Component pra buscar o
 * dado: o fetch acontece aqui num `useEffect` quando o painel monta. É a
 * única exceção ao padrão Server+Client das outras telas, e é deliberada —
 * o overlay pode abrir de qualquer rota.
 *
 * A filtragem é client-side sobre a lista completa, como nas outras telas.
 * Num backend real isso vira um `GET /api/busca?q=` — quando isso acontecer,
 * o que muda é só a origem da lista, não o componente.
 */

/** Quantas linhas o painel mostra por seção antes do "Ver todos". */
const MAX_RESULTADOS = 4;

export function BuscaGlobalOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);

  useEffect(() => {
    let ativo = true;
    listarClientes().then((lista) => ativo && setClientes(lista));
    listarReunioesComStatus().then(
      (itens) => ativo && setReunioes(itens.map((i) => i.reuniao))
    );
    return () => {
      ativo = false;
    };
  }, []);

  // Foco no campo assim que abre — é um painel de busca, digitar é a primeira
  // coisa que se quer fazer.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Esc fecha, como qualquer overlay.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const { clientesFiltrados, reunioesFiltradas } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Sem busca digitada, o painel mostra os itens mais recentes — evita
      // abrir num estado vazio sem nada pra ver.
      return {
        clientesFiltrados: [...clientes].sort(
          (a, b) => new Date(b.criacao).getTime() - new Date(a.criacao).getTime()
        ),
        reunioesFiltradas: [...reunioes].sort(
          (a, b) => new Date(b.dataReuniao).getTime() - new Date(a.dataReuniao).getTime()
        ),
      };
    }
    return {
      clientesFiltrados: clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.segmento.toLowerCase().includes(q)
      ),
      reunioesFiltradas: reunioes.filter((r) => r.cliente.nome.toLowerCase().includes(q)),
    };
  }, [clientes, reunioes, query]);

  function irPara(href: string) {
    onClose();
    router.push(href);
  }

  return (
    // O painel fica centrado na viewport e perto do topo, como no frame — não
    // centrado no conteúdo à direita da Sidebar.
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pb-6 pt-16 sm:pt-24"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-full w-full max-w-[480px] flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
      >
        <PanelBuscaGlobal
          className="min-h-0"
          query={query}
          onQueryChange={setQuery}
          onClear={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          inputRef={inputRef}
          clientes={clientesFiltrados.slice(0, MAX_RESULTADOS)}
          reunioes={reunioesFiltradas.slice(0, MAX_RESULTADOS)}
          totalClientes={clientesFiltrados.length}
          totalReunioes={reunioesFiltradas.length}
          onSelecionarCliente={(cliente) => irPara(`/clientes/${cliente.id}`)}
          onSelecionarReuniao={(reuniao) => irPara(`/reunioes/${reuniao.id}`)}
          onVerTodosClientes={() => irPara("/clientes")}
          onVerTodasReunioes={() => irPara("/reunioes")}
        />
      </div>
    </div>
  );
}
