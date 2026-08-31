/**
 * Camada de serviço — avaliação do produto ("Avaliar o MentoAI").
 *
 * Item extra da Sidebar, fora do backlog oficial: o modal existe no Figma
 * (`Modal/Avaliar-Servico`, 132:1489) mas **não há entidade correspondente no
 * domínio** — `src/types/domain.ts` não tem nada como `Avaliacao`. É a
 * decisão pendente 5 do `claude/roteiro_validacao_telas.md`: se o time
 * decidir que isso vira funcionalidade real e não só protótipo de
 * apresentação, o backend precisa da entidade nova (nota + comentário +
 * usuário + data) e só o corpo desta função muda.
 *
 * Enquanto isso a avaliação não é persistida em lugar nenhum — mesmo limite
 * de "sem estado global entre rotas" já documentado nas outras telas.
 */

export interface AvaliacaoInput {
  /** Nota de 1 a 5 estrelas. */
  nota: number;
  /** Comentário livre — opcional no formulário. */
  comentario: string;
}

/**
 * Envia a avaliação do usuário logado. Sem parâmetro de usuário porque não
 * há sessão real ainda — o endpoint real deduz o autor do token, mesmo
 * racional de `listarAlertas()`.
 *
 * Endpoint esperado: `POST /api/avaliacoes`
 */
export async function enviarAvaliacao({ nota, comentario }: AvaliacaoInput): Promise<void> {
  if (nota < 1 || nota > 5) {
    throw new Error("Escolha uma nota de 1 a 5 estrelas.");
  }
  void comentario;
  // Delay simulando rede, mesmo espírito de `autenticar()` em `auth.service.ts`.
  await new Promise((resolve) => setTimeout(resolve, 500));
}
