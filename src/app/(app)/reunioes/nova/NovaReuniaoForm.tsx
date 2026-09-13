"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { CardUploadTranscricao } from "@/components/design-system/Cards";
import { PanelStatusEnvio } from "@/components/design-system/Panels";
import { enviarTranscricao } from "@/services/reunioes.service";
import { ApiError } from "@/services/api";
import type { Cliente } from "@/types/domain";
import type { UploadTranscricaoResponse } from "@/types/api";

// Decisão temporária autorizada para esta integração; não representa a sessão.
const USUARIO_ID_UPLOAD = 1;
const LIMITE_ARQUIVO = 1_048_576;

function formatarTamanho(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function mensagemErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    const mensagens: Record<number, string> = {
      400: "Confira os dados e o conteúdo da transcrição.",
      404: "O cliente ou usuário informado não foi encontrado.",
      409: "Não foi possível salvar por um conflito de dados.",
      413: "O arquivo excede o limite de 1 MiB.",
      415: "Envie um arquivo .txt em UTF-8.",
      500: "O servidor não conseguiu concluir o envio.",
    };
    return `${mensagens[erro.status] ?? "Não foi possível enviar."} ${erro.message}`;
  }
  if (erro instanceof TypeError) return "Falha de conexão com a API. Verifique a rede e tente novamente.";
  return erro instanceof Error ? erro.message : "Não foi possível enviar. Verifique sua conexão e tente novamente.";
}

export function NovaReuniaoForm({ clientes }: { clientes: Cliente[] }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState("");
  const [duracao, setDuracao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<UploadTranscricaoResponse | null>(null);
  const [enviadoEm, setEnviadoEm] = useState("");
  const [versaoArquivo, setVersaoArquivo] = useState(0);
  const emVoo = useRef(false);
  const bloqueado = enviando || resultado !== null;

  function selecionar(files: FileList) {
    if (bloqueado || emVoo.current) return;
    const file = files.length === 1 ? files[0] : null;
    setArquivo(file);
    if (files.length > 1) setErro("Selecione apenas um arquivo.");
    else if (file && !file.name.toLowerCase().endsWith(".txt")) setErro("Selecione um arquivo .txt.");
    else if (file && (file.size === 0 || file.size > LIMITE_ARQUIVO)) setErro("O arquivo deve ser não vazio e ter até 1 MiB.");
    else setErro(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (emVoo.current || resultado) return;
    setErro(null);
    if (!arquivo || !arquivo.name.toLowerCase().endsWith(".txt")) { setErro("Selecione um arquivo .txt."); return; }
    if (arquivo.size === 0 || arquivo.size > LIMITE_ARQUIVO) { setErro("O arquivo deve ser não vazio e ter até 1 MiB."); return; }
    const id = Number(clienteId);
    if (!Number.isSafeInteger(id) || id <= 0 || !clientes.some((c) => c.id === id)) { setErro("Selecione um cliente válido."); return; }
    if (!data || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(data) || Number.isNaN(new Date(data).getTime())) { setErro("Informe data e horário válidos."); return; }
    const minutos = Number(duracao);
    if (!duracao.trim() || !Number.isInteger(minutos) || minutos < 0 || minutos > 2147483647) { setErro("Informe uma duração inteira maior ou igual a zero."); return; }
    emVoo.current = true;
    setEnviando(true);
    try {
      const resposta = await enviarTranscricao({
        arquivo, clienteId: id, usuarioId: USUARIO_ID_UPLOAD,
        dataReuniao: data.length === 16 ? `${data}:00` : data,
        duracaoMinutos: minutos,
      });
      setResultado(resposta);
      setEnviadoEm(new Date().toISOString());
    } catch (error) { setErro(mensagemErro(error)); }
    finally { emVoo.current = false; setEnviando(false); }
  }

  function novoEnvio() {
    setResultado(null); setArquivo(null); setClienteId(""); setData(""); setDuracao("");
    setErro(null); setEnviadoEm(""); setVersaoArquivo((v) => v + 1);
  }

  return (
    <>
      <div className="flex w-full flex-col items-start gap-1">
        <h1 className="text-titulo leading-titulo font-medium text-navy">Nova Reunião</h1>
        <p className="text-caption text-neutro-muted">Envie a transcrição de uma reunião para análise pela IA</p>
      </div>
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <form onSubmit={handleSubmit} className="flex w-full min-w-0 flex-1 flex-col gap-6 rounded-lg border border-neutro-border bg-white p-6">
          <CardUploadTranscricao key={versaoArquivo} onFilesSelected={selecionar} accept=".txt" multiple={false} disabled={bloqueado}
            acceptDescription="Um arquivo .txt em UTF-8, não vazio, até 1 MiB." className="w-full" />
          {arquivo && <p className="break-words text-caption text-neutro-muted">Arquivo selecionado: {arquivo.name} ({formatarTamanho(arquivo.size)})</p>}
          <fieldset disabled={bloqueado} className="flex min-w-0 flex-col gap-4">
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-legenda text-navy">Cliente
                <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="h-10 w-full rounded-md border border-neutro-border bg-white px-3 text-corpo">
                  <option value="">Selecione o cliente...</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-legenda text-navy">Data e horário da reunião
                <input required type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo" />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-legenda text-navy">Duração em minutos
              <input required type="number" min={0} max={2147483647} step={1} value={duracao} onChange={(e) => setDuracao(e.target.value)} className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo sm:w-48" />
            </label>
          </fieldset>
          {erro && <p role="alert" className="text-caption text-sinal-risco-churn">{erro}</p>}
          {clientes.length === 0 && <p className="text-caption text-neutro-muted">Cadastre um cliente antes de enviar uma transcrição.</p>}
          <div className="flex justify-end">
            <ButtonPrimary type="submit" icon={<Sparkles className="size-4" />} disabled={bloqueado || clientes.length === 0}>{enviando ? "Enviando..." : "Enviar para análise"}</ButtonPrimary>
          </div>
        </form>
        <div className="w-full lg:w-[380px] lg:shrink-0">
          {resultado && arquivo ? <PanelStatusEnvio status={resultado.status} nomeArquivo={arquivo.name} tamanhoArquivo={formatarTamanho(arquivo.size)} enviadoEm={enviadoEm} />
            : <div className="rounded-lg border border-dashed border-neutro-border bg-white p-8 text-center text-corpo text-neutro-muted">O status aparece aqui após a confirmação do envio.</div>}
        </div>
      </div>
      {resultado && <div role="status" className="flex w-full flex-col gap-3 rounded-lg border border-sinal-oportunidade bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-corpo text-neutro-dark">Reunião #{resultado.reuniaoId} recebida. Análise #{resultado.analiseId} pendente.</p>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={novoEnvio} className="text-corpo font-medium text-menta">Enviar outra</button>
          <Link href="/reunioes/fila" className="text-corpo font-medium text-navy">Acompanhar na fila</Link>
        </div>
      </div>}
    </>
  );
}
