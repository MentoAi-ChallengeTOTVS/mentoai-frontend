"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Hourglass, AlertTriangle } from "lucide-react";
import { BadgeStatus } from "@/components/design-system/Badges";
import type { ItemFilaSeed } from "@/services/reunioes.service";
import type { Reuniao } from "@/types/domain";

type ItemFila = {
  reuniaoId: number;
  reuniao: Reuniao;
  status: "PENDENTE" | "PROCESSANDO";
  progresso: number;
};

type ItemConcluido = {
  reuniaoId: number;
  reuniao: Reuniao;
  concluidoEm: string;
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const INTERVALO_MS = 2500;
const INCREMENTO_PROGRESSO = 28;

/**
 * Client Component da Fila de Processamento — precisa de `setInterval` pra
 * simular as "atualizações periódicas" sem um backend real fazendo
 * polling. Recebe o seed inicial (reuniões `PENDENTE`/`PROCESSANDO`) já
 * carregado pelo Server Component (`page.tsx`) via `reunioesService.
 * listarFilaProcessamento()`.
 *
 * A cada tick: PENDENTE vira PROCESSANDO, e PROCESSANDO avança progresso
 * até "concluir" (vira PROCESSADA e migra pra lista "Concluídas nesta
 * sessão", cada item já linkando pro Detalhe da Reunião — cobre a
 * "navegação para análises concluídas" do escopo da issue #80). Estado é
 * local à página (mesma limitação de "sem estado global entre rotas" já
 * documentada em Nova Reunião/Clientes/Usuários) — reabrir a página reseta
 * a simulação a partir do seed.
 */
export function FilaProcessamentoClient({ seed }: { seed: ItemFilaSeed[] }) {
  const [estado, setEstado] = useState<{ fila: ItemFila[]; concluidas: ItemConcluido[] }>(() => ({
    fila: seed.map((item) => ({
      reuniaoId: item.reuniaoId,
      reuniao: item.reuniao,
      status: item.status,
      progresso: item.progresso,
    })),
    concluidas: [],
  }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEstado((prev) => {
        const proximaFila: ItemFila[] = [];
        const novasConcluidas: ItemConcluido[] = [];
        const agora = new Date().toISOString();

        for (const item of prev.fila) {
          if (item.status === "PENDENTE") {
            proximaFila.push({ ...item, status: "PROCESSANDO", progresso: 15 });
            continue;
          }
          const progresso = Math.min(100, item.progresso + INCREMENTO_PROGRESSO);
          if (progresso >= 100) {
            novasConcluidas.push({ reuniaoId: item.reuniaoId, reuniao: item.reuniao, concluidoEm: agora });
          } else {
            proximaFila.push({ ...item, progresso });
          }
        }

        // Sem early-return por "nada mudou" aqui de propósito: mesmo quando o
        // tamanho da fila não muda entre ticks, o conteúdo dos itens muda
        // (PENDENTE -> PROCESSANDO, progresso avançando) — checar só o
        // tamanho pra decidir se retorna `prev` fazia a tela nunca
        // re-renderizar enquanto a fila mantivesse a mesma quantidade de
        // itens. Sempre retorna um objeto novo.
        return {
          fila: proximaFila,
          concluidas: [...novasConcluidas, ...prev.concluidas],
        };
      });
    }, INTERVALO_MS);

    return () => clearInterval(intervalId);
  }, []);

  const { fila, concluidas } = estado;

  return (
    <>
      <div className="flex w-full flex-col items-start gap-1">
        <p className="text-titulo leading-titulo font-medium text-navy">Fila de Processamento</p>
        <p className="text-caption leading-caption text-neutro-muted">
          Acompanhe o status das análises em andamento — atualiza automaticamente
        </p>
      </div>

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
                key={item.reuniaoId}
                className="flex w-full items-center gap-4 rounded-lg border border-neutro-border bg-white p-4"
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <p className="w-full truncate text-corpo font-medium text-navy">
                    {item.reuniao.cliente.nome}
                  </p>
                  <div className="flex items-center gap-3 text-legenda leading-legenda text-neutro-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatData(item.reuniao.dataReuniao)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {item.reuniao.duracaoMinutos} min
                    </span>
                  </div>
                </div>
                <div className="flex w-56 shrink-0 flex-col items-end gap-1.5">
                  <BadgeStatus status={item.status} />
                  {item.status === "PROCESSANDO" && (
                    <div className="flex w-full flex-col items-end gap-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-menta-suave">
                        <div
                          className="h-full rounded-full bg-menta transition-all"
                          style={{ width: `${item.progresso}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-neutro-muted">{item.progresso}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {concluidas.length > 0 && (
        <div className="flex w-full flex-col items-start gap-4">
          <p className="text-corpo font-medium text-neutro-dark">
            Concluídas nesta sessão ({concluidas.length})
          </p>
          <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white">
            {concluidas.map((item, i) => (
              <Link
                key={item.reuniaoId}
                href={`/reunioes/${item.reuniaoId}`}
                className={
                  "flex w-full items-center gap-4 border-b border-neutro-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-neutro-background" +
                  (i % 2 === 1 ? " bg-[#f8fafc]" : "")
                }
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <p className="w-full truncate text-corpo text-navy">{item.reuniao.cliente.nome}</p>
                  <p className="text-legenda text-neutro-muted">
                    Concluída às {formatHora(item.concluidoEm)}
                  </p>
                </div>
                <BadgeStatus status="PROCESSADA" />
                <ChevronRight className="size-4 shrink-0 text-neutro-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex w-full items-start gap-3 rounded-lg border border-neutro-border bg-white p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-neutro-muted" />
        <p className="text-legenda leading-legenda text-neutro-muted">
          Análises com erro de processamento não aparecem nesta fila — elas ficam visíveis
          direto no{" "}
          <Link href="/reunioes" className="font-medium text-menta">
            Detalhe da Reunião
          </Link>{" "}
          correspondente, com a mensagem de erro.
        </p>
      </div>
    </>
  );
}
