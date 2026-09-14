import type { PerfilUsuario } from "@/types/domain";
import type { AuthResponse, Sessao } from "@/types/api";

export const SESSION_STORAGE_KEY = "mentoai_sessao";
export const SESSION_CLEARED_EVENT = "mentoai:session-cleared";

const PERFIS: PerfilUsuario[] = ["EXECUTIVO_COMERCIAL", "DIRETOR_COMERCIAL"];

export function nomeFromEmail(email: string): string {
  const prefixo = email.split("@")[0] || "Usuário";
  return prefixo
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(" ");
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!value || typeof value !== "object") return false;
  const dados = value as Record<string, unknown>;
  return (
    typeof dados.token === "string" && dados.token.length > 0 &&
    typeof dados.tipo === "string" && dados.tipo.length > 0 &&
    typeof dados.email === "string" && dados.email.length > 0 &&
    typeof dados.role === "string" && PERFIS.includes(dados.role as PerfilUsuario)
  );
}

export function criarSessao(response: AuthResponse): Sessao {
  if (!isAuthResponse(response)) throw new Error("Resposta de autenticação inválida.");
  return { ...response, nome: nomeFromEmail(response.email) };
}

export function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const dados = JSON.parse(raw) as unknown;
    if (!isAuthResponse(dados)) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return { ...dados, nome: nomeFromEmail(dados.email) };
  } catch {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // localStorage indisponível
    }
    return null;
  }
}

export function salvarSessao(sessao: Sessao): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessao));
}

export function removerSessao(notificar = false): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // A sessão em memória ainda será invalidada pelo evento abaixo.
  }
  if (notificar) window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}
