"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/design-system/Sidebar";
import { BuscaGlobalOverlay } from "@/components/design-system/BuscaGlobalOverlay";
import { AvaliacaoOverlay } from "@/components/design-system/AvaliacaoOverlay";
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
 *
 * Responsivo (25/08/2026): abaixo de `lg` (1024px) a Sidebar vira um
 * painel off-canvas (ver `Sidebar.tsx`) — esse layout guarda o estado de
 * aberto/fechado (`menuAberto`) e renderiza o header mobile com o botão de
 * hambúrguer que abre o painel (some em `lg:hidden`, já que em telas
 * grandes a Sidebar fica sempre visível como antes).
 *
 * Os dois overlays da Sidebar moram aqui pelo mesmo motivo — nenhum dos dois
 * é rota, e os dois podem abrir de qualquer tela autenticada:
 * - Busca Global (26/08/2026, issue #92): `BuscaGlobalOverlay.tsx`.
 * - Avaliar o MentoAI (item extra, fora do backlog): `AvaliacaoOverlay.tsx`.
 * Em ambos os casos a Sidebar já esperava a prop (`onOpenSearch`,
 * `onOpenAvaliacao`) desde o port do design system, sem ninguém passando —
 * os dois itens eram cliques mortos até serem ligados aqui.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [avaliacaoAberta, setAvaliacaoAberta] = useState(false);

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
        onOpenSearch={() => {
          // Fecha o menu mobile junto: no celular a Sidebar cobre a tela
          // inteira e o painel de busca abriria atrás dela.
          setMenuAberto(false);
          setBuscaAberta(true);
        }}
        onOpenAvaliacao={() => {
          setMenuAberto(false);
          setAvaliacaoAberta(true);
        }}
        mobileOpen={menuAberto}
        onMobileClose={() => setMenuAberto(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col items-stretch">
        <header className="flex items-center gap-3 border-b border-neutro-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-neutro-dark hover:bg-neutro-background"
          >
            <Menu className="size-5" />
          </button>
          <Image src="/logo-mentoai.png" alt="" width={24} height={24} className="size-6 shrink-0" />
          <p className="text-corpo font-medium text-navy">MentoAI</p>
        </header>
        <main className="flex min-w-0 flex-1 flex-col items-start gap-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      {buscaAberta && <BuscaGlobalOverlay onClose={() => setBuscaAberta(false)} />}
      {avaliacaoAberta && <AvaliacaoOverlay onClose={() => setAvaliacaoAberta(false)} />}
    </div>
  );
}
