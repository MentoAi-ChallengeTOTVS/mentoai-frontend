"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheckBig } from "lucide-react";
import { ButtonPrimary } from "@/components/design-system/Button";
import { PanelBoasVindasLogin } from "@/components/design-system/Panels";
import { solicitarRedefinicaoSenha } from "@/services/auth.service";

/**
 * Tela "Esqueci minha senha" — destino do link que o `Card/Login-Form` já
 * apontava desde o port do design system (`forgotPasswordHref`, default
 * `/esqueci-senha`). Até aqui a rota não existia e o link dava 404 (pendência
 * registrada no README).
 *
 * **Sem frame no Figma** (o arquivo só tem `login-mentoai`) — montada do zero
 * seguindo o Manual de Identidade Visual e reaproveitando a estrutura de duas
 * colunas e as classes de formulário do Login, pra não parecer outra
 * aplicação. Mesmo gap já documentado em "Meu Perfil" e na Fila de
 * Processamento: vale desenhar no Figma se o time achar importante.
 *
 * A mensagem de sucesso é deliberadamente a mesma pra e-mail cadastrado e não
 * cadastrado — ver o racional em `solicitarRedefinicaoSenha()`.
 */
export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await solicitarRedefinicaoSenha(email);
      setEnviado(true);
    } catch (erroEnvio) {
      setErro(
        erroEnvio instanceof Error
          ? erroEnvio.message
          : "Não foi possível enviar o link agora. Tente de novo."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-stretch lg:flex-row">
      <div className="flex flex-1 flex-col items-start justify-center gap-6 bg-navy p-6 sm:p-10 lg:gap-10 lg:p-20">
        <PanelBoasVindasLogin />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-neutro-background p-6 py-10 sm:p-10">
        <div className="flex w-full max-w-[420px] flex-col items-start gap-8 rounded-xl bg-white p-10 shadow-[0px_8px_12px_rgba(15,42,69,0.08)]">
          {enviado ? (
            <>
              <div className="flex w-full flex-col items-start gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-menta-suave">
                  <CircleCheckBig className="size-6 text-menta" />
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <p className="text-[20px] leading-[28px] font-semibold text-neutro-dark">
                    Verifique seu e-mail
                  </p>
                  <p className="text-corpo text-neutro-muted">
                    Se existir uma conta para <span className="text-neutro-dark">{email}</span>, o
                    link para redefinir a senha chega em alguns minutos. Confira também a caixa de
                    spam.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-4">
                <ButtonPrimary
                  className="w-full justify-center"
                  onClick={() => {
                    setEnviado(false);
                    setEmail("");
                  }}
                >
                  Usar outro e-mail
                </ButtonPrimary>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-[13px] leading-[18px] font-medium text-menta"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full flex-col items-start gap-2">
                <p className="text-[20px] leading-[28px] font-semibold text-neutro-dark">
                  Recuperar acesso
                </p>
                <p className="text-corpo text-neutro-muted">
                  Informe o e-mail da sua conta e enviaremos um link para criar uma senha nova.
                </p>
              </div>

              <form className="flex w-full flex-col items-center gap-4" onSubmit={handleSubmit}>
                <label className="flex w-full flex-col items-start gap-1.5">
                  <span className="text-[12px] leading-4 font-medium text-neutro-muted">E-mail</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11 w-full rounded-lg border border-neutro-border px-3 text-corpo text-neutro-dark placeholder:text-neutro-muted focus:outline-none focus:ring-2 focus:ring-menta-clara"
                  />
                </label>

                <div className="flex w-full flex-col items-center gap-4">
                  {erro && (
                    <p className="w-full text-caption leading-caption text-sinal-risco-churn">
                      {erro}
                    </p>
                  )}
                  <ButtonPrimary type="submit" disabled={enviando} className="w-full justify-center">
                    {enviando ? "Enviando..." : "Enviar link de recuperação"}
                  </ButtonPrimary>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-[13px] leading-[18px] font-medium text-menta"
                  >
                    <ArrowLeft className="size-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="max-w-[420px] text-center text-caption leading-caption text-neutro-muted">
          Ambiente de demonstração — nenhum e-mail é enviado de verdade. O envio é simulado até o
          backend existir.
        </p>
      </div>
    </div>
  );
}
