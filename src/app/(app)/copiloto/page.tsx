import { buscarConversa, listarConversas } from "@/services/chat.service";
import { CopilotoPageClient } from "./CopilotoPageClient";

/**
 * Tela Copiloto (Figma: frame "copiloto-chat", 110:1211) — feature BL012,
 * issue #98.
 *
 * `Item/Conversa`, `Bubble/Pergunta` e `Bubble/Resposta-IA` já existiam no
 * design system (vitrine em `/design-system`) — reaproveitados como estão.
 *
 * Com esta rota existindo, o botão "Iniciar conversa no Copiloto" do Perfil
 * do Cliente (tela do Breno) para de dar 404 — ele já apontava pra `/copiloto`.
 *
 * Server Component busca a lista de conversas **e** a primeira conversa
 * aberta, pra tela não montar vazia e preencher depois. Trocar de conversa
 * dali em diante é client-side (ver `CopilotoPageClient`).
 *
 * Gap de domínio (item 3 do roteiro de validação): `Chat` não tem FK pra
 * `Cliente`/`Reuniao`, então o contexto da conversa vive só no título — o
 * rodapé "Contexto ativo" do frame reflete isso e fica genérico até o time
 * decidir se o vínculo vira campo no domínio.
 */
export default async function CopilotoPage() {
  const conversas = await listarConversas();
  const primeira = conversas[0] ? await buscarConversa(conversas[0].id) : null;

  return (
    <CopilotoPageClient
      conversasIniciais={conversas}
      conversaAbertaInicial={primeira}
    />
  );
}
