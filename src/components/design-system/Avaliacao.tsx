"use client";

import { useState } from "react";
import clsx from "clsx";
import { Star, XCircle } from "lucide-react";
import { ButtonPrimary } from "./Button";

export function StarRating({
  value,
  onChange,
  max = 5,
  className,
}: {
  value: number;
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
  enviando = false,
  erro = null,
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
  /**
   * Envio em andamento — desabilita o botão e troca o label. Igual ao
   * `loading` do `Card/Login-Form`: o frame do Figma só desenha o estado
   * parado, mas uma tela real precisa do estado de espera.
   */
  enviando?: boolean;
  /** Mensagem de erro do envio, exibida acima das ações. */
  erro?: string | null;
  className?: string;
}) {
  if (!aberto) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", className)}
      data-node-id="132:1489"
      data-name="Modal/Avaliar-Servico"
    >
      <div
        className="relative flex w-full max-w-[480px] flex-col items-start gap-6 rounded-xl bg-white p-8 shadow-[0px_8px_12px_rgba(0,0,0,0.1)]"
        role="dialog"
        aria-modal="true"
        aria-label="Avalie sua experiência com o MentoAI"
      >
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
          {erro && (
            <p className="w-full text-caption leading-caption text-sinal-risco-churn">{erro}</p>
          )}
          {/* Sem nota escolhida não há o que enviar — o comentário sozinho não
              é uma avaliação. Enquanto isso o botão fica desabilitado. */}
          <ButtonPrimary
            className="w-full justify-center py-3.5"
            onClick={onEnviar}
            disabled={enviando || nota < 1}
          >
            {enviando ? "Enviando..." : "Enviar avaliação"}
          </ButtonPrimary>
          <button
            type="button"
            onClick={onDispensar}
            disabled={enviando}
            className="text-corpo text-neutro-muted disabled:opacity-50"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
