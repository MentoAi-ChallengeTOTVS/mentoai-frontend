import type { AnaliseIAResponse, ClienteResponse, ReuniaoResponse } from "@/types/api";
import { chamarApi, chamarApiOuNull } from "./api";

/** View model local, composto de endpoints reais; não é um DTO agregado HTTP. */
export interface ItemTimelineData {
  reuniao: ReuniaoResponse;
  analise: AnaliseIAResponse | null;
  falhaConsulta: boolean;
}

export interface PerfilClienteData {
  cliente: ClienteResponse;
  timeline: ItemTimelineData[];
  analisesIncompletas: boolean;
}

export async function buscarPerfilCliente(clienteId: number): Promise<PerfilClienteData | null> {
  const cliente = await chamarApiOuNull<ClienteResponse>(`/api/v1/clientes/${clienteId}`, { cache: "no-store" });
  if (!cliente) return null;
  const reunioes = await chamarApi<ReuniaoResponse[]>(`/api/v1/clientes/${clienteId}/reunioes`, { cache: "no-store" });
  reunioes.sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao) || b.id - a.id);
  const resultados = await Promise.allSettled(reunioes.map((r) =>
    chamarApiOuNull<AnaliseIAResponse>(`/api/v1/analises/reuniao/${r.id}`, { cache: "no-store" })
  ));
  const timeline = reunioes.map((reuniao, i): ItemTimelineData => {
    const resultado = resultados[i];
    return {
      reuniao,
      analise: resultado.status === "fulfilled" ? resultado.value : null,
      falhaConsulta: resultado.status === "rejected",
    };
  });
  return {
    cliente,
    timeline,
    analisesIncompletas: timeline.some((item) => item.falhaConsulta),
  };
}

export function resumoDoItem({ analise, falhaConsulta }: ItemTimelineData): string {
  if (falhaConsulta) return "Não foi possível carregar a análise desta reunião.";
  if (!analise) return "Análise ainda não disponível.";
  switch (analise.statusProcessamento) {
    case "PENDENTE": return "Análise aguardando processamento.";
    case "PROCESSANDO": return "Análise em processamento.";
    case "ERRO": return analise.mensagemErro || "Ocorreu um erro no processamento da análise.";
    case "PROCESSADA": return analise.resumoExecutivo?.trim() || "Análise processada sem resumo disponível.";
  }
}
