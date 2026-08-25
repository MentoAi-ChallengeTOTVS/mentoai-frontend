"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Usuario } from "@/types/domain";
import { autenticar } from "@/services/auth.service";

/**
 * Autenticação — issue #60 ("Estado de sessão"). Não existe backend de
 * autenticação ainda, então o login aqui é mockado: qualquer e-mail/senha
 * não vazios autenticam (com um delay artificial simulando a chamada de
 * rede). O perfil retornado depende do e-mail digitado — contém "diretor"
 * vira DIRETOR_COMERCIAL, senão EXECUTIVO_COMERCIAL — só pra dar um jeito
 * de testar as duas variantes da Sidebar (a seção "Administração" só
 * aparece pro Diretor) sem precisar de UI extra pra trocar perfil.
 *
 * Sessão persiste em localStorage (`mentoai_sessao`) pra sobreviver a um
 * refresh de página. Trocar por sessão real (cookie/JWT vindo da API) assim
 * que o backend de autenticação existir — a interface de `useAuth()`
 * (usuario/login/logout) não deve precisar mudar pros componentes que já
 * consomem o context.
 */

const STORAGE_KEY = "mentoai_sessao";

interface AuthContextValue {
  usuario: Usuario | null;
  /** true até o primeiro check de sessão (localStorage) no mount terminar. */
  carregando: boolean;
  login: (email: string, senha: string) => Promise<{ ok: true } | { ok: false; erro: string }>;
  logout: () => void;
  atualizarUsuario: (dados: Partial<Pick<Usuario, "nome" | "email">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUsuario(JSON.parse(raw));
    } catch {
      // localStorage indisponível (ex.: modo privado) — segue deslogado
    } finally {
      setCarregando(false);
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    let novoUsuario: Usuario;
    try {
      novoUsuario = await autenticar(email, senha);
    } catch (err) {
      const erro = err instanceof Error ? err.message : "Não foi possível autenticar.";
      return { ok: false as const, erro };
    }

    setUsuario(novoUsuario);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(novoUsuario));
    } catch {
      // segue autenticado só nesta aba, sem persistir entre refreshes
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // nada a fazer — não havia nada persistido mesmo
    }
  }, []);

  const atualizarUsuario = useCallback((dados: Partial<Pick<Usuario, "nome" | "email">>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const atualizado: Usuario = { ...prev, ...dados, atualizacao: new Date().toISOString() };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      } catch {
        // segue com o estado em memória mesmo sem persistir
      }
      return atualizado;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  return ctx;
}
