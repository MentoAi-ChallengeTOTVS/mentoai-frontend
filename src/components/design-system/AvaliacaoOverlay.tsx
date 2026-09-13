"use client";

import { useEffect, useState } from "react";
import { ModalAvaliarServico } from "./Avaliacao";
import { AVALIACAO_INDISPONIVEL } from "@/services/avaliacao.service";

export function AvaliacaoOverlay({ onClose }: { onClose: () => void }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <ModalAvaliarServico aberto nota={nota} onNotaChange={setNota}
    comentario={comentario} onComentarioChange={setComentario}
    onDispensar={onClose} onClose={onClose} indisponivel={AVALIACAO_INDISPONIVEL} />;
}
