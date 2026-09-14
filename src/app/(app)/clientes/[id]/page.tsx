import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { BadgePorte } from "@/components/design-system/TableClientes";
import { BadgeGeradoPorIA } from "@/components/design-system/Badges";
import { ItemTimelineReuniao } from "@/components/design-system/Timeline";
import { buscarPerfilCliente, resumoDoItem } from "@/services/perfilCliente.service";

export default async function PerfilClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clienteId = Number(id);
  if (!Number.isSafeInteger(clienteId) || clienteId <= 0) notFound();
  const perfil = await buscarPerfilCliente(clienteId);
  if (!perfil) notFound();
  const { cliente, timeline, resumoPrincipal, analisesIncompletas } = perfil;

  return (
    <>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex items-center gap-1.5 text-legenda text-neutro-muted">
          <Link href="/clientes" className="hover:text-navy">Clientes</Link>
          <ChevronRight className="size-2.5" />
          <span className="text-navy">{cliente.nome}</span>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-titulo leading-titulo font-medium text-navy">{cliente.nome}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-legenda text-neutro-muted">Segmento: <span className="font-medium text-neutro-dark">{cliente.segmento}</span></p>
            <BadgePorte porte={cliente.porte} />
            <span className="text-legenda text-neutro-muted">{cliente.status ? "Ativo" : "Inativo"}</span>
          </div>
        </div>
      </div>
      {analisesIncompletas && <p role="status" className="text-corpo text-sinal-alerta">Não foi possível carregar algumas análises. O histórico e o resumo podem estar incompletos.</p>}
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-5">
          <h2 className="text-subtitulo font-medium text-neutro-dark">Linha do Tempo de Reuniões</h2>
          {timeline.length === 0 ? (
            <div className="w-full rounded-lg border border-dashed border-neutro-border bg-white p-6 text-corpo text-neutro-muted">Esse cliente ainda não tem nenhuma reunião registrada.</div>
          ) : (
            <div
              className="flex w-full flex-col items-start lg:max-h-[calc(100dvh-15rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
              aria-label="Histórico de reuniões do cliente"
            >
              {timeline.map((item, i) => (
                <ItemTimelineReuniao key={item.reuniao.id} reuniao={item.reuniao} resumo={resumoDoItem(item)}
                  status={item.analise?.statusProcessamento} href={`/reunioes/${item.reuniao.id}`}
                  ultimo={i === timeline.length - 1} />
              ))}
            </div>
          )}
          {timeline.length > 0 && <Link href="/reunioes" className="pl-8 text-corpo font-medium text-menta">Ver todas as reuniões</Link>}
        </div>
        <div className="flex w-full flex-col items-start gap-4 lg:w-[480px] lg:shrink-0">
          <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-neutro-border bg-white p-6">
            <div className="flex w-full items-center gap-2">
              <h2 className="text-subtitulo font-medium text-neutro-dark">Resumo Estratégico</h2>
              {resumoPrincipal && <BadgeGeradoPorIA />}
            </div>
            <p className="w-full whitespace-pre-wrap break-words text-corpo text-neutro-dark">{resumoPrincipal?.texto ?? "Ainda não há resumo de análise processada disponível para este cliente."}</p>
            {resumoPrincipal && <Link href={`/reunioes/${resumoPrincipal.reuniaoId}`} className="text-caption text-menta">
              Resumo da reunião de {new Date(resumoPrincipal.dataReuniao).toLocaleDateString("pt-BR")}
            </Link>}
          </div>
          <Link href="/copiloto" className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-menta px-4 text-corpo font-medium text-white">
            <Sparkles className="size-4" />Iniciar conversa no Copiloto
          </Link>
        </div>
      </div>
    </>
  );
}
