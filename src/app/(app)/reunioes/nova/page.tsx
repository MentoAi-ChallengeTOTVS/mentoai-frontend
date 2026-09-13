import { listarClientes } from "@/services/clientes.service";
import { NovaReuniaoForm } from "./NovaReuniaoForm";

/** A lista inicial usa a configuração SSR; o upload é feito pelo navegador. */
export default async function NovaReuniaoPage() {
  const clientes = await listarClientes();
  return <NovaReuniaoForm clientes={clientes} />;
}
