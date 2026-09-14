"use client";

import { useEffect, useState } from "react";
import { listarClientes } from "@/services/clientes.service";
import { NovaReuniaoForm } from "./NovaReuniaoForm";
import type { Cliente } from "@/types/domain";

/** Lista e upload são feitos no navegador para incluir o JWT da sessão. */
export default function NovaReuniaoPage() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarClientes().then(setClientes).catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os clientes."));
  }, []);

  if (erro) return <p role="alert" className="text-corpo text-sinal-risco-churn">{erro}</p>;
  if (!clientes) return <p role="status" className="text-corpo text-neutro-muted">Carregando formulário...</p>;
  return <NovaReuniaoForm clientes={clientes} />;
}
