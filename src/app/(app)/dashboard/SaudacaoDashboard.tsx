"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Canto superior direito do Dashboard: "Bom dia, Fernanda" + o mês corrente.
 *
 * É o único pedaço da tela que não é render puro de dado do serviço — depende
 * da sessão (`useAuth`, que só existe no client) e do relógio do usuário. Por
 * isso fica isolado num Client Component pequeno em vez de transformar a
 * página inteira em client, mesmo padrão de `SugestoesEstrategicas` no Perfil
 * do Cliente.
 *
 * O relógio só é lido depois da hidratação: o horário de quem renderiza no
 * servidor (ou, como esta rota é estática, o horário do build) e o de quem
 * abre a página podem cair em faixas diferentes, e renderizar isso direto
 * daria erro de hidratação. `useSyncExternalStore` é a forma de saber "já
 * montei no cliente?" sem `setState` dentro de `useEffect` (que o lint do
 * projeto barra, com razão — causa render em cascata).
 */
const assinarNada = () => () => {};
const montadoNoCliente = () => true;
const aindaNoServidor = () => false;

function saudacaoPara(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function SaudacaoDashboard() {
  const { usuario } = useAuth();
  const montado = useSyncExternalStore(assinarNada, montadoNoCliente, aindaNoServidor);

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";
  const agora = montado ? new Date() : null;

  return (
    <div className="flex flex-col items-start gap-0.5 sm:items-end">
      <p className="text-subtitulo leading-subtitulo font-medium text-navy">
        {agora ? `${saudacaoPara(agora.getHours())}, ${primeiroNome}` : `Olá, ${primeiroNome}`}
      </p>
      {/* `first-letter:uppercase` porque o pt-BR devolve o mês em minúscula ("agosto 2026"). */}
      <p className="min-h-4 text-legenda leading-legenda text-neutro-muted first-letter:uppercase">
        {agora
          ? agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(" de ", " ")
          : ""}
      </p>
    </div>
  );
}
