"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/design-system/Sidebar";

/**
 * Shell compartilhado pelas telas autenticadas (Clientes, Dashboard,
 * Reuniões, Alertas, Copiloto, Usuários) — Sidebar fixa à esquerda +
 * wrapper de conteúdo com o padding/gap do frame "main-content" do Figma.
 * Criado ao implementar a issue #64 (Clientes), pra não duplicar esse
 * wrapper em cada tela nova.
 *
 * `perfil`/`userName` estão fixos como o usuário de exemplo do Figma
 * (Fernanda Costa, Executiva Comercial) até a tela de Login (#60) existir
 * e o perfil real vier de uma sessão autenticada.
 *
 * `onOpenSearch`/`onOpenAvaliacao` da Sidebar ficam sem handler por
 * enquanto — Busca Global é a issue #92 (Pedro) e a Avaliação é um item
 * fora do backlog oficial; nenhum dos dois faz parte do escopo de #64.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full items-stretch bg-neutro-background">
      <Sidebar activeHref={pathname} perfil="EXECUTIVO_COMERCIAL" userName="Fernanda Costa" />
      <main className="flex min-w-0 flex-1 flex-col items-start gap-6 p-8">{children}</main>
    </div>
  );
}
