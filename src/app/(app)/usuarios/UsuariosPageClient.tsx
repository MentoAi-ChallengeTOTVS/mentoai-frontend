"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { RowUsuario } from "@/components/design-system/Rows";
import { PanelEditarUsuario, type EditarUsuarioInput } from "@/components/design-system/Panels";
import { listarUsuarios, criarUsuario, atualizarUsuario, alterarStatusUsuario } from "@/services/usuarios.service";
import { ApiError } from "@/services/api";
import { useAuth } from "@/lib/auth";
import type { SpringPage, UsuarioResponse } from "@/types/api";

function mensagemErro(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Falha de conexão com a API. Verifique a rede e tente novamente.";
  return error instanceof Error ? error.message : "Não foi possível concluir. Verifique sua conexão.";
}

export function UsuariosPageClient() {
  const { usuario: usuarioLogado, carregando: carregandoSessao } = useAuth();
  const autorizado = !carregandoSessao && usuarioLogado?.role === "DIRETOR_COMERCIAL";
  const [dados, setDados] = useState<SpringPage<UsuarioResponse> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [painel, setPainel] = useState<"novo" | UsuarioResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const gravacao = useRef(false);
  const paginaSolicitada = useRef(0);
  const paginaAtual = dados?.number ?? 0;

  const carregar = useCallback(async (pagina: number) => {
    paginaSolicitada.current = pagina;
    const id = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setCarregando(true);
    setErroLista(null);
    try {
      const resposta = await listarUsuarios(pagina, controller.signal);
      if (id === requestId.current && !controller.signal.aborted) setDados(resposta);
    } catch (error) {
      if (id === requestId.current && !controller.signal.aborted) setErroLista(mensagemErro(error));
    } finally {
      if (id === requestId.current && !controller.signal.aborted) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    let ativo = true;
    void Promise.resolve().then(() => { if (ativo) void carregar(0); });
    return () => { ativo = false; abortRef.current?.abort(); };
  }, [autorizado, carregar]);

  function abrir(usuario: "novo" | UsuarioResponse) {
    setErroSalvar(null); setAviso(null); setPainel(usuario);
  }
  function fechar() { if (!gravacao.current) { setPainel(null); setErroSalvar(null); } }

  async function salvar(input: EditarUsuarioInput) {
    if (!autorizado || gravacao.current || !painel) return;
    if (!input.senha?.trim()) { setErroSalvar("Informe a senha que será definida para este usuário."); return; }
    gravacao.current = true; setSalvando(true); setErroSalvar(null);
    try {
      const body = { nome: input.nome, email: input.email, senha: input.senha, perfil: input.perfil };
      const criado = painel === "novo";
      const resposta = criado ? await criarUsuario(body) : await atualizarUsuario(painel.id, body);
      setDados((prev) => prev ? { ...prev, content: prev.content.map((u) => u.id === resposta.id ? resposta : u) } : prev);
      setPainel(null);
      setAviso(criado ? `Usuário ${resposta.nome} criado com sucesso.` : "Dados do usuário salvos.");
      await carregar(criado ? 0 : paginaAtual);
    } catch (error) { setErroSalvar(mensagemErro(error)); }
    finally { gravacao.current = false; setSalvando(false); }
  }

  async function salvarStatus(ativo: boolean) {
    if (!autorizado || gravacao.current || !painel || painel === "novo") return;
    gravacao.current = true; setSalvando(true); setErroSalvar(null);
    try {
      const resposta = await alterarStatusUsuario(painel.id, ativo);
      // Atualiza a referência confirmada sem apagar alterações de campos ainda não salvos no painel.
      setPainel(resposta);
      setDados((prev) => prev ? { ...prev, content: prev.content.map((u) => u.id === resposta.id ? resposta : u) } : prev);
      setAviso("Status do usuário salvo.");
      await carregar(paginaAtual);
    } catch (error) { setErroSalvar(mensagemErro(error)); }
    finally { gravacao.current = false; setSalvando(false); }
  }

  if (carregandoSessao || !usuarioLogado) return <p role="status" className="text-corpo text-neutro-muted">Carregando sessão...</p>;
  if (!autorizado) return (
    <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-neutro-border bg-white p-8 text-center sm:p-16">
      <ShieldAlert className="size-8 text-sinal-alerta" />
      <h1 className="text-subtitulo font-medium text-navy">Acesso restrito</h1>
      <p className="text-corpo text-neutro-muted">O gerenciamento de usuários é exclusivo do perfil Diretor Comercial.</p>
    </div>
  );

  return (
    <>
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-titulo leading-titulo font-medium text-navy">Gerenciamento de Usuários</h1>
          <p className="text-legenda text-sidebar-muted-2">Gerencie os acessos da sua equipe</p></div>
        <ButtonPrimary icon={<Plus className="size-4" />} onClick={() => abrir("novo")} disabled={salvando} className="justify-center">Novo usuário</ButtonPrimary>
      </div>
      {aviso && <p role="status" className="text-corpo text-menta">{aviso}</p>}
      {erroLista && <div role="alert" className="text-corpo text-sinal-risco-churn">
        {aviso ? "A gravação foi concluída, mas a lista não pôde ser atualizada. " : "Não foi possível atualizar a lista. "}
        {erroLista} <button type="button" disabled={carregando || salvando} onClick={() => void carregar(paginaSolicitada.current)} className="underline">Tentar novamente</button>
      </div>}
      <div aria-busy={carregando} className="flex w-full flex-col overflow-hidden rounded-lg border border-neutro-border bg-white">
        <div className="hidden w-full gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda text-sidebar-muted-2 lg:flex">
          <p className="flex-1">Nome</p><p className="w-60 shrink-0">E-mail</p><p className="w-45 shrink-0">Perfil de Acesso</p><p className="w-30 shrink-0">Status</p><p className="w-20 shrink-0 text-center">Ações</p>
        </div>
        {carregando && <p role="status" className="p-6 text-corpo text-neutro-muted">Carregando usuários...</p>}
        {!carregando && !erroLista && dados?.content.length === 0 && <p className="p-6 text-corpo text-neutro-muted">Nenhum usuário disponível.</p>}
        {dados?.content.map((u, i) => <RowUsuario key={u.id} usuario={u} onEdit={() => abrir(u)} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"} />)}
        <div className="flex w-full flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-legenda text-neutro-muted">Exibindo {dados?.content.length ?? 0} de {dados?.totalElements ?? 0} usuários</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => void carregar(paginaAtual - 1)} disabled={carregando || salvando || paginaAtual <= 0} className="rounded border border-neutro-border px-3 py-1.5 text-caption disabled:opacity-40">Anterior</button>
            <button type="button" onClick={() => void carregar(paginaAtual + 1)} disabled={carregando || salvando || !dados || paginaAtual + 1 >= dados.totalPages} className="rounded border border-neutro-border px-3 py-1.5 text-caption disabled:opacity-40">Próximo</button>
          </div>
        </div>
      </div>
      {painel && <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={fechar}>
        <div className="h-full w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
          <PanelEditarUsuario key={painel === "novo" ? "novo" : painel.id} usuario={painel === "novo" ? undefined : painel}
            onClose={fechar} onCancel={fechar} onSubmit={salvar} onSalvarStatus={salvarStatus} salvando={salvando} erro={erroSalvar} aviso={aviso} />
        </div>
      </div>}
    </>
  );
}
