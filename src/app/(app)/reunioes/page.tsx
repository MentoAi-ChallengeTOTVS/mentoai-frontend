import { listarReunioesComStatus, contarEmProcessamento } from "@/services/reunioes.service";
import { ReunioesPageClient } from "./ReunioesPageClient";

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
 * Server Component (busca via `reunioesService`) + Client Component
 * (`ReunioesPageClient`, filtros/paginação) — mesmo padrão adotado em
 * todas as telas em 24/08/2026 pra preparar o frontend pro backend.
 */
export default async function ReunioesPage() {
  const [itens, emProcessamento] = await Promise.all([
    listarReunioesComStatus(),
    contarEmProcessamento(),
  ]);
  return <ReunioesPageClient itensIniciais={itens} emProcessamento={emProcessamento} />;
}
