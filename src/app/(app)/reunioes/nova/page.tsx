import { listarClientes } from "@/services/clientes.service";
import { NovaReuniaoForm } from "./NovaReuniaoForm";

/**
 * Tela Nova Reunião (Figma: frame "upload-transcricao-mentoai", 21:88) —
 * feature F03, issue #70 ("Criar tela de upload de transcrições"). BL001
 * (upload + validação de formato + vínculo com cliente) e o estado de
 * "Processando" ligado ao `StatusProcessamento` da `AnaliseIA` (BL003).
 *
 * `Card/Upload-Transcricao` e `Panel/Status-Envio` já existiam no design
 * system — reaproveitados aqui como estão.
 *
 * Gap de persistência (mesmo espírito das notas em `clientes/page.tsx` e
 * `usuarios/page.tsx`): sem backend, o envio é só simulado — o painel de
 * status anima Pendente -> Processando -> Processada em memória, mas a
 * reunião criada não é adicionada à lista mockada de `/reunioes` (não há
 * estado global compartilhado entre rotas). Por isso o fluxo termina nesta
 * própria página, com um link pra "Ver todas as reuniões" em vez de
 * redirecionar automaticamente pra um registro que não existiria lá.
 *
 * Server Component (busca os clientes do select via `clientesService`) +
 * Client Component (`NovaReuniaoForm`, formulário/envio/animação) — mesmo
 * padrão adotado em todas as telas em 24/08/2026 pra preparar o frontend
 * pro backend.
 */
export default async function NovaReuniaoPage() {
  const clientes = await listarClientes();
  return <NovaReuniaoForm clientes={clientes} />;
}
