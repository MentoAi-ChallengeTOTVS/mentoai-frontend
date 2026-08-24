"use client";

import clsx from "clsx";
import { BadgeGeradoPorIA } from "./Badges";
import type { Chat } from "@/types/domain";

/**
 * Átomos do Copiloto (tela de chat): `Item/Conversa` (127:1432, item da
 * lista de histórico à esquerda), `Bubble/Pergunta` (127:1438, mensagem do
 * usuário) e `Bubble/Resposta-IA` (127:1443, resposta da IA). O alinhamento
 * (pergunta à direita, resposta à esquerda) é responsabilidade de quem
 * monta a tela — aqui só as bolhas.
 */

function formatDataHoraConversa(iso: string) {
  const d = new Date(iso);
  const data = d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data} - ${hora}`;
}

// ---------- Item/Conversa ----------

export function ItemConversa({
  chat,
  ativo = false,
  onClick,
  className,
}: {
  chat: Pick<Chat, "titulo" | "criacao">;
  ativo?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
        ativo
          ? "border-menta-clara bg-menta-suave"
          : "border-transparent hover:bg-neutro-background",
        className
      )}
      data-node-id="127:1432"
      data-name="Item/Conversa"
    >
      <p className="w-full truncate text-corpo font-semibold text-navy">{chat.titulo}</p>
      <p className="w-full text-legenda text-neutro-muted">{formatDataHoraConversa(chat.criacao)}</p>
    </button>
  );
}

// ---------- Bubble/Pergunta ----------

export function BubblePergunta({ pergunta, className }: { pergunta: string; className?: string }) {
  return (
    <div
      className={clsx(
        "flex max-w-[700px] flex-col items-start rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm bg-neutro-background p-4",
        className
      )}
      data-node-id="127:1438"
      data-name="Bubble/Pergunta"
    >
      <p className="w-full text-corpo text-neutro-dark">{pergunta}</p>
    </div>
  );
}

// ---------- Bubble/Resposta-IA ----------
// `resposta` é dividida em parágrafos por linha em branco dupla (\n\n) — o
// Figma mostra 2 parágrafos soltos, não um texto único. O destaque em negrito
// que aparece no meio do primeiro parágrafo do mock não foi reproduzido
// (exigiria a resposta vir em markdown/HTML da IA, não texto puro) — revisar
// aqui quando o formato de resposta do backend for definido.

export function BubbleRespostaIa({
  resposta,
  fonte = "MentoAI Copiloto",
  quando = "Agora",
  className,
}: {
  resposta: string;
  fonte?: string;
  quando?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx("flex w-full max-w-[876px] flex-col items-start gap-3", className)}
      data-node-id="127:1443"
      data-name="Bubble/Resposta-IA"
    >
      <div className="flex items-center gap-2">
        <BadgeGeradoPorIA className="px-2 py-0.5" />
        <span className="whitespace-nowrap text-caption leading-caption text-neutro-muted">
          {fonte} • {quando}
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-4 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl border border-neutro-border bg-white p-5 text-corpo text-neutro-dark">
        {resposta.split("\n\n").map((paragrafo, i) => (
          <p key={i} className="w-full whitespace-pre-line">
            {paragrafo}
          </p>
        ))}
      </div>
    </div>
  );
}
