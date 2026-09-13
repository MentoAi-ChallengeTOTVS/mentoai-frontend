import { UsuariosPageClient } from "./UsuariosPageClient";

/** A sessão atual só existe no navegador; o guard precede a busca de usuários. */
export default function UsuariosPage() {
  return <UsuariosPageClient />;
}
