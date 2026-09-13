import type { SalvarUsuarioRequest, SpringPage, UsuarioResponse } from "@/types/api";
import { chamarApi } from "./api";

export function listarUsuarios(pagina = 0, signal?: AbortSignal): Promise<SpringPage<UsuarioResponse>> {
  const params = new URLSearchParams({ page: String(pagina), size: "5", sort: "nome,asc" });
  return chamarApi<SpringPage<UsuarioResponse>>(`/api/v1/usuarios?${params}`, { cache: "no-store", signal });
}

function corpoUsuario({ nome, email, senha, perfil }: SalvarUsuarioRequest): string {
  if (!nome.trim() || !email.trim() || !senha.trim()) throw new Error("Nome, e-mail e senha são obrigatórios.");
  if (perfil !== "EXECUTIVO_COMERCIAL" && perfil !== "DIRETOR_COMERCIAL") throw new Error("Perfil inválido.");
  return JSON.stringify({ nome: nome.trim(), email: email.trim(), senha, perfil });
}

export function criarUsuario(dados: SalvarUsuarioRequest): Promise<UsuarioResponse> {
  return chamarApi<UsuarioResponse>("/api/v1/usuarios", { method: "POST", body: corpoUsuario(dados) });
}

/** PUT e PATCH confirmados no controller do backend dev; ainda ausentes na collection. */
export function atualizarUsuario(id: number, dados: SalvarUsuarioRequest): Promise<UsuarioResponse> {
  return chamarApi<UsuarioResponse>(`/api/v1/usuarios/${id}`, { method: "PUT", body: corpoUsuario(dados) });
}

export function alterarStatusUsuario(id: number, ativo: boolean): Promise<UsuarioResponse> {
  return chamarApi<UsuarioResponse>(`/api/v1/usuarios/${id}/status`, { method: "PATCH", body: JSON.stringify({ ativo }) });
}
