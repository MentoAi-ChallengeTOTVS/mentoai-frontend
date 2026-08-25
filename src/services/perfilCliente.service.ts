import type { Cliente, Reuniao, SinalComercial, StatusProcessamento } from "@/types/domain";
import { MOCK_ANALISES } from "@/mocks/reunioes";
import {
  reunioesDoCliente,
  resumoTimelineDaReuniao,
  sinaisRiscoDoCliente,
  oportunidadesDoCliente,
  resumoEstrategicoDoCliente,
  sugestoesJaGeradasDoCliente,
  gerarSugestoesEstrategicasDoCliente,
  type SugestaoEstrategica,
} from "@/mocks/perfilCliente";
import { buscarClientePorId } from "./clientes.service";

export type { SugestaoEstrategica } from "@/mocks/perfilCliente";

/**
 * Camada de serviço pra tela Perfil do Cliente / Visão 360° (issues
 * #65/#86/#101). Diferente de `clientes.service.ts`/`reunioes.service.ts`,
 * não existe uma entidade de domínio própria pra "perfil de cliente" — é
 * uma agregação sobre `Cliente`/`Reuniao`/`SinalComercial` já existentes
 * (ver gap de domínio documentado em `src/mocks/perfilCliente.ts` e em
 * `claude/decisoes_tecnicas_stack.md`).
 *
 * `buscarPerfilCliente` devolve tudo que a tela precisa numa chamada só —
 * é razoável esperar um endpoint agregado assim pra uma tela de "visão
 * 360°" (evita a tela ter que orquestrar 4-5 chamadas separadas). A
 * "geração" de sugestões estratégicas (ação do usuário, não carga inicial)
 * fica numa função à parte, `gerarSugestoesEstrategicas`, pensada como uma
 * chamada `POST` independente.
 */

export interface ItemTimelineData {
  reuniao: Reuniao;
  resumo: string;
  status: StatusProcessamento;
}

export interface PerfilClienteData {
  cliente: Cliente;
  timeline: ItemTimelineData[];
  riscos: SinalComercial[];
  oportunidades: SinalComercial[];
  resumoEstrategico: string;
  sugestoesIniciais: SugestaoEstrategica[] | null;
}

/**
 * Busca todos os dados da Visão 360° de um cliente. Devolve `null` se o
 * cliente não existir.
 * Endpoint esperado: `GET /api/clientes/{id}/perfil`
 */
export async function buscarPerfilCliente(clienteId: number): Promise<PerfilClienteData | null> {
  const cliente = await buscarClientePorId(clienteId);
  if (!cliente) return null;

  const timeline: ItemTimelineData[] = reunioesDoCliente(clienteId).map((reuniao) => ({
    reuniao,
    resumo: resumoTimelineDaReuniao(reuniao.id),
    status: MOCK_ANALISES[reuniao.id]?.statusProcessamento ?? "PENDENTE",
  }));

  return {
    cliente,
    timeline,
    riscos: sinaisRiscoDoCliente(clienteId),
    oportunidades: oportunidadesDoCliente(clienteId),
    resumoEstrategico: resumoEstrategicoDoCliente(clienteId, cliente.nome),
    sugestoesIniciais: sugestoesJaGeradasDoCliente(clienteId),
  };
}

/**
 * Gera (ou atualiza) as sugestões estratégicas de um cliente — ação
 * disparada pelo botão "Gerar sugestões"/"Atualizar sugestões" (issue
 * #101). Separada de `buscarPerfilCliente` porque, no mundo real, é uma
 * chamada de IA sob demanda (potencialmente lenta/assíncrona), não parte
 * da carga inicial da página.
 * Endpoint esperado: `POST /api/clientes/{id}/sugestoes-estrategicas`
 */
export async function gerarSugestoesEstrategicas(
  clienteId: number,
  nomeCliente: string
): Promise<SugestaoEstrategica[]> {
  return gerarSugestoesEstrategicasDoCliente(clienteId, nomeCliente);
}
