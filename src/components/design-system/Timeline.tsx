import clsx from "clsx";
import { Calendar } from "lucide-react";
import { BadgeStatus } from "./Badges";
import type { Reuniao, StatusProcessamento } from "@/types/domain";

/**
 * Item/Timeline-Reuniao (44:384) — usado na tela Perfil do Cliente pra
 * listar o histórico de reuniões em formato de linha do tempo (marcador +
 * linha conectora à esquerda, card com data/status/resumo à direita).
 *
 * `resumo` é uma síntese curta de uma linha (o Figma mostra texto solto, não
 * o `AnaliseIA.resumoExecutivo` inteiro) — passado explícito em vez de
 * derivado, já que hoje não há um campo curto equivalente no domínio.
 */

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ItemTimelineReuniao({
  reuniao,
  resumo,
  status,
  ultimo = false,
  className,
}: {
  reuniao: Pick<Reuniao, "dataReuniao">;
  resumo: string;
  status: StatusProcessamento;
  /** Esconde a linha conectora — usar no último item da lista. */
  ultimo?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx("flex w-full items-start gap-4", className)}
      data-node-id="44:384"
      data-name="timeline-item"
    >
      <div className="flex w-4 shrink-0 flex-col items-center self-stretch">
        <span className="size-2.5 shrink-0 rounded-full bg-menta" />
        {!ultimo && <div className="w-px flex-1 bg-neutro-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3 rounded-lg border border-neutro-border bg-white p-[18px]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-neutro-muted" />
            <span className="text-legenda text-neutro-muted">{formatData(reuniao.dataReuniao)}</span>
          </div>
          <BadgeStatus status={status} />
        </div>
        <p className="w-full text-corpo text-neutro-dark">{resumo}</p>
      </div>
    </div>
  );
}
