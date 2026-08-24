import clsx from "clsx";
import {
  Clock,
  Check,
  AlertTriangle,
  Sparkle,
  Sparkles,
  CloudLightning,
  Minus,
} from "lucide-react";
import type {
  StatusProcessamento,
  TipoSinalComercial,
  PrioridadeAlerta,
} from "@/types/domain";

/**
 * Badges do Design System MentoAI — traduzidos 1:1 dos component sets do
 * Figma (`Badge/Status`, `Badge/Sinal-Neutro`, `Badge/Prioridade`,
 * `Badge/Sinal-{Concorrencia,Oportunidade,Risco-Churn}`,
 * `Badge/Gerado-por-IA`, `Badge/Status-Acesso-{Ativo,Inativo}`).
 *
 * Cada componente recebe diretamente um enum do domínio (StatusProcessamento,
 * TipoSinalComercial, PrioridadeAlerta) em vez do rótulo em português usado
 * no Figma — assim a UI nunca fica fora de sincronia com o backend.
 */

// ---------- Badge/Status (status de processamento da AnaliseIA) ----------

const STATUS_CONFIG: Record<
  StatusProcessamento,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-neutro-border text-neutro-dark",
    icon: <Minus className="size-[14px]" />,
  },
  PROCESSANDO: {
    label: "Processando",
    className: "bg-menta-suave text-menta",
    icon: <Clock className="size-[14px]" />,
  },
  PROCESSADA: {
    label: "Processada",
    className: "bg-menta text-white",
    icon: <Check className="size-[14px]" />,
  },
  ERRO: {
    label: "Erro",
    className: "bg-sinal-risco-churn text-white",
    icon: <AlertTriangle className="size-[14px]" />,
  },
};

export function BadgeStatus({
  status,
  className,
}: {
  status: StatusProcessamento;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        cfg.className,
        className
      )}
      data-node-id="93:61"
      data-name="Badge/Status"
    >
      {cfg.icon}
      <span className="text-corpo leading-corpo whitespace-nowrap">{cfg.label}</span>
    </div>
  );
}

// ---------- Badge/Sinal-* (SinalComercial) ----------
// 6 tipos sem cor fixa usam o Badge Neutro com ícone único (adendo item 5,
// decisão consciente do time); Concorrência/Oportunidade/Risco-Churn usam
// cor + ícone próprios.

const SINAL_NEUTRO_LABEL: Record<string, string> = {
  NECESSIDADE: "Necessidade",
  DOR: "Dor",
  OBJECAO: "Objeção",
  ORCAMENTO: "Orçamento",
  PRAZO: "Prazo",
  MOMENTO_CLIENTE: "Momento",
};

const SINAL_COLORIDO_CONFIG: Record<
  "CONCORRENCIA" | "OPORTUNIDADE" | "RISCO_CHURN",
  { label: string; className: string; icon: React.ReactNode }
> = {
  CONCORRENCIA: {
    label: "Concorrência",
    className: "bg-sinal-concorrencia text-white",
    icon: <CloudLightning className="size-3" />,
  },
  OPORTUNIDADE: {
    label: "Oportunidade",
    className: "bg-sinal-oportunidade text-white",
    icon: <Sparkles className="size-3" />,
  },
  RISCO_CHURN: {
    label: "Risco / Churn",
    className: "bg-sinal-risco-churn text-white",
    icon: <AlertTriangle className="size-3" />,
  },
};

export function BadgeSinalComercial({
  tipo,
  className,
}: {
  tipo: TipoSinalComercial;
  className?: string;
}) {
  if (tipo in SINAL_COLORIDO_CONFIG) {
    const cfg = SINAL_COLORIDO_CONFIG[tipo as keyof typeof SINAL_COLORIDO_CONFIG];
    return (
      <div
        className={clsx(
          "inline-flex h-6 items-center gap-1.5 rounded-xl px-2 py-1",
          cfg.className,
          className
        )}
        data-name={`Badge/Sinal-${tipo}`}
      >
        {cfg.icon}
        <span className="text-caption leading-caption whitespace-nowrap">{cfg.label}</span>
      </div>
    );
  }

  // 6 tipos neutros — ícone único (bullet), mesma cor pra todos.
  return (
    <div
      className={clsx(
        "inline-flex h-6 items-center gap-1.5 rounded-xl bg-neutro-background px-2 py-1",
        className
      )}
      data-node-id="93:808"
      data-name="Badge/Sinal-Neutro"
    >
      <span className="flex size-3 items-center justify-center">
        <span className="size-1.5 rounded-full bg-neutro-dark" />
      </span>
      <span className="text-caption leading-caption whitespace-nowrap text-neutro-dark">
        {SINAL_NEUTRO_LABEL[tipo] ?? tipo}
      </span>
    </div>
  );
}

// ---------- Badge/Prioridade (Alerta) — sem ícone, só cor (adendo item 4) ----------

const PRIORIDADE_CONFIG: Record<PrioridadeAlerta, { label: string; className: string }> = {
  BAIXA: { label: "Baixa", className: "bg-neutro-muted" },
  MEDIA: { label: "Média", className: "bg-sinal-alerta" },
  ALTA: { label: "Alta", className: "bg-sinal-risco-churn" },
};

export function BadgePrioridade({
  nivel,
  className,
}: {
  nivel: PrioridadeAlerta;
  className?: string;
}) {
  const cfg = PRIORIDADE_CONFIG[nivel];
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-2 py-[3px]",
        cfg.className,
        className
      )}
      data-node-id="97:781"
      data-name="Badge/Prioridade"
    >
      <span className="text-[11px] leading-none whitespace-nowrap text-neutro-background">
        {cfg.label}
      </span>
    </div>
  );
}

// ---------- Badge/Gerado-por-IA — exclusivo pra conteúdo gerado por IA ----------

export function BadgeGeradoPorIA({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-gerado-ia px-2 py-1",
        className
      )}
      data-node-id="36:222"
      data-name="Badge/Gerado-por-IA"
    >
      <Sparkle className="size-3 text-white" />
      <span className="text-caption leading-caption whitespace-nowrap text-white">
        Gerado por IA
      </span>
    </div>
  );
}

// ---------- Badge/Status-Acesso-{Ativo,Inativo} — Usuario.ativo ----------

export function BadgeStatusAcesso({
  ativo,
  className,
}: {
  ativo: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "inline-flex h-6 items-center gap-1.5 rounded-xl border px-2 py-1",
        ativo
          ? "border-sinal-oportunidade bg-sinal-oportunidade/[0.08] text-sinal-oportunidade"
          : "border-sinal-risco-churn bg-sinal-risco-churn/[0.08] text-sinal-risco-churn",
        className
      )}
      data-node-id={ativo ? "67:583" : "67:584"}
      data-name={ativo ? "Badge/Status-Acesso-Ativo" : "Badge/Status-Acesso-Inativo"}
    >
      <span className={clsx("size-1.5 rounded-full", ativo ? "bg-sinal-oportunidade" : "bg-sinal-risco-churn")} />
      <span className="text-caption leading-caption whitespace-nowrap">
        {ativo ? "Ativo" : "Inativo"}
      </span>
    </div>
  );
}
