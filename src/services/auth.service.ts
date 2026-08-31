import type { PerfilUsuario, Usuario } from "@/types/domain";

/**
 * Camada de serviço — bounded context Usuário e Acesso (autenticação,
 * issue #60). Extraído de `src/lib/auth.tsx` só pra ficar consistente com
 * o resto da camada de serviços (todo acesso a "dado que um dia vem do
 * backend" passa por `src/services/*`) — `AuthProvider`/`useAuth()`
 * continuam sendo a interface pública que o resto do app consome, essa
 * função é só o que fica por trás do `login()`.
 *
 * Autenticação ainda é mockada: qualquer e-mail/senha não vazios
 * autenticam, com um delay simulando rede; o perfil retornado depende do
 * e-mail conter "diretor" ou não (ver `AuthProvider` pro racional
 * completo). Trocar o corpo desta função por uma chamada real
 * (`POST /api/auth/login`, devolvendo usuário + token/cookie de sessão) é
 * a única mudança necessária pra ligar a autenticação real — o contrato
 * (`Promise<Usuario>`, lançando em caso de credenciais inválidas) já é o
 * mesmo que uma chamada de API teria.
 */

function nomeFromEmail(email: string) {
  const usuario = email.split("@")[0] ?? "Usuário";
  return usuario
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(" ");
}

/**
 * Autentica um usuário. Lança `Error` com uma mensagem amigável em caso de
 * credenciais inválidas — `AuthProvider.login()` captura isso e devolve
 * `{ ok: false, erro }` pro formulário de login exibir.
 * Endpoint esperado: `POST /api/auth/login`
 */
export async function autenticar(email: string, senha: string): Promise<Usuario> {
  if (!email.trim() || !senha.trim()) {
    throw new Error("Informe e-mail e senha.");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const perfil: PerfilUsuario = email.toLowerCase().includes("diretor")
    ? "DIRETOR_COMERCIAL"
    : "EXECUTIVO_COMERCIAL";
  const agora = new Date().toISOString();

  return {
    id: 1,
    nome: nomeFromEmail(email),
    email,
    perfil,
    ativo: true,
    criacao: agora,
    atualizacao: agora,
  };
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
