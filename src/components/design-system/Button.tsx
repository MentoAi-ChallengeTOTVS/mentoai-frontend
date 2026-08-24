"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button/Primary (Figma node 15:230) — pílula verde-menta, ícone opcional +
 * label. O Figma mostra o exemplo "Novo cliente" com ícone de "+", mas o
 * componente é genérico (usado também em "Enviar avaliação", "Salvar", etc.).
 */
export function ButtonPrimary({
  children,
  icon,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "flex h-10 items-center gap-2 rounded-md bg-menta px-4 text-corpo text-white transition-opacity hover:opacity-90 disabled:opacity-50",
        className
      )}
      data-node-id="15:230"
      data-name="Button/Primary"
      {...props}
    >
      {icon && <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
