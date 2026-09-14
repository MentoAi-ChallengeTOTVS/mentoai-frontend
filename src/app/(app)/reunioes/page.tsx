"use client";

import { useEffect, useState } from "react";
import { listarReunioesComStatus, contarEmProcessamento } from "@/services/reunioes.service";
import { ReunioesPageClient } from "./ReunioesPageClient";
import type { ReuniaoListItem } from "@/services/reunioes.service";

/**
 * Tela Reuniões — lista (Figma: frame "reunioes-lista-mentoai", 49:403) —
 * feature F03, issue #71 (parte 1: "Criar listagem e detalhes de reuniões").
 * Ponto de entrada pra Nova Reunião (#70, `/reunioes/nova`) e Detalhe da
 * Reunião (`/reunioes/[id]`).
 *
 * `Filter-Bar` e `Row/Reuniao` já existiam no design system (showcase em
 * `/design-system`) — reaproveitados aqui como estão. `table-header`/
 * `table-footer` ficaram inline, mesmo padrão de `usuarios/page.tsx` (Figma
 * não promoveu esses frames a componentes nomeados nesta tela).
 *
 * Filtros de Cliente/Período/Status e a busca continuam aplicados sobre os
 * dados client-side — sem dependência de backend pra isso, mesmo espírito
 * de `clientes/page.tsx`.
 *
 * Header tem o link "Fila de processamento" (24/08/2026) pra `/reunioes/
 * fila` — issue #80 (F04). Sem frame no Figma pra esse link nem pra
 * dependência da tela em si; ver nota completa em `reunioes/fila/page.tsx`.
 *
 * A carga inicial ocorre no navegador para incluir o JWT; o componente de
 * apresentação continua responsável pelos filtros e paginação.
 */
export default function ReunioesPage() {
  const [dados, setDados] = useState<{ itens: ReuniaoListItem[]; emProcessamento: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listarReunioesComStatus(), contarEmProcessamento()])
      .then(([itens, emProcessamento]) => setDados({ itens, emProcessamento }))
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar as reuniões."));
  }, []);

  if (erro) return <p role="alert" className="text-corpo text-sinal-risco-churn">{erro}</p>;
  if (!dados) return <p role="status" className="text-corpo text-neutro-muted">Carregando reuniões...</p>;
  return <ReunioesPageClient itensIniciais={dados.itens} emProcessamento={dados.emProcessamento} />;
}
