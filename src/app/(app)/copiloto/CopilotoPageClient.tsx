"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Paperclip, PlusCircle, Search, Send } from "lucide-react";
import { ItemConversa, BubblePergunta, BubbleRespostaIa } from "@/components/design-system/Chat";
import { buscarConversa, criarConversa, enviarPergunta } from "@/services/chat.service";
import type { DetalheChat } from "@/services/chat.service";
import type { Chat, PerguntaChat } from "@/types/domain";

function formatDataConversa(iso: string) {
  return new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

/**
 * Client Component do Copiloto — histórico à esquerda, conversa à direita.
 *
 * Layout: o frame do Figma é um chat de borda a borda (a coluna de conversas
 * encosta na Sidebar e a conversa ocupa toda a altura), diferente das outras
 * telas, que vivem dentro do padding do `main`. Por isso a margem negativa no
 * container — é a forma de anular o padding do layout só nesta tela, sem
 * mexer no layout compartilhado por todas as outras.
 *
 * Limitações conhecidas (mesmas gaps já documentados nas outras telas):
 * - Sem estado global entre rotas: a conversa criada e as perguntas enviadas
 *   vivem só no state local e não sobrevivem a um F5.
 * - O clipe de anexo do frame é decorativo por enquanto — não há endpoint de
 *   upload no Copiloto (o upload de transcrição é outro fluxo, em Nova
 *   Reunião).
 */
export function CopilotoPageClient({
  conversasIniciais,
  conversaAbertaInicial,
}: {
  conversasIniciais: Chat[];
  conversaAbertaInicial: DetalheChat | null;
}) {
  const [conversas, setConversas] = useState(conversasIniciais);
  const [chatAtivo, setChatAtivo] = useState<Chat | null>(conversaAbertaInicial?.chat ?? null);
  const [perguntas, setPerguntas] = useState<PerguntaChat[]>(conversaAbertaInicial?.perguntas ?? []);
  const [busca, setBusca] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimDasMensagens = useRef<HTMLDivElement>(null);

  const conversasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return conversas;
    return conversas.filter((c) => c.titulo.toLowerCase().includes(q));
  }, [conversas, busca]);

  // Rola pro fim quando chega mensagem nova (inclusive o "pensando").
  useEffect(() => {
    fimDasMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [perguntas, enviando]);

  async function abrirConversa(chat: Chat) {
    if (chat.id === chatAtivo?.id) return;
    setChatAtivo(chat);
    setPerguntas([]);
    const detalhe = await buscarConversa(chat.id);
    setPerguntas(detalhe?.perguntas ?? []);
  }

  async function handleNovaConversa() {
    const nova = await criarConversa("Nova conversa");
    setConversas((prev) => [nova, ...prev]);
    setChatAtivo(nova);
    setPerguntas([]);
  }

  async function handleEnviar() {
    if (!chatAtivo || !texto.trim() || enviando) return;
    const pergunta = texto.trim();
    setTexto("");
    setEnviando(true);
    try {
      const nova = await enviarPergunta(chatAtivo.id, pergunta);
      setPerguntas((prev) => [...prev, nova]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="-m-4 flex min-h-0 flex-1 flex-col gap-4 self-stretch bg-neutro-background sm:-m-6 lg:-m-8 lg:flex-row">
      {/* ---------- Coluna de conversas ---------- */}
      <aside className="flex w-full shrink-0 flex-col gap-3 bg-white p-4 lg:w-70 lg:min-h-0 lg:p-5">
        <div className="flex w-full items-center justify-between">
          <p className="text-subtitulo leading-subtitulo font-medium text-navy">Conversas</p>
          <button
            type="button"
            onClick={handleNovaConversa}
            aria-label="Nova conversa"
            className="flex size-6 shrink-0 items-center justify-center text-menta transition-opacity hover:opacity-80"
          >
            <PlusCircle className="size-5" />
          </button>
        </div>

        <div className="flex h-9 w-full items-center gap-2 rounded-md border border-neutro-border bg-white px-3">
          <Search className="size-4 shrink-0 text-sidebar-muted-2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar conversas..."
            className="min-w-0 flex-1 text-corpo text-navy placeholder:text-sidebar-muted-2 focus:outline-none"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {conversasFiltradas.length === 0 ? (
            <p className="w-full py-6 text-center text-legenda text-neutro-muted">
              Nenhuma conversa encontrada.
            </p>
          ) : (
            conversasFiltradas.map((chat) => (
              <ItemConversa
                key={chat.id}
                chat={chat}
                ativo={chat.id === chatAtivo?.id}
                onClick={() => abrirConversa(chat)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ---------- Conversa ---------- */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col border-neutro-border bg-white lg:border-l">
        {chatAtivo ? (
          <>
            <header className="flex w-full flex-col items-start gap-3 border-b border-neutro-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="flex w-full min-w-0 flex-col items-start gap-1 sm:w-auto">
                <p className="w-full truncate text-titulo leading-titulo font-medium text-navy">
                  {chatAtivo.titulo}
                </p>
                <p className="text-legenda leading-legenda text-neutro-muted">
                  Conversa iniciada em {formatDataConversa(chatAtivo.criacao)}
                </p>
              </div>
              <button
                type="button"
                // Sem endpoint de exportação ainda — o frame mostra o botão,
                // então ele existe e fica desabilitado, em vez de virar um
                // clique morto como era o "Buscar" da Sidebar.
                disabled
                title="Exportação ainda não disponível — depende do backend"
                className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-neutro-border bg-white px-3 text-legenda font-medium text-navy disabled:opacity-50"
              >
                <Download className="size-4 text-neutro-muted" />
                Exportar Histórico
              </button>
            </header>

            <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-6 overflow-y-auto px-4 py-6 sm:px-6">
              {perguntas.length === 0 && !enviando && (
                <p className="w-full py-10 text-center text-corpo text-neutro-muted">
                  Nenhuma pergunta nesta conversa ainda. Comece perguntando algo sobre o cliente ou
                  a reunião.
                </p>
              )}

              {perguntas.map((p) => (
                <div key={p.id} className="flex w-full flex-col items-start gap-4">
                  <BubblePergunta pergunta={p.pergunta} className="self-end" />
                  <BubbleRespostaIa resposta={p.resposta} />
                </div>
              ))}

              {enviando && (
                <div className="flex w-full items-center gap-2 text-legenda text-neutro-muted">
                  <span className="size-2 animate-pulse rounded-full bg-gerado-ia" />
                  O Copiloto está analisando...
                </div>
              )}

              <div ref={fimDasMensagens} />
            </div>

            <div className="flex w-full flex-col items-start gap-2 border-t border-neutro-border px-4 py-4 sm:px-6">
              <div className="flex w-full items-center gap-3 rounded-lg border border-neutro-border bg-neutro-background/60 px-4 py-3">
                <Paperclip className="size-4 shrink-0 text-neutro-muted" aria-hidden="true" />
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEnviar();
                    }
                  }}
                  disabled={enviando}
                  placeholder="Pergunte algo sobre este cliente ou reunião..."
                  aria-label="Pergunta para o Copiloto"
                  className="min-w-0 flex-1 bg-transparent text-corpo text-navy placeholder:text-neutro-muted focus:outline-none disabled:opacity-60"
                />
                {/* O frame só documenta o envio por Enter; o botão existe pra
                    quem estiver no celular, onde não há tecla Enter à mão. */}
                <button
                  type="button"
                  onClick={handleEnviar}
                  disabled={enviando || !texto.trim()}
                  aria-label="Enviar pergunta"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-menta transition-opacity hover:opacity-80 disabled:opacity-40 lg:hidden"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <div className="flex w-full flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-legenda leading-legenda text-neutro-muted">
                  Pressione Enter para enviar. MentoAI pode apresentar informações imprecisas.
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-menta" aria-hidden="true" />
                  <p className="text-legenda leading-legenda text-neutro-muted">
                    Histórico salvo automaticamente
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-subtitulo font-medium text-navy">Nenhuma conversa aberta</p>
            <p className="max-w-100 text-corpo text-neutro-muted">
              Crie uma conversa nova para perguntar ao Copiloto sobre um cliente ou uma reunião.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
