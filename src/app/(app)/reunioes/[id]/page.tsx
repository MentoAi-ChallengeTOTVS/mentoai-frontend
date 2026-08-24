import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Hourglass, AlertTriangle } from "lucide-react";
import { BadgeStatus } from "@/components/design-system/Badges";
import {
  CardResumoExecutivo,
  CardSinaisComerciais,
  CardHistoricoAnalises,
} from "@/components/design-system/Cards";
import { MOCK_REUNIOES, MOCK_ANALISES, MOCK_SINAIS } from "@/mocks/reunioes";

/**
 * Tela Detalhe da Reunião (Figma: frame "detalhe-reuniao-mentoai", 27:155) —
 * feature F03, issue #71 (parte 2). Cobre BL003 (status de processamento),
 * BL004 (resumo executivo) e BL005 (sinais comerciais) — a aba "Histórico de
 * Análises" (BL015) está aqui como seção fixa dentro da mesma página, não
 * como aba alternável, seguindo a decisão já registrada em
 * `claude/roteiro_validacao_telas.md` (decisão pendente 1) e replicada do
 * Figma (`Card/Historico-Analises` aparece direto no fluxo da página, sem
 * navegação por abas).
 *
 * O campo "Participante" que aparecia numa versão anterior do frame no
 * Figma foi removido pelo time (ver `claude/telas_breno_figma.md` — `Reuniao`
 * só se relaciona com `Cliente`/`Usuario` interno, sem contato do lado do
 * cliente) — o frame já não o inclui, e esta página também não.
 *
 * `Card/Resumo-Executivo` e `Card/Sinais-Comerciais` só fazem sentido quando
 * `statusProcessamento === "PROCESSADA"` (a `AnaliseIA` só tem
 * `resumoExecutivo`/sinais depois de processada) — pros outros 3 estados,
 * a página mostra um card de estado em vez de conteúdo vazio.
 *
 * Server Component (sem "use client") — a página só lê dados mockados de
 * forma síncrona, sem interatividade própria; `params` é `Promise` (padrão
 * do App Router nesta versão do Next.js).
 */

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function DetalheReuniaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reuniaoId = Number(id);
  const reuniao = MOCK_REUNIOES.find((r) => r.id === reuniaoId);

  if (!reuniao) notFound();

  const analise = MOCK_ANALISES[reuniaoId];
  const sinais = MOCK_SINAIS[reuniaoId] ?? [];
  const status = analise?.statusProcessamento ?? "PENDENTE";

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-1.5 text-legenda leading-legenda text-neutro-muted">
            <Link href="/reunioes" className="hover:text-navy">
              Reuniões
            </Link>
            <ChevronRight className="size-2.5" />
            <span>{reuniao.cliente.nome}</span>
            <ChevronRight className="size-2.5" />
            <span className="text-navy">Reunião {formatData(reuniao.dataReuniao)}</span>
          </div>
          <p className="text-titulo leading-titulo font-medium text-navy">
            Reunião — {reuniao.cliente.nome}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-legenda leading-legenda text-neutro-muted">
              <Calendar className="size-3.5" />
              <span>
                Data: <span className="font-medium text-neutro-dark">{formatData(reuniao.dataReuniao)}</span>
              </span>
            </div>
            <span className="text-legenda text-neutro-muted">•</span>
            <div className="flex items-center gap-1.5 text-legenda leading-legenda text-neutro-muted">
              <Clock className="size-3.5" />
              <span>
                Duração: <span className="font-medium text-neutro-dark">{reuniao.duracaoMinutos} min</span>
              </span>
            </div>
          </div>
        </div>
        <BadgeStatus status={status} />
      </div>

      {status === "PROCESSADA" && analise ? (
        <>
          <CardResumoExecutivo resumoExecutivo={analise.resumoExecutivo} />
          {sinais.length > 0 && <CardSinaisComerciais sinais={sinais} />}
        </>
      ) : status === "ERRO" && analise ? (
        <div className="flex w-full items-start gap-4 rounded-lg border border-sinal-risco-churn bg-sinal-risco-churn/[0.06] p-6">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-sinal-risco-churn" />
          <div className="flex flex-col items-start gap-1">
            <p className="text-subtitulo font-medium text-neutro-dark">
              Não foi possível concluir a análise
            </p>
            <p className="text-corpo text-neutro-dark">
              {analise.mensagemErro ?? "Ocorreu um erro inesperado durante o processamento."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center gap-4 rounded-lg border border-neutro-border bg-white p-6">
          <Hourglass className="size-5 shrink-0 text-neutro-muted" />
          <p className="text-corpo text-neutro-dark">
            {status === "PROCESSANDO"
              ? "A IA está processando essa reunião — o resumo executivo e os sinais comerciais aparecem aqui assim que a análise terminar."
              : "Essa reunião ainda está na fila de processamento."}
          </p>
        </div>
      )}

      {analise && (
        <CardHistoricoAnalises
          analise={{
            iniciadoEm: analise.iniciadoEm,
            finalizadoEm: analise.finalizadoEm,
            statusProcessamento: analise.statusProcessamento,
          }}
        />
      )}
    </>
  );
}
