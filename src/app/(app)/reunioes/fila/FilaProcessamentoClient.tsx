"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Hourglass, WifiOff } from "lucide-react";
import { BadgeStatus } from "@/components/design-system/Badges";
import { listarFilaProcessamento } from "@/services/reunioes.service";
import type { AnaliseFilaResponse } from "@/types/api";

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const INTERVALO_MS = 2000;

/**
 * Client Component da Fila de Processamento.
 *
 * Desde 13/09/2026 não simula mais nada localmente: faz a carga inicial e
 * um `setInterval` de 2 em 2 segundos
 * chamando o mesmo endpoint real (`GET /api/v1/analises/fila`) — a
 * progressão PENDENTE -> PROCESSANDO -> PROCESSADA/ERRO acontece no
 * backend; aqui só se busca e renderiza o estado mais recente. Sem barra de
 * progresso/percentual (removida a pedido — o backend não expõe um
 * percentual de progresso, só o status discreto).
 */
export function FilaProcessamentoClient() {
  const [estado, setEstado] = useState<AnaliseFilaResponse | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const atualizar = async () => {
      try {
        const atual = await listarFilaProcessamento();
        if (!cancelado) {
          setEstado(atual);
          setOffline(false);
        }
      } catch {
        // Backend fora do ar / rede indisponível — mantém o último estado
        // conhecido na tela em vez de limpar tudo, só sinaliza o problema.
        if (!cancelado) setOffline(true);
      }
    };

    void atualizar();
    const intervalId = setInterval(atualizar, INTERVALO_MS);

    return () => {
      cancelado = true;
      clearInterval(intervalId);
    };
  }, []);

  if (!estado) {
    return offline
      ? <p role="alert" className="text-corpo text-sinal-risco-churn">Não foi possível carregar a fila de processamento.</p>
      : <p role="status" className="text-corpo text-neutro-muted">Carregando fila de processamento...</p>;
  }

  const { fila, finalizados } = estado;

  return (
    <>
      <div className="flex w-full flex-col items-start gap-1">
        <p className="text-titulo leading-titulo font-medium text-navy">Fila de Processamento</p>
        <p className="text-caption leading-caption text-neutro-muted">
          Acompanhe o status das análises em andamento — atualiza automaticamente a cada 2s
        </p>
      </div>

      {offline && (
        <div className="flex w-full items-center gap-2 rounded-lg border border-sinal-alerta bg-sinal-alerta/[0.08] px-4 py-2.5 text-legenda text-sinal-alerta">
          <WifiOff className="size-3.5 shrink-0" />
          Não foi possível atualizar a fila agora — mostrando o último status conhecido.
        </div>
      )}

      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-menta opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-menta" />
          </span>
          <p className="text-corpo font-medium text-neutro-dark">
            Em andamento ({fila.length})
          </p>
        </div>

        {fila.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutro-border bg-white p-8 text-center">
            <Hourglass className="size-5 text-neutro-muted" />
            <p className="text-corpo text-neutro-muted">
              Nenhuma análise em processamento no momento. Novas reuniões enviadas em{" "}
              <Link href="/reunioes/nova" className="font-medium text-menta">
                Nova Reunião
              </Link>{" "}
              entram na fila automaticamente.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-3">
            {fila.map((item) => (
              <div
                key={item.analiseId}
                className="flex w-full flex-col items-stretch gap-3 rounded-lg border border-neutro-border bg-white p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <p className="w-full truncate text-corpo font-medium text-navy">
                    {item.clienteNome}
                  </p>
                  <div className="flex items-center gap-3 text-legenda leading-legenda text-neutro-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      Na fila desde {formatDataHora(item.criadoEm)}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-start sm:w-auto sm:shrink-0">
                  <BadgeStatus status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {finalizados.length > 0 && (
        <div className="flex w-full flex-col items-start gap-4">
          <p className="text-corpo font-medium text-neutro-dark">
            Finalizadas recentemente ({finalizados.length})
          </p>
          <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white">
            {finalizados.map((item, i) => (
              <Link
                key={item.analiseId}
                href={`/reunioes/${item.reuniaoId}`}
                className={
                  "flex w-full items-center gap-4 border-b border-neutro-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-neutro-background" +
                  (i % 2 === 1 ? " bg-[#f8fafc]" : "")
                }
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <p className="w-full truncate text-corpo text-navy">{item.clienteNome}</p>
                  <p className="text-legenda text-neutro-muted">
                    {item.status === "ERRO"
                      ? (item.mensagemErro ?? "Erro no processamento")
                      : item.finalizadoEm
                        ? `Concluída às ${formatDataHora(item.finalizadoEm)}`
                        : "Concluída"}
                  </p>
                </div>
                <BadgeStatus status={item.status} />
                <ChevronRight className="size-4 shrink-0 text-neutro-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
