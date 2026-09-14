"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Sessao } from "@/types/api";
import { autenticar } from "@/services/auth.service";
import {
  lerSessao,
  removerSessao,
  salvarSessao,
  SESSION_CLEARED_EVENT,
  SESSION_STORAGE_KEY,
} from "@/lib/session";

/** Estado da sessão JWT, persistido em `localStorage` e sincronizado entre abas. */

interface AuthContextValue {
  usuario: Sessao | null;
  /** true até o primeiro check de sessão (localStorage) no mount terminar. */
  carregando: boolean;
  login: (email: string, senha: string) => Promise<{ ok: true } | { ok: false; erro: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    queueMicrotask(() => {
      if (!ativo) return;
      setUsuario(lerSessao());
      setCarregando(false);
    });

    const sincronizar = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== SESSION_STORAGE_KEY) return;
      setUsuario(lerSessao());
    };
    window.addEventListener("storage", sincronizar);
    window.addEventListener(SESSION_CLEARED_EVENT, sincronizar);
    return () => {
      ativo = false;
      window.removeEventListener("storage", sincronizar);
      window.removeEventListener(SESSION_CLEARED_EVENT, sincronizar);
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const sessao = await autenticar(email, senha);
      salvarSessao(sessao);
      setUsuario(sessao);
    } catch (err) {
      const erro = err instanceof Error ? err.message : "Não foi possível autenticar.";
      return { ok: false as const, erro };
    }

    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    removerSessao();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  return ctx;
}
