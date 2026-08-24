"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardLoginForm } from "@/components/design-system/Cards";
import { PanelBoasVindasLogin } from "@/components/design-system/Panels";
import { useAuth } from "@/lib/auth";

/**
 * Tela Login (Figma: frame "login-mentoai", 65:501) — feature F01, issue
 * #60. Reaproveita `Card/Login-Form` e `Panel/Boas-Vindas-Login`, já
 * portados no design system, direto — essa página só monta o layout de
 * duas colunas e conecta ao `useAuth()` mockado (ver `src/lib/auth.tsx`).
 *
 * Os dois blobs decorativos do painel navy no Figma (`decor-light-bg`) não
 * foram reproduzidos — são puramente decorativos e os assets exportados
 * não puderam ser baixados neste ambiente (mesma limitação de rede
 * documentada no README pra logo/avatar/ícones).
 */
export default function LoginPage() {
  const { usuario, carregando, login } = useAuth();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!carregando && usuario) router.replace("/clientes");
  }, [carregando, usuario, router]);

  async function handleSubmit({ email, senha }: { email: string; senha: string }) {
    setErro(null);
    setEnviando(true);
    const resultado = await login(email, senha);
    setEnviando(false);
    if (resultado.ok) {
      router.replace("/clientes");
    } else {
      setErro(resultado.erro);
    }
  }

  // Evita mostrar o formulário de login por um instante antes do redirect,
  // tanto na checagem inicial de sessão quanto quando já está autenticado.
  if (carregando || usuario) return null;

  return (
    <div className="flex min-h-screen w-full items-stretch" data-node-id="65:501" data-name="login-mentoai">
      <div className="flex flex-1 flex-col items-start justify-center gap-10 bg-navy p-20">
        <PanelBoasVindasLogin />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-neutro-background p-10">
        <CardLoginForm onSubmit={handleSubmit} loading={enviando} className="w-full max-w-[420px]" />
        {erro && <p className="text-caption leading-caption text-sinal-risco-churn">{erro}</p>}
        <p className="text-caption leading-caption text-neutro-muted">
          Ambiente de demonstração — qualquer e-mail e senha entram. Use um e-mail com
          &quot;diretor&quot; (ex.: diretor@mentoai.com) pra ver a sidebar com a seção Administração.
        </p>
      </div>
    </div>
  );
}
