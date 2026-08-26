import { listarAlertas } from "@/services/alertas.service";
import { AlertasPageClient } from "./AlertasPageClient";

/**
 * Tela Central de Alertas (Figma: frame "central-alertas-mentoai", 84:723) —
 * feature BL010, issue #88.
 *
 * `Row/Alerta` e `Badge/Prioridade` já existiam no design system (vitrine em
 * `/design-system`) — reaproveitados como estão. Os filtros aqui **não** usam
 * o `Filter-Bar` de dropdowns de Reuniões: o frame desta tela usa chips
 * (Prioridade: Todas/Alta/Média/Baixa · Status: Todos/Não lidos/Lidos), e o
 * Figma não promoveu esses chips a componente nomeado — ficaram inline no
 * Client Component, mesmo critério que `reunioes/page.tsx` usou pra
 * table-header/table-footer.
 *
 * Server Component (busca via `alertas.service`) + Client Component
 * (filtros/paginação/marcar como lido), padrão obrigatório de toda tela nova.
 */
export default async function AlertasPage() {
  const alertas = await listarAlertas();
  return <AlertasPageClient alertasIniciais={alertas} />;
}
