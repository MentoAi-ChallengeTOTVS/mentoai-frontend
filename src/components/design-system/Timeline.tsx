import clsx from "clsx";
import { Calendar } from "lucide-react";
import Link from "next/link";
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
  href,
  ultimo = false,
  className,
}: {
  reuniao: Pick<Reuniao, "dataReuniao">;
  resumo: string;
  status?: StatusProcessamento;
  /** Torna o card navegável quando a reunião possui uma tela de detalhes. */
  href?: string;
  /** Esconde a linha conectora — usar no último item da lista. */
  ultimo?: boolean;
  className?: string;
}) {
  const conteudoCard = (
    <>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-neutro-muted" />
          <span className="text-legenda text-neutro-muted">{formatData(reuniao.dataReuniao)}</span>
        </div>
        {status ? <BadgeStatus status={status} /> : <span className="text-caption text-neutro-muted">Análise indisponível</span>}
      </div>
      <p className="w-full text-corpo text-neutro-dark">{resumo}</p>
    </>
  );

  const cardClassName = clsx(
    "flex min-w-0 flex-1 flex-col items-start gap-3 rounded-lg border border-neutro-border bg-white p-[18px]",
    !ultimo && "mb-4",
    href && "cursor-pointer transition-colors hover:border-menta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-menta",
  );

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
      {href ? (
        <Link href={href} className={cardClassName} aria-label={`Ver detalhes da reunião de ${formatData(reuniao.dataReuniao)}`}>
          {conteudoCard}
        </Link>
      ) : (
        <div className={cardClassName}>{conteudoCard}</div>
      )}
    </div>
  );
}
