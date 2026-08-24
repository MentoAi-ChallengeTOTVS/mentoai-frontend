"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/design-system/Sidebar";
import { useAuth } from "@/lib/auth";

/**
 * Shell compartilhado pelas telas autenticadas (Clientes, Dashboard,
 * Reuniões, Alertas, Copiloto, Usuários) — Sidebar fixa à esquerda +
 * wrapper de conteúdo com o padding/gap do frame "main-content" do Figma.
 *
 * Desde a issue #60 (Login/Estado de sessão), esse layout é o ponto que
 * protege as rotas autenticadas: sem usuário na sessão (`useAuth()`),
 * redireciona pra `/login`. `perfil`/`userName` agora vêm da sessão real
 * (mockada, ver `src/lib/auth.tsx`) em vez do usuário fixo de exemplo do
 * Figma usado antes de #60 existir.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();

  useEffect(() => {
    if (!carregando && !usuario) router.replace("/login");
  }, [carregando, usuario, router]);

  // Evita mostrar a tela protegida por um instante antes do redirect.
  if (carregando || !usuario) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen w-full items-stretch bg-neutro-background">
      <Sidebar
        activeHref={pathname}
        perfil={usuario.perfil}
        userName={usuario.nome}
        onLogout={handleLogout}
      />
      <main className="flex min-w-0 flex-1 flex-col items-start gap-6 p-8">{children}</main>
    </div>
  );
}
