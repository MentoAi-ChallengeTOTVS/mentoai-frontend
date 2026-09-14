"use client";

import { useCallback, useEffect, useState } from "react";
import { ModalAvaliarServico } from "./Avaliacao";
import { enviarFeedback } from "@/services/avaliacao.service";

export function AvaliacaoOverlay({ onClose }: { onClose: () => void }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const fechar = useCallback(() => {
    if (enviando) return;
    setNota(0);
    setComentario("");
    setErro(null);
    setSucesso(false);
    onClose();
  }, [enviando, onClose]);

  async function enviar() {
    setErro(null);
    setEnviando(true);
    try {
      await enviarFeedback({ nota, comentario });
      setSucesso(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") fechar(); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fechar]);

  return <ModalAvaliarServico aberto nota={nota} onNotaChange={setNota}
    comentario={comentario} onComentarioChange={setComentario}
    onEnviar={() => void enviar()} onDispensar={fechar} onClose={fechar}
    enviando={enviando} erro={erro} sucesso={sucesso} />;
}
