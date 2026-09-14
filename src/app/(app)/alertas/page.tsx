"use client";

import { useEffect, useState } from "react";
import { listarAlertas } from "@/services/alertas.service";
import { AlertasPageClient } from "./AlertasPageClient";
import type { AlertaListItem } from "@/services/alertas.service";

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
 * A busca ocorre no navegador para incluir o JWT; filtros, paginação e
 * marcação de leitura permanecem no componente de apresentação.
 */
export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaListItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarAlertas().then(setAlertas).catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os alertas."));
  }, []);

  if (erro) return <p role="alert" className="text-corpo text-sinal-risco-churn">{erro}</p>;
  if (!alertas) return <p role="status" className="text-corpo text-neutro-muted">Carregando alertas...</p>;
  return <AlertasPageClient alertasIniciais={alertas} />;
}
