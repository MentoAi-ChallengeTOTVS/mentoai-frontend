import type { AuthRequest, AuthResponse, Sessao } from "@/types/api";
import { criarSessao } from "@/lib/session";
import { ApiError, chamarApi } from "./api";

/** Serviço de autenticação do bounded context Usuário e Acesso. */

/**
 * Autentica um usuário. Lança `Error` com uma mensagem amigável em caso de
 * credenciais inválidas — `AuthProvider.login()` captura isso e devolve
 * `{ ok: false, erro }` pro formulário de login exibir.
 * Endpoint: `POST /api/v1/auth/login`
 */
export async function autenticar(email: string, senha: string): Promise<Sessao> {
  const dados: AuthRequest = { email: email.trim(), senha };
  if (!dados.email || !dados.senha.trim()) throw new Error("Informe e-mail e senha.");

  try {
    const response = await chamarApi<AuthResponse>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify(dados) },
      false
    );
    return criarSessao(response);
  } catch (erro) {
    if (erro instanceof ApiError && (erro.status === 401 || erro.status === 403)) {
      throw new Error("E-mail ou senha inválidos.");
    }
    throw erro;
  }
}

/**
 * Solicita o link de redefinição de senha (tela `/esqueci-senha`, linkada
 * pelo "Esqueci minha senha" do `Card/Login-Form`).
 *
 * Não devolve se o e-mail existe ou não, de propósito: um endpoint de
 * recuperação que responde diferente pra e-mail cadastrado e não cadastrado
 * vira um enumerador de contas. A tela mostra a mesma mensagem nos dois
 * casos, e o backend real deve manter esse comportamento.
 *
 * Endpoint esperado: `POST /api/auth/esqueci-senha`
 */
export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  if (!email.trim()) {
    throw new Error("Informe o e-mail da sua conta.");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
}
