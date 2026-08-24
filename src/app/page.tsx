"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Raiz do app — desde a issue #60, só redireciona: pra `/clientes` se
 * autenticado, pra `/login` senão. A home real fica em `/clientes` (e
 * futuramente `/dashboard`), não numa página própria.
 */
export default function Home() {
  const router = useRouter();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (carregando) return;
    router.replace(usuario ? "/clientes" : "/login");
  }, [usuario, carregando, router]);

  return null;
}
