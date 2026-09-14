import { chamarApi } from "./api";

export interface CriarFeedbackInput {
  nota: number;
  comentario?: string;
  emailCopy?: string;
}

/** Envia a avaliação do usuário autenticado para `POST /api/v1/feedbacks`. */
export async function enviarFeedback({ nota, comentario, emailCopy }: CriarFeedbackInput): Promise<void> {
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new Error("Selecione uma nota de 1 a 5 estrelas.");
  }

  const comentarioNormalizado = comentario?.trim() ?? "";
  const emailCopyNormalizado = emailCopy?.trim() ?? "";
  if (comentarioNormalizado.length > 1000) {
    throw new Error("O comentário deve ter no máximo 1000 caracteres.");
  }

  await chamarApi<void>("/api/v1/feedbacks", {
    method: "POST",
    body: JSON.stringify({
      nota,
      comentario: comentarioNormalizado || null,
      emailCopy: emailCopyNormalizado || null,
    }),
  });
}
