"use client";

import { useState } from "react";
import clsx from "clsx";
import { Star, XCircle } from "lucide-react";
import { ButtonPrimary } from "./Button";

/**
 * Star-Rating (132:1477) e Modal/Avaliar-Servico (132:1489) — item extra
 * "Avaliar o MentoAI" da Sidebar, fora do backlog oficial (ver comentário em
 * `Sidebar.tsx`).
 *
 * Nota de cor: o título do modal usa no Figma mais um hex solto (`#1c3c2a`),
 * sem variável vinculada (confirmado via `get_variable_defs`) — é o
 * terceiro caso desse tipo encontrado (depois de `#1c3c3a`/`#444441` nos
 * Cards). Mesma decisão: unificado em `Neutro/Dark`. Ver item 6 do
 * `claude/adendo_identidade_visual.md`.
 */

// ---------- Star-Rating ----------

export function StarRating({
  value,
  onChange,
  max = 5,
  className,
}: {
  value: number;
  /** Omitido = somente leitura (ex.: mostrar uma nota já dada). */
  onChange?: (v: number) => void;
  max?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const somenteLeitura = !onChange;
  const exibido = hover ?? value;

  return (
    <div className={clsx("flex items-center gap-3", className)} data-node-id="132:1477" data-name="Star-Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={somenteLeitura}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !somenteLeitura && setHover(n)}
          onMouseLeave={() => !somenteLeitura && setHover(null)}
          aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
          className={clsx("flex size-[30px] items-center justify-center", !somenteLeitura && "cursor-pointer")}
        >
          <Star
            className={clsx(
              "size-full",
              n <= exibido ? "fill-menta text-menta" : "fill-transparent text-neutro-border"
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

// ---------- Modal/Avaliar-Servico ----------

export function ModalAvaliarServico({
  aberto,
  nota,
  onNotaChange,
  comentario,
  onComentarioChange,
  onEnviar,
  onDispensar,
  onClose,
  className,
}: {
  aberto: boolean;
  nota: number;
  onNotaChange: (v: number) => void;
  comentario: string;
  onComentarioChange: (v: string) => void;
  onEnviar?: () => void;
  onDispensar?: () => void;
  onClose?: () => void;
  className?: string;
}) {
  if (!aberto) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", className)}
      data-node-id="132:1489"
      data-name="Modal/Avaliar-Servico"
    >
      <div className="relative flex w-full max-w-[480px] flex-col items-start gap-6 rounded-xl bg-white p-8 shadow-[0px_8px_12px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full"
        >
          <XCircle className="size-4 text-neutro-muted" />
        </button>

        <div className="flex w-full flex-col items-start gap-2">
          <p className="w-full text-subtitulo font-medium text-neutro-dark">
            Avalie sua experiência com o MentoAI
          </p>
          <p className="w-full text-corpo text-neutro-muted">
            Seu feedback ajuda a melhorar o copiloto comercial.
          </p>
        </div>

        <StarRating value={nota} onChange={onNotaChange} className="w-full" />

        <textarea
          value={comentario}
          onChange={(e) => onComentarioChange(e.target.value)}
          placeholder="Conte um pouco mais (opcional)"
          className="h-[100px] w-full resize-none rounded-lg border border-neutro-border p-3 text-corpo text-neutro-dark placeholder:text-neutro-muted focus:outline-none focus:ring-2 focus:ring-menta-clara"
        />

        <div className="flex w-full flex-col items-center gap-4">
          <ButtonPrimary className="w-full justify-center py-3.5" onClick={onEnviar}>
            Enviar avaliação
          </ButtonPrimary>
          <button type="button" onClick={onDispensar} className="text-corpo text-neutro-muted">
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
