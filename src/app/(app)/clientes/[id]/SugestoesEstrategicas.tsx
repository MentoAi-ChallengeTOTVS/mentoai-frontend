"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BadgeGeradoPorIA } from "@/components/design-system/Badges";
import { CardSugestaoEstrategica } from "@/components/design-system/Cards";
import type { SugestaoEstrategica } from "@/mocks/perfilCliente";

/**
 * Seção "Sugestões Estratégicas (N)" da tela Perfil do Cliente
 * (`strategic-suggestions-section`, node 126:1240) — único trecho da tela
 * com interatividade própria (accordion expandir/recolher), por isso extraído
 * num Client Component à parte em vez de forçar "use client" na página
 * inteira. O Figma mostra o estado aberto por padrão.
 */
export function SugestoesEstrategicas({ itens }: { itens: SugestaoEstrategica[] }) {
  const [aberto, setAberto] = useState(true);

  return (
    <div className="flex w-full flex-col items-start gap-4" data-node-id="126:1240">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <p className="text-subtitulo font-medium text-neutro-dark">
            Sugestões Estratégicas ({itens.length})
          </p>
          <BadgeGeradoPorIA />
        </div>
        {aberto ? (
          <ChevronUp className="size-4 text-neutro-muted" />
        ) : (
          <ChevronDown className="size-4 text-neutro-muted" />
        )}
      </button>

      {aberto && (
        <div className="flex w-full items-start gap-5">
          {itens.map((item, i) => (
            <CardSugestaoEstrategica
              key={i}
              titulo={item.titulo}
              justificativa={item.justificativa}
              className="flex-1"
            />
          ))}
        </div>
      )}
    </div>
  );
}
