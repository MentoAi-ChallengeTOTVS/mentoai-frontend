import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { BadgePorte } from "@/components/design-system/TableClientes";
import { BadgeGeradoPorIA } from "@/components/design-system/Badges";
import { CardSinaisRisco, CardOportunidades } from "@/components/design-system/Cards";
import { ItemTimelineReuniao } from "@/components/design-system/Timeline";
import { buscarPerfilCliente } from "@/services/perfilCliente.service";
import { SugestoesEstrategicas } from "./SugestoesEstrategicas";

/**
 * Tela Perfil do Cliente / Visão 360° do Cliente (Figma: frame
 * "perfil-cliente-mentoai", 44:326) — features F02/F06, issues #65
 * ("estrutura da tela de detalhes do cliente") e #86 ("Visão 360° do
 * Cliente — histórico + IA"). As duas issues mapeiam pro mesmo frame no
 * Figma, então viraram uma única página aqui.
 *
 * Server Component (sem "use client") — a página só lê/deriva dados de
 * forma assíncrona; a única parte interativa (accordion de Sugestões
 * Estratégicas, com ação de gerar/atualizar — issue #101) foi isolada em
 * `SugestoesEstrategicas.tsx`. `params` é `Promise`, mesmo padrão de
 * `reunioes/[id]/page.tsx`.
 *
 * "Iniciar conversa no Copiloto" aponta pra `/copiloto`, tela do Copiloto
 * (feature F04) que ainda não existe nesta base — fora do escopo do Breno.
 *
 * Todos os dados vêm de uma chamada só a `perfilClienteService.
 * buscarPerfilCliente(clienteId)` — ver as notas lá sobre a diferença entre
 * os números reais derivados do mock e os números ilustrativos do Figma, e
 * sobre o gap de domínio de "Resumo Estratégico"/"Sugestões Estratégicas".
 */

export default async function PerfilClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clienteId = Number(id);
  const perfil = await buscarPerfilCliente(clienteId);

  if (!perfil) notFound();

  const { cliente, timeline, riscos, oportunidades, resumoEstrategico, sugestoesIniciais } = perfil;

  return (
    <>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex items-center gap-1.5 text-legenda leading-legenda text-neutro-muted">
          <Link href="/clientes" className="hover:text-navy">
            Clientes
          </Link>
          <ChevronRight className="size-2.5" />
          <span className="text-navy">{cliente.nome}</span>
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-titulo leading-titulo font-medium text-navy">{cliente.nome}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-legenda leading-legenda text-neutro-muted">
              Segmento: <span className="font-medium text-neutro-dark">{cliente.segmento}</span>
            </p>
            <span className="text-legenda text-neutro-muted">•</span>
            <BadgePorte porte={cliente.porte} />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col items-start gap-5">
          <p className="text-subtitulo font-medium text-neutro-dark">Linha do Tempo de Reuniões</p>

          {timeline.length === 0 ? (
            <div className="flex w-full items-center rounded-lg border border-dashed border-neutro-border bg-white p-6">
              <p className="text-corpo text-neutro-muted">
                Esse cliente ainda não tem nenhuma reunião registrada.
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start">
              {timeline.map((item, i) => (
                <ItemTimelineReuniao
                  key={item.reuniao.id}
                  reuniao={item.reuniao}
                  resumo={item.resumo}
                  status={item.status}
                  ultimo={i === timeline.length - 1}
                />
              ))}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="flex w-full items-start pl-8">
              <Link href="/reunioes" className="text-corpo font-medium text-menta">
                Ver todas as reuniões
              </Link>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-4 lg:w-[480px] lg:shrink-0">
          <CardSinaisRisco
            quantidade={riscos.length}
            itens={riscos.map((s) => s.descricao)}
          />
          <CardOportunidades
            quantidade={oportunidades.length}
            itens={oportunidades.map((s) => s.descricao)}
          />

          <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6">
            <div className="flex w-full items-center gap-2">
              <p className="text-subtitulo font-medium text-neutro-dark">Resumo Estratégico</p>
              <BadgeGeradoPorIA />
            </div>
            <p className="w-full text-corpo text-neutro-dark">{resumoEstrategico}</p>
          </div>

          <Link
            href="/copiloto"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-menta px-4 text-corpo font-medium text-white"
          >
            <Sparkles className="size-4" />
            Iniciar conversa no Copiloto
          </Link>
        </div>
      </div>

      <SugestoesEstrategicas
        clienteId={clienteId}
        nomeCliente={cliente.nome}
        itensIniciais={sugestoesIniciais}
      />
    </>
  );
}
