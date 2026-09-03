"use client";

import { useEffect, useState } from "react";
import { CircleCheckBig } from "lucide-react";
import { ModalAvaliarServico } from "./Avaliacao";
import { ButtonPrimary } from "./Button";
import { enviarAvaliacao } from "@/services/avaliacao.service";

export function AvaliacaoOverlay({ onClose }: { onClose: () => void }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  // Esc fecha, como no overlay da Busca Global.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleEnviar() {
    setErro(null);
    setEnviando(true);
    try {
      await enviarAvaliacao({ nota, comentario });
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
          className="flex w-full max-w-[480px] flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-[0px_8px_12px_rgba(0,0,0,0.1)]"
          role="dialog"
          aria-modal="true"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-menta-suave">
            <CircleCheckBig className="size-6 text-menta" />
          </span>
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-subtitulo font-medium text-neutro-dark">Obrigado pelo feedback!</p>
            <p className="text-corpo text-neutro-muted">
              Sua avaliação ajuda a melhorar o copiloto comercial.
            </p>
          </div>
          <ButtonPrimary className="w-full justify-center py-3.5" onClick={onClose}>
            Fechar
          </ButtonPrimary>
        </div>
      </div>
    );
  }

  return (
    <ModalAvaliarServico
      aberto
      nota={nota}
      onNotaChange={setNota}
      comentario={comentario}
      onComentarioChange={setComentario}
      onEnviar={handleEnviar}
      onDispensar={onClose}
      onClose={onClose}
      enviando={enviando}
      erro={erro}
    />
  );
}
