"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { RowUsuario } from "@/components/design-system/Rows";
import { PanelEditarUsuario, type EditarUsuarioInput } from "@/components/design-system/Panels";
import { criarUsuario, atualizarUsuario } from "@/services/usuarios.service";
import { useAuth } from "@/lib/auth";
import type { Usuario } from "@/types/domain";

/**
 * Client Component da tela Usuários — paginação/drawer de cadastro-edição
 * mais o guard de acesso por perfil (`useAuth()`, só existe no client).
 * Recebe a lista inicial já carregada pelo Server Component (`page.tsx`),
 * que chama `usuariosService.listarUsuarios()`.
 */
const TAMANHO_PAGINA = 5; // bate com o "Exibindo 5 de 14 usuários" do Figma

export function UsuariosPageClient({ usuariosIniciais }: { usuariosIniciais: Usuario[] }) {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [pagina, setPagina] = useState(1);
  const [painelAberto, setPainelAberto] = useState<null | "novo" | Usuario>(null);

  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
  const usuariosDaPagina = usuarios.slice(inicio, inicio + TAMANHO_PAGINA);

  const usuarioEmEdicao = painelAberto && typeof painelAberto === "object" ? painelAberto : undefined;

  async function handleSalvar({ id, ...dados }: EditarUsuarioInput) {
    if (id !== undefined) {
      await atualizarUsuario(id, dados);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...dados, atualizacao: new Date().toISOString() } : u))
      );
    } else {
      const novo = await criarUsuario(dados);
      setUsuarios((prev) => [novo, ...prev]);
    }
    setPainelAberto(null);
  }

  if (usuarioLogado && usuarioLogado.perfil !== "DIRETOR_COMERCIAL") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-neutro-border bg-white p-16 text-center">
        <ShieldAlert className="size-8 text-sinal-alerta" />
        <p className="text-subtitulo leading-subtitulo font-medium text-navy">Acesso restrito</p>
        <p className="max-w-sm text-corpo text-neutro-muted">
          O gerenciamento de usuários é exclusivo do perfil Diretor Comercial.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">Gerenciamento de Usuários</p>
          <p className="text-legenda leading-legenda text-sidebar-muted-2">
            Gerencie os acessos da sua equipe
          </p>
        </div>
        <ButtonPrimary icon={<Plus className="size-4" />} onClick={() => setPainelAberto("novo")}>
          Novo usuário
        </ButtonPrimary>
      </div>

      <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-neutro-border bg-white">
        <div className="flex w-full items-start gap-4 border-b border-neutro-border bg-[#f8fafc] px-6 py-3.5 text-legenda leading-legenda text-sidebar-muted-2">
          <p className="flex-1">Nome</p>
          <p className="w-60 shrink-0">E-mail</p>
          <p className="w-45 shrink-0">Perfil de Acesso</p>
          <p className="w-30 shrink-0">Status</p>
          <p className="w-20 shrink-0 text-center">Ações</p>
        </div>
        {usuariosDaPagina.map((u, i) => (
          <RowUsuario
            key={u.id}
            usuario={u}
            onEdit={setPainelAberto}
            className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}
          />
        ))}
        <div className="flex w-full items-center justify-between bg-white px-6 py-3.5">
          <p className="text-legenda leading-legenda text-neutro-muted">
            Exibindo {usuariosDaPagina.length} de {usuarios.length} usuários
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="rounded border border-neutro-border px-3 py-1.5 text-caption leading-caption text-sidebar-muted-2 disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {painelAberto && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30"
          onClick={() => setPainelAberto(null)}
        >
          <div className="h-full w-[420px]" onClick={(e) => e.stopPropagation()}>
            <PanelEditarUsuario
              usuario={usuarioEmEdicao}
              onClose={() => setPainelAberto(null)}
              onCancel={() => setPainelAberto(null)}
              onSubmit={handleSalvar}
            />
          </div>
        </div>
      )}
    </>
  );
}
