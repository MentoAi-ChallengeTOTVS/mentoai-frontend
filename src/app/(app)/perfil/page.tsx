"use client";

import { useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/design-system/Button";
import { useAuth } from "@/lib/auth";

/**
 * Meu Perfil — parte do escopo da issue #60 ("Tela de Login, Estado de
 * sessão, Meu Perfil, Logout"). Diferente de Login, essa sub-tela NÃO tem
 * frame equivalente no arquivo do Figma (conferido: o único "perfil" lá é
 * `perfil-cliente-mentoai`, que é a Visão 360° do CLIENTE — feature F06,
 * issue #86 — não a página de conta do usuário logado). Layout montado do
 * zero seguindo o Manual de Identidade Visual e os padrões de formulário já
 * usados em `Panels.tsx` (mesmos tokens de cor/tipografia, mesmo estilo de
 * campo), sem uma referência visual pra bater 1:1. Revisar com o time se
 * quiserem desenhar essa tela no Figma depois.
 */

const PERFIL_LABEL: Record<string, string> = {
  EXECUTIVO_COMERCIAL: "Executivo Comercial",
  DIRETOR_COMERCIAL: "Diretor Comercial",
};

export default function PerfilPage() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");

  if (!usuario) return null; // guardado pelo (app)/layout.tsx, mas o TS não sabe disso

  function handleSalvar() {
    atualizarUsuario({ nome, email });
    setEditando(false);
  }

  function handleCancelar() {
    setNome(usuario!.nome);
    setEmail(usuario!.email);
    setEditando(false);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const iniciais = usuario.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <>
      <div className="flex w-full flex-col items-start gap-1">
        <p className="text-titulo leading-titulo font-medium text-navy">Meu Perfil</p>
        <p className="text-legenda leading-legenda text-sidebar-muted-2">
          Suas informações de acesso à plataforma
        </p>
      </div>

      <div className="flex w-full max-w-[520px] flex-col items-start gap-6 rounded-lg border border-neutro-border bg-white p-8">
        <div className="flex w-full items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-menta-clara text-xl font-medium text-navy">
            {iniciais}
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <p className="text-subtitulo leading-subtitulo font-medium text-navy">{usuario.nome}</p>
            <span className="w-fit rounded bg-menta-suave px-2 py-0.5 text-caption leading-caption text-menta">
              {PERFIL_LABEL[usuario.perfil]}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-neutro-border" />

        {editando ? (
          <div className="flex w-full flex-col items-start gap-4">
            <label className="flex w-full flex-col items-start gap-1.5">
              <span className="text-[12px] leading-4 text-navy">Nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo text-neutro-dark focus:outline-none focus:ring-2 focus:ring-menta-clara"
              />
            </label>
            <label className="flex w-full flex-col items-start gap-1.5">
              <span className="text-[12px] leading-4 text-navy">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-neutro-border px-3 text-corpo text-neutro-dark focus:outline-none focus:ring-2 focus:ring-menta-clara"
              />
            </label>
            <div className="flex w-full items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelar}
                className="flex h-10 flex-1 items-center justify-center rounded-md border border-neutro-border text-corpo text-sidebar-muted-2"
              >
                Cancelar
              </button>
              <ButtonPrimary className="flex-1 justify-center" onClick={handleSalvar}>
                Salvar
              </ButtonPrimary>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col gap-1">
              <span className="text-legenda text-neutro-muted">Nome</span>
              <span className="text-corpo text-neutro-dark">{usuario.nome}</span>
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className="text-legenda text-neutro-muted">E-mail</span>
              <span className="text-corpo text-neutro-dark">{usuario.email}</span>
            </div>
            <ButtonPrimary icon={<Pencil className="size-4" />} onClick={() => setEditando(true)}>
              Editar informações
            </ButtonPrimary>
          </div>
        )}

        <div className="h-px w-full bg-neutro-border" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-corpo text-sinal-risco-churn"
        >
          <LogOut className="size-4" />
          Sair da conta
        </button>
      </div>
    </>
  );
}
