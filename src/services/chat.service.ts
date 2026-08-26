import type { Chat, PerguntaChat } from "@/types/domain";
import { MOCK_CHATS, MOCK_PERGUNTAS } from "@/mocks/chat";

/**
 * Camada de serviço — bounded context Copiloto (`Chat`, `PerguntaChat`).
 * Mesmo racional dos demais services: hoje envolve `src/mocks/chat.ts`,
 * pronta pra virar `fetch` real.
 */

/**
 * Lista as conversas do usuário logado (histórico da coluna esquerda), mais
 * recentes primeiro. Sem parâmetro de usuário pelo mesmo motivo de
 * `listarAlertas`: o endpoint real deduz do token.
 * Endpoint esperado: `GET /api/chats`
 */
export async function listarConversas(): Promise<Chat[]> {
  return [...MOCK_CHATS].sort(
    (a, b) => new Date(b.criacao).getTime() - new Date(a.criacao).getTime()
  );
}

export interface DetalheChat {
  chat: Chat;
  perguntas: PerguntaChat[];
}

/**
 * Busca uma conversa com todas as suas perguntas/respostas. Devolve `null`
 * se não existir (mesmo contrato de `buscarDetalheReuniao`: quem chama
 * decide se isso vira `notFound()` ou mensagem na tela).
 * Endpoint esperado: `GET /api/chats/{id}`
 */
export async function buscarConversa(chatId: number): Promise<DetalheChat | null> {
  const chat = MOCK_CHATS.find((c) => c.id === chatId);
  if (!chat) return null;
  return { chat, perguntas: MOCK_PERGUNTAS[chatId] ?? [] };
}

/**
 * Cria uma conversa nova (botão "Nova conversa"). Sem persistência real —
 * a tela guarda a conversa criada só no state local, mesmo gap das outras
 * telas.
 * Endpoint esperado: `POST /api/chats`
 */
export async function criarConversa(titulo: string): Promise<Chat> {
  return {
    id: Date.now(),
    titulo,
    usuario: MOCK_CHATS[0].usuario,
    criacao: new Date().toISOString(),
  };
}

/**
 * Envia uma pergunta pro Copiloto e devolve o par pergunta/resposta.
 *
 * No mundo real esse é o ponto lento do produto inteiro (o backend chama a
 * IA e espera) — por isso o atraso artificial aqui, mesmo espírito da
 * simulação de progresso da fila em `reunioes.service.ts`: a tela precisa
 * saber renderizar o estado "pensando". A resposta é fixa; quando a API
 * existir, a tela não muda, só o corpo desta função.
 *
 * Endpoint esperado: `POST /api/chats/{id}/perguntas`
 */
export async function enviarPergunta(chatId: number, texto: string): Promise<PerguntaChat> {
  const chat = MOCK_CHATS.find((c) => c.id === chatId) ?? MOCK_CHATS[0];
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    id: Date.now(),
    pergunta: texto,
    resposta:
      "Esta é uma resposta simulada do Copiloto — a análise real depende do backend de IA, que ainda não está conectado.\n\nQuando a API existir, ela entra no lugar deste mock sem precisar mudar nada na tela: o contrato (pergunta enviada, resposta em texto) já é o mesmo.",
    chat,
    criacao: new Date().toISOString(),
  };
}
