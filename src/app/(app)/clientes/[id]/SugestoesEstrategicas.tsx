"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { BadgeGeradoPorIA } from "@/components/design-system/Badges";
import { CardSugestaoEstrategica } from "@/components/design-system/Cards";
import {
  gerarSugestoesEstrategicasDoCliente,
  type SugestaoEstrategica,
} from "@/mocks/perfilCliente";

/**
 * Seção "Sugestões Estratégicas" da tela Perfil do Cliente
 * (`strategic-suggestions-section`, node 126:1240) — issue #101 (F11).
 *
 * Confirmado o escopo direto na issue no GitHub (24/08/2026): "Exibir
 * sugestões junto ao cliente, sem criar uma página independente" (já era o
 * caso — essa seção sempre viveu dentro do Perfil do Cliente) + "ação para
 * gerar/atualizar" + "estados de vazio/carregamento", que a 1ª versão desta
 * seção não tinha (só mostrava conteúdo estático). Esta versão adiciona os
 * três: botão "Gerar sugestões"/"Atualizar sugestões", skeleton de
 * carregamento (`carregando`) e estado vazio explícito antes da 1ª geração
 * (`itens === null`, distinto de já ter gerado e não ter achado nada — o
 * fallback de `gerarSugestoesEstrategicasDoCliente` sempre devolve pelo
 * menos 1 item, então "vazio" aqui é só o estado pré-geração).
 *
 * `handleGerar` simula uma chamada assíncrona real (sem backend de IA
 * ainda) com um `setTimeout` — mesmo padrão de "Nova Reunião"
 * (`reunioes/nova/page.tsx`), incluindo o cleanup do timer no unmount.
 *
 * Único trecho da tela com estado próprio, por isso extraído num Client
 * Component à parte em vez de forçar "use client" na página inteira.
 */
export function SugestoesEstrategicas({
  clienteId,
  nomeCliente,
  itensIniciais,
}: {
  clienteId: number;
  nomeCliente: string;
  itensIniciais: SugestaoEstrategica[] | null;
}) {
  const [itens, setItens] = useState<SugestaoEstrategica[] | null>(itensIniciais);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  function handleGerar() {
    setCarregando(true);
    setAberto(true);
    timerRef.current = setTimeout(() => {
      setItens(gerarSugestoesEstrategicasDoCliente(clienteId, nomeCliente));
      setCarregando(false);
    }, 1300);
  }

  const temItens = itens !== null;

  return (
    <div className="flex w-full flex-col items-start gap-4" data-node-id="126:1240">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-subtitulo font-medium text-neutro-dark">
            Sugestões Estratégicas{temItens ? ` (${itens.length})` : ""}
          </p>
          <BadgeGeradoPorIA />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGerar}
            disabled={carregando}
            className="flex items-center gap-1.5 text-corpo font-medium text-menta disabled:opacity-60"
          >
            {carregando ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {carregando ? "Gerando..." : temItens ? "Atualizar sugestões" : "Gerar sugestões"}
          </button>
          {temItens && (
            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-label={aberto ? "Recolher sugestões" : "Expandir sugestões"}
            >
              {aberto ? (
                <ChevronUp className="size-4 text-neutro-muted" />
              ) : (
                <ChevronDown className="size-4 text-neutro-muted" />
              )}
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="flex w-full items-start gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-1 animate-pulse flex-col gap-3 rounded-lg border border-neutro-border bg-white p-6"
            >
              <div className="h-4 w-3/4 rounded bg-neutro-background" />
              <div className="h-3 w-full rounded bg-neutro-background" />
              <div className="h-3 w-5/6 rounded bg-neutro-background" />
            </div>
          ))}
        </div>
      ) : !temItens ? (
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutro-border bg-white p-8 text-center">
          <Sparkles className="size-5 text-neutro-muted" />
          <p className="text-corpo text-neutro-muted">
            Nenhuma sugestão estratégica gerada ainda para {nomeCliente}.
          </p>
          <button
            type="button"
            onClick={handleGerar}
            className="rounded-md bg-menta px-4 py-2 text-corpo font-medium text-white"
          >
            Gerar sugestões
          </button>
        </div>
      ) : (
        aberto && (
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
        )
      )}
    </div>
  );
}
