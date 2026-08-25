"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { CardUploadTranscricao } from "@/components/design-system/Cards";
import { PanelStatusEnvio } from "@/components/design-system/Panels";
import { enviarTranscricao } from "@/services/reunioes.service";
import type { Cliente, StatusProcessamento } from "@/types/domain";

const FORMATOS_ACEITOS = ".txt,.docx,.pdf,.srt";

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Client Component do formulário de Nova Reunião — recebe a lista de
 * clientes já carregada pelo Server Component (`page.tsx`). O envio chama
 * `reunioesService.enviarTranscricao` (equivalente a um `POST /api/
 * reunioes` multipart no mundo real, que devolveria só `PENDENTE`); a
 * progressão `PROCESSANDO` -> `PROCESSADA` que o painel anima depois
 * continua sendo uma simulação local — no mundo real isso viria da fila
 * (`/reunioes/fila`, polling ou push), não da resposta do envio.
 */
export function NovaReuniaoForm({ clientes }: { clientes: Cliente[] }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviadoEm, setEnviadoEm] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusProcessamento | null>(null);
  const [progresso, setProgresso] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleFilesSelected(files: FileList) {
    setArquivo(files[0] ?? null);
    setErro(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) {
      setErro("Selecione o arquivo da transcrição.");
      return;
    }
    if (!clienteId) {
      setErro("Selecione o cliente da reunião.");
      return;
    }
    if (!data) {
      setErro("Informe a data da reunião.");
      return;
    }
    setErro(null);
    setEnviadoEm(new Date().toISOString());

    const { status: statusInicial } = await enviarTranscricao({
      clienteId: Number(clienteId),
      data,
      nomeArquivo: arquivo.name,
      tamanhoBytes: arquivo.size,
    });
    setStatus(statusInicial);
    setProgresso(0);

    timers.current.push(
      setTimeout(() => {
        setStatus("PROCESSANDO");
        let p = 0;
        const step = () => {
          p = Math.min(100, p + 12);
          setProgresso(p);
          if (p < 100) {
            timers.current.push(setTimeout(step, 180));
          } else {
            timers.current.push(setTimeout(() => setStatus("PROCESSADA"), 300));
          }
        };
        step();
      }, 400)
    );
  }

  function handleNovoEnvio() {
    setArquivo(null);
    setClienteId("");
    setData("");
    setStatus(null);
    setProgresso(0);
    setEnviadoEm(null);
  }

  const enviando = status !== null && status !== "PROCESSADA";
  const clienteSelecionado = clientes.find((c) => String(c.id) === clienteId);

  return (
    <>
      <div className="flex w-full flex-col items-start gap-1">
        <p className="text-titulo leading-titulo font-medium text-navy">Nova Reunião</p>
        <p className="text-caption leading-caption text-neutro-muted">
          Envie a transcrição de uma reunião para análise pela IA
        </p>
      </div>

      <div className="flex w-full items-start gap-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col items-start gap-6 rounded-lg border border-neutro-border bg-white p-6"
        >
          <CardUploadTranscricao
            onFilesSelected={handleFilesSelected}
            accept={FORMATOS_ACEITOS}
            className="w-full"
          />

          {arquivo && (
            <p className="text-caption leading-caption text-neutro-muted">
              Arquivo selecionado: <span className="text-neutro-dark">{arquivo.name}</span> (
              {formatarTamanho(arquivo.size)})
            </p>
          )}

          <div className="flex w-full items-start gap-4">
            <label className="flex flex-1 flex-col items-start gap-2">
              <span className="text-legenda leading-legenda text-navy">Cliente</span>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                disabled={enviando}
                className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo text-navy focus:outline-none focus:ring-2 focus:ring-menta-clara disabled:opacity-60"
              >
                <option value="">Buscar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col items-start gap-2">
              <span className="text-legenda leading-legenda text-navy">Data da reunião</span>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={enviando}
                className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo text-navy focus:outline-none focus:ring-2 focus:ring-menta-clara disabled:opacity-60"
              />
            </label>
          </div>

          {erro && <p className="text-caption leading-caption text-sinal-risco-churn">{erro}</p>}

          <div className="flex w-full items-center justify-end">
            <ButtonPrimary
              type="submit"
              icon={<Sparkles className="size-4" />}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar para análise"}
            </ButtonPrimary>
          </div>
        </form>

        {status && enviadoEm && arquivo ? (
          <div className="w-[380px] shrink-0">
            <PanelStatusEnvio
              status={status}
              nomeArquivo={arquivo.name}
              tamanhoArquivo={formatarTamanho(arquivo.size)}
              progresso={status === "PROCESSANDO" ? progresso : undefined}
              enviadoEm={enviadoEm}
            />
          </div>
        ) : (
          <div className="flex w-[380px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutro-border bg-white p-8 text-center">
            <p className="text-corpo text-neutro-muted">
              O status do envio aparece aqui assim que você enviar a transcrição para análise.
            </p>
          </div>
        )}
      </div>

      {status === "PROCESSADA" && (
        <div className="flex w-full items-center justify-between rounded-lg border border-sinal-oportunidade bg-sinal-oportunidade/[0.06] px-6 py-4">
          <p className="text-corpo text-neutro-dark">
            Transcrição {clienteSelecionado ? `de ${clienteSelecionado.nome} ` : ""}enviada para
            análise. A IA está processando os sinais comerciais dessa reunião.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleNovoEnvio}
              className="text-corpo font-medium text-menta"
            >
              Enviar outra
            </button>
            <Link
              href="/reunioes"
              className="flex items-center gap-1 text-corpo font-medium text-navy"
            >
              Ver todas as reuniões
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
