import {
  CardClientesAtencao,
  CardKPI,
  CardTendenciaSinais,
} from "@/components/design-system/Cards";
import { buscarDashboard } from "@/services/dashboard.service";
import { SaudacaoDashboard } from "./SaudacaoDashboard";

/**
 * Tela Dashboard Executivo (Figma: frame "dashboard-executivo-mentoai",
 * 74:590) — feature BL009, issue #90. É a rota inicial da Sidebar.
 *
 * Server Component puro: a tela não tem interatividade própria (sem filtro,
 * paginação ou formulário), então não força um Client Component vazio — só a
 * saudação do canto superior direito é client, porque depende da sessão e do
 * relógio do usuário (ver `SaudacaoDashboard.tsx`).
 *
 * Os 4 KPIs, os textos e a divisão em duas colunas seguem o frame. Os
 * *números* saem do dado mockado real e por isso não batem com os do Figma
 * (128 clientes / 47 reuniões / 8 riscos / 23 oportunidades): decisão de time
 * já registrada — dado real derivado prevalece, a diferença é documentada em
 * vez de o mock ser ajustado pra bater com o desenho. Ver
 * `dashboard.service.ts` pra como cada número é calculado.
 */
export default async function DashboardPage() {
  const { kpis, clientesAtencao, tendencia, resumo } = await buscarDashboard();

  return (
    <>
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">Dashboard Executivo</p>
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Visão consolidada do cenário comercial
          </p>
        </div>
        <SaudacaoDashboard />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardKPI
          titulo="Total de Clientes"
          valor={kpis.totalClientes}
          tendencia={{ direcao: "up", texto: `+${kpis.novosClientesNoMes} este mês` }}
        />
        <CardKPI
          titulo="Reuniões Analisadas"
          valor={kpis.reunioesAnalisadasNoMes}
          legenda="no mês atual"
        />
        <CardKPI
          titulo="Sinais de Risco"
          valor={kpis.clientesEmRisco}
          indicador="risco"
          legenda="clientes com risco de churn"
        />
        <CardKPI
          titulo="Oportunidades"
          valor={kpis.oportunidades}
          indicador="oportunidade"
          legenda="identificadas pela IA"
        />
      </div>

      {/* Duas colunas no frame: a tabela de clientes é ~1,4x mais larga que o
          gráfico (7/5 num grid de 12). Abaixo de xl os dois cards empilham. */}
      <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-12">
        <CardClientesAtencao clientes={clientesAtencao} className="xl:col-span-7" />
        <CardTendenciaSinais
          pontos={tendencia}
          resumo={resumo}
          periodoLabel="Últimos 6 meses"
          className="xl:col-span-5"
        />
      </div>
    </>
  );
}
