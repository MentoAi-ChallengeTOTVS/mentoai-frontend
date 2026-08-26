import type { Chat, PerguntaChat } from "@/types/domain";
import { MOCK_USUARIOS } from "@/mocks/usuarios";

/**
 * Dados fictícios do Copiloto — issue #98 (BL012).
 *
 * Gap de domínio conhecido (item 3 do roteiro de validação): `Chat` não tem
 * FK direta pra `Cliente` nem `Reuniao`, mesmo o produto sendo descrito como
 * "chat consultivo contextualizado por reunião". Enquanto o time não fecha
 * essa decisão, o contexto fica só no título da conversa — por isso os
 * títulos abaixo citam clientes que existem em `src/mocks/clientes.ts`
 * (Construtora Horizonte, FarmaTech, AgroVita), e não os nomes de exemplo do
 * Figma: mesma decisão de "dado real derivado prevalece sobre o número
 * bonito do Figma" já registrada nas outras telas.
 */

const USUARIO = MOCK_USUARIOS[1]; // Carlos Mendes — Executivo Comercial

export const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    titulo: "Construtora Horizonte — risco de churn",
    usuario: USUARIO,
    criacao: "2026-08-13T14:00:00Z",
  },
  {
    id: 2,
    titulo: "Oportunidades — FarmaTech Distribuidora",
    usuario: USUARIO,
    criacao: "2026-08-09T09:30:00Z",
  },
  {
    id: 3,
    titulo: "Preparação de reunião — AgroVita Cooperativa",
    usuario: USUARIO,
    criacao: "2026-08-04T11:00:00Z",
  },
];

/**
 * Perguntas por `chatId`. A primeira conversa tem o roteiro completo (é a
 * que abre por padrão na tela); as outras começam vazias, cobrindo o estado
 * "conversa sem mensagens" que a tela também precisa saber renderizar.
 *
 * As respostas usam `\n\n` pra separar parágrafos — é o formato que
 * `BubbleRespostaIa` espera (ver `Chat.tsx`). Texto puro por enquanto: o
 * negrito no meio do exemplo do Figma exigiria resposta em markdown/HTML,
 * decisão que depende do formato que o backend vai devolver.
 */
export const MOCK_PERGUNTAS: Record<number, PerguntaChat[]> = {
  1: [
    {
      id: 1,
      pergunta:
        "Quais foram os principais sinais de risco identificados nas últimas reuniões desse cliente?",
      resposta:
        "Nas últimas reuniões com a Construtora Horizonte identifiquei um risco de churn de severidade alta: a SoftPlan apresentou proposta concorrente e o cliente sinalizou que precisa de uma resposta nossa até o fim do mês.\n\nRecomendo antecipar a conversa de renovação e levar já o escopo do módulo de gestão de obras — o orçamento para o Q4 de 2026 já foi aprovado pela diretoria dele, então o risco aqui é de prazo, não de verba.",
      chat: MOCK_CHATS[0],
      criacao: "2026-08-13T14:01:00Z",
    },
    {
      id: 2,
      pergunta: "O que eu levo pra próxima reunião com eles?",
      resposta:
        "Três pontos, nessa ordem: cronograma de implantação até outubro, plano de treinamento para a equipe de campo (foi a objeção declarada) e uma comparação direta com a proposta da concorrente.\n\nVale também abrir espaço para o cross-sell de BI — o cliente mencionou interesse por conta própria, o que costuma ser o melhor tipo de gancho.",
      chat: MOCK_CHATS[0],
      criacao: "2026-08-13T14:06:00Z",
    },
  ],
  2: [],
  3: [],
};
