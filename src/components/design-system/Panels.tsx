"use client";

import { useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import clsx from "clsx";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Minus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { ButtonPrimary } from "./Button";
import { RowBuscaCliente, RowBuscaReuniao } from "./Rows";
import type { Cliente, PerfilUsuario, Reuniao, StatusProcessamento, Usuario } from "@/types/domain";

/**
 * Panels do Design System — os 5 `Panel/*` do Figma, todos encontrados como
 * instâncias dentro das telas (não têm um frame próprio tipo CARDS):
 * Cadastro-Cliente (15:233, tela Clientes), Status-Envio (19:133, tela Nova
 * Reunião), Boas-Vindas-Login (67:508, metade esquerda da tela Login),
 * Editar-Usuario (91:1167, tela Usuários), Busca-Global (127:1340, aberto
 * pelo item "Buscar" da Sidebar).
 */

// ---------- Sub-componentes internos compartilhados (Cadastro-Cliente / Editar-Usuario) ----------

function PanelHeader({ titulo, onClose }: { titulo: string; onClose?: () => void }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-subtitulo font-medium text-navy">{titulo}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutro-background"
      >
        <X className="size-3.5 text-neutro-dark" />
      </button>
    </div>
  );
}

function CampoTexto({
  label,
  className,
  ...props
}: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex w-full flex-col items-start gap-2">
      <span className="text-[12px] leading-4 text-navy">{label}</span>
      <input
        {...props}
        className={clsx(
          "h-10 w-full rounded-md border border-neutro-border px-3 text-corpo text-neutro-dark placeholder:text-sidebar-muted-2 focus:outline-none focus:ring-2 focus:ring-menta-clara",
          className
        )}
      />
    </label>
  );
}

function CampoSelect({
  label,
  options,
  className,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex w-full flex-col items-start gap-2">
      <span className="text-[12px] leading-4 text-navy">{label}</span>
      <div className="relative w-full">
        <select
          {...props}
          className={clsx(
            "h-10 w-full appearance-none rounded-md border border-neutro-border bg-white px-3 text-corpo text-navy focus:outline-none focus:ring-2 focus:ring-menta-clara",
            className
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutro-muted" />
      </div>
    </label>
  );
}

function BotaoCancelar({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex h-10 flex-1 items-center justify-center rounded-md border border-neutro-border text-corpo text-sidebar-muted-2",
        className
      )}
    >
      Cancelar
    </button>
  );
}

// ---------- Panel/Cadastro-Cliente (380px de referência, drawer à direita) ----------
// Domínio: `Cliente.porte` hoje é `string` livre (não é um enum documentado no
// diagrama de classes), mas o Figma mostra 3 opções fixas (Pequeno/Médio/
// Grande) — mantidas aqui como default configurável em vez de virar um enum
// novo no domínio sem validação do time de backend.

export interface NovoClienteInput {
  nome: string;
  segmento: string;
  porte: string;
}

/** Mesmo formato de `NovoClienteInput`, com `id` quando é uma edição. */
export type ClienteFormInput = NovoClienteInput & { id?: number };

function SeletorPorte({
  value,
  onChange,
  opcoes,
}: {
  value: string;
  onChange: (v: string) => void;
  opcoes: string[];
}) {
  return (
    <div className="flex w-full items-start gap-3">
      {opcoes.map((opt) => {
        const selecionado = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={clsx(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border px-2",
              selecionado
                ? "border-menta bg-menta-suave text-menta"
                : "border-neutro-border bg-white text-sidebar-muted-2"
            )}
          >
            <span className={clsx("size-2 rounded-full", selecionado ? "bg-menta" : "bg-sidebar-muted-2")} />
            <span className="whitespace-nowrap text-caption leading-caption">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PanelCadastroCliente({
  /**
   * Quando presente, o painel abre em modo de edição (pré-preenchido, título
   * "Editar cliente"). Reaproveitado pela tela de Clientes (issue #64) pra
   * cobrir "cadastro/edição" enquanto a tela de detalhes dedicada (issue
   * #65) não existe — ver decisão registrada em
   * `claude/decisoes_tecnicas_stack.md`.
   */
  cliente,
  segmentoOpcoes = [
    "Construção Civil",
    "Tecnologia",
    "Logística",
    "Indústria",
    "Varejo",
    "Saúde",
    "Serviços",
  ],
  porteOpcoes = ["Pequeno", "Médio", "Grande"],
  onClose,
  onCancel,
  onSubmit,
  className,
}: {
  cliente?: Cliente;
  segmentoOpcoes?: string[];
  porteOpcoes?: string[];
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: (data: ClienteFormInput) => void;
  className?: string;
}) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [segmento, setSegmento] = useState(cliente?.segmento ?? segmentoOpcoes[0] ?? "");
  const [porte, setPorte] = useState(cliente?.porte ?? porteOpcoes[1] ?? porteOpcoes[0] ?? "");

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-start gap-6 border-l border-neutro-border bg-white p-6 shadow-[-4px_0px_8px_rgba(0,0,0,0.1)]",
        className
      )}
      data-node-id="15:233"
      data-name="Panel/Cadastro-Cliente"
    >
      <PanelHeader titulo={cliente ? "Editar cliente" : "Cadastrar novo cliente"} onClose={onClose} />
      <div className="flex w-full flex-col items-start gap-4">
        <CampoTexto
          label="Nome / Razão Social"
          placeholder="Ex: Empresa Exemplo Ltda"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <CampoSelect
          label="Segmento"
          value={segmento}
          onChange={(e) => setSegmento(e.target.value)}
          options={segmentoOpcoes.map((s) => ({ value: s, label: s }))}
        />
        <div className="flex w-full flex-col items-start gap-2">
          <span className="text-[12px] leading-4 text-navy">Porte da Empresa</span>
          <SeletorPorte value={porte} onChange={setPorte} opcoes={porteOpcoes} />
        </div>
      </div>
      <div className="flex w-full items-start gap-3 pt-3">
        <BotaoCancelar onClick={onCancel} />
        <ButtonPrimary
          className="flex-1 justify-center"
          onClick={() => onSubmit?.({ id: cliente?.id, nome, segmento, porte })}
        >
          Salvar
        </ButtonPrimary>
      </div>
    </div>
  );
}

// ---------- Panel/Status-Envio (380px de referência) ----------
// Reaproveita a mesma semântica de cor por `StatusProcessamento` já adotada
// em `Badge/Status` (ver claude/adendo_identidade_visual.md item 1), só que
// no formato de chip com borda usado neste painel específico.

const STATUS_ENVIO_CONFIG: Record<
  StatusProcessamento,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDENTE: {
    label: "Pendente",
    className: "border-neutro-border bg-neutro-background text-neutro-dark",
    icon: <Minus className="size-3" />,
  },
  PROCESSANDO: {
    label: "Processando",
    className: "border-menta bg-menta-suave text-menta",
    icon: <Clock className="size-3" />,
  },
  PROCESSADA: {
    label: "Processada",
    className: "border-sinal-oportunidade bg-sinal-oportunidade/10 text-sinal-oportunidade",
    icon: <Check className="size-3" />,
  },
  ERRO: {
    label: "Erro",
    className: "border-sinal-risco-churn bg-sinal-risco-churn/10 text-sinal-risco-churn",
    icon: <AlertTriangle className="size-3" />,
  },
};

function formatEnviadoEm(iso: string) {
  const d = new Date(iso);
  const data = d.toLocaleDateString("pt-BR");
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data} às ${hora}`;
}

export function PanelStatusEnvio({
  status,
  nomeArquivo,
  tamanhoArquivo,
  progresso,
  progressoLabel = "Transcrição convertida",
  enviadoEm,
  className,
}: {
  status: StatusProcessamento;
  nomeArquivo: string;
  tamanhoArquivo: string;
  /** 0-100 — omitido esconde a barra (ex.: status ainda PENDENTE). */
  progresso?: number;
  progressoLabel?: string;
  enviadoEm: string;
  className?: string;
}) {
  const cfg = STATUS_ENVIO_CONFIG[status];
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start gap-5 rounded-lg border border-neutro-border bg-white p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.03)]",
        className
      )}
      data-node-id="19:133"
      data-name="Panel/Status-Envio"
    >
      <div className="flex w-full items-center justify-between">
        <p className="text-subtitulo font-medium text-navy">Status de Envio</p>
        <div className={clsx("flex items-center gap-1.5 rounded border px-2 py-1", cfg.className)}>
          {cfg.icon}
          <span className="whitespace-nowrap text-caption leading-caption">{cfg.label}</span>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 rounded-md bg-neutro-background p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded border border-neutro-border bg-white">
          <FileText className="size-4 text-neutro-dark" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <p className="w-full truncate text-corpo text-navy">{nomeArquivo}</p>
          <p className="text-caption leading-caption text-neutro-muted">{tamanhoArquivo}</p>
        </div>
      </div>

      {progresso !== undefined && (
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between text-caption leading-caption">
            <span className="text-neutro-muted">{progressoLabel}</span>
            <span className="text-menta">{progresso}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-menta-suave">
            <div
              className="h-full rounded-full bg-menta"
              style={{ width: `${Math.min(100, Math.max(0, progresso))}%` }}
            />
          </div>
        </div>
      )}

      <div className="h-px w-full bg-neutro-border" />

      <div className="flex w-full items-center gap-2">
        <Clock className="size-3.5 shrink-0 text-neutro-muted" />
        <p className="whitespace-nowrap text-caption leading-caption text-neutro-muted">
          Enviado em {formatEnviadoEm(enviadoEm)}
        </p>
      </div>
    </div>
  );
}

// ---------- Panel/Boas-Vindas-Login (420px de referência) ----------
// Vive sobre o fundo navy da metade esquerda da tela de Login — por isso o
// texto é branco/menta-clara direto, sem depender de um wrapper escuro
// próprio. Logo reaproveita o mesmo placeholder "M" da Sidebar (ver nota de
// assets no README) até a logo real ser exportada do Figma.

export function PanelBoasVindasLogin({
  tagline = "Inteligência comercial que transforma reuniões em resultados.",
  caption = "Copiloto comercial inteligente • by TOTVS",
  className,
}: {
  tagline?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx("flex w-full max-w-[420px] flex-col items-start gap-6", className)}
      data-node-id="67:508"
      data-name="Panel/Boas-Vindas-Login"
    >
      <div className="flex w-full items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-menta text-xl font-bold text-white">
          M
        </div>
        <p className="whitespace-nowrap text-[32px] leading-[40px] font-semibold text-white">
          Mento<span className="text-menta">AI</span>
        </p>
      </div>
      <p className="w-full text-[22px] leading-[32px] text-white">{tagline}</p>
      <p className="whitespace-nowrap text-[12px] leading-4 font-medium uppercase tracking-[0.12px] text-menta-clara">
        {caption}
      </p>
    </div>
  );
}

// ---------- Panel/Editar-Usuario (420px de referência, drawer à direita) ----------
// O recorte do Figma capturado por `get_design_context` termina no campo
// Status, sem mostrar ações de rodapé — adicionei Cancelar/Salvar mesmo
// assim (mesmo padrão do Panel/Cadastro-Cliente) porque um painel de edição
// real precisa de uma ação de salvar; se a área abaixo do fold do Figma
// tiver algo diferente, ajustar aqui depois de conferir no arquivo.

export interface EditarUsuarioInput {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  /** Vazio = manter a senha atual (regra vinda do texto de apoio do Figma). */
  senha?: string;
  ativo: boolean;
}

const PERFIL_OPCOES: { value: PerfilUsuario; label: string }[] = [
  { value: "EXECUTIVO_COMERCIAL", label: "Executivo Comercial" },
  { value: "DIRETOR_COMERCIAL", label: "Diretor Comercial" },
];

function ToggleAtivo({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "flex h-[22px] w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "justify-end bg-menta" : "justify-start bg-neutro-border"
      )}
    >
      <span className="size-[18px] rounded-full bg-white shadow" />
    </button>
  );
}

function StatusDotLabel({ ativo }: { ativo: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx("size-1.5 rounded-full", ativo ? "bg-sinal-oportunidade" : "bg-sinal-risco-churn")} />
      <span
        className={clsx(
          "text-[12px] font-medium leading-4",
          ativo ? "text-sinal-oportunidade" : "text-sinal-risco-churn"
        )}
      >
        {ativo ? "Ativo" : "Inativo"}
      </span>
    </div>
  );
}

export function PanelEditarUsuario({
  usuario,
  onClose,
  onCancel,
  onSubmit,
  className,
}: {
  usuario: Usuario;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: (data: EditarUsuarioInput) => void;
  className?: string;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [perfil, setPerfil] = useState<PerfilUsuario>(usuario.perfil);
  const [senha, setSenha] = useState("");
  const [ativo, setAtivo] = useState(usuario.ativo);

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-start gap-6 border-l border-neutro-border bg-white p-6 shadow-[-4px_0px_8px_rgba(0,0,0,0.1)]",
        className
      )}
      data-node-id="91:1167"
      data-name="Panel/Editar-Usuario"
    >
      <PanelHeader titulo="Editar usuário" onClose={onClose} />
      <div className="flex w-full flex-col items-start gap-4">
        <CampoTexto label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <CampoTexto
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CampoSelect
          label="Perfil de Acesso"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
          options={PERFIL_OPCOES}
        />
        <div className="flex w-full flex-col items-start gap-2">
          <CampoTexto
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <p className="text-caption leading-caption text-neutro-muted">
            Deixe em branco para manter a senha atual
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <span className="text-[12px] font-medium leading-4 text-neutro-muted">Status</span>
          <div className="flex items-center gap-3">
            <ToggleAtivo checked={ativo} onChange={setAtivo} />
            <StatusDotLabel ativo={ativo} />
          </div>
        </div>
      </div>
      <div className="flex w-full items-start gap-3 pt-3">
        <BotaoCancelar onClick={onCancel} />
        <ButtonPrimary
          className="flex-1 justify-center"
          onClick={() => onSubmit?.({ nome, email, perfil, senha: senha || undefined, ativo })}
        >
          Salvar
        </ButtonPrimary>
      </div>
    </div>
  );
}

// ---------- Panel/Busca-Global (480px de referência) ----------
// Reaproveita `RowBuscaCliente`/`RowBuscaReuniao` de `Rows.tsx` direto pras
// linhas de resultado, em vez de duplicar o markup.

export function PanelBuscaGlobal({
  query,
  onQueryChange,
  onClear,
  clientes,
  reunioes,
  onVerTodosClientes,
  onVerTodasReunioes,
  className,
}: {
  query: string;
  onQueryChange?: (value: string) => void;
  onClear?: () => void;
  clientes: Cliente[];
  reunioes: Reuniao[];
  onVerTodosClientes?: () => void;
  onVerTodasReunioes?: () => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex w-full flex-col items-start overflow-hidden rounded-xl border border-neutro-border bg-neutro-background shadow-[0px_12px_24px_rgba(0,0,0,0.1)]",
        className
      )}
      data-node-id="127:1340"
      data-name="Panel/Busca-Global"
    >
      <div className="flex w-full flex-col items-start gap-2 bg-navy p-4">
        <p className="pb-1 text-[11px] font-semibold uppercase leading-4 text-menta-clara">
          MentoAI Busca
        </p>
        <div className="flex w-full items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-2.5">
          <Search className="size-4 shrink-0 text-white/70" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Buscar clientes, reuniões..."
            className="flex-1 bg-transparent text-corpo text-white placeholder:text-white/50 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={onClear} aria-label="Limpar busca">
              <XCircle className="size-3 text-white/70" />
            </button>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4 bg-white p-4">
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between pb-1">
            <p className="text-[12px] font-semibold uppercase text-neutro-muted">
              Clientes ({clientes.length})
            </p>
            {clientes.length > 0 && (
              <button
                type="button"
                onClick={onVerTodosClientes}
                className="text-[11px] font-medium text-menta"
              >
                Ver todos
              </button>
            )}
          </div>
          {clientes.length === 0 ? (
            <p className="text-legenda text-neutro-muted">Nenhum cliente encontrado.</p>
          ) : (
            <div className="flex w-full flex-col gap-2">
              {clientes.map((cliente) => (
                <RowBuscaCliente key={cliente.id} cliente={cliente} />
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between pb-1">
            <p className="text-[12px] font-semibold uppercase text-neutro-muted">
              Reuniões ({reunioes.length})
            </p>
            {reunioes.length > 0 && (
              <button
                type="button"
                onClick={onVerTodasReunioes}
                className="text-[11px] font-medium text-menta"
              >
                Ver todas
              </button>
            )}
          </div>
          {reunioes.length === 0 ? (
            <p className="text-legenda text-neutro-muted">Nenhuma reunião encontrada.</p>
          ) : (
            <div className="flex w-full flex-col gap-2">
              {reunioes.map((reuniao) => (
                <RowBuscaReuniao key={reuniao.id} reuniao={reuniao} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
