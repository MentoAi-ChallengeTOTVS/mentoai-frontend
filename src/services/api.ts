/**
 * No servidor (Server Components / SSR, dentro do container do frontend),
 * "localhost" aponta pro próprio container do frontend, não pro backend —
 * por isso usamos API_INTERNAL_URL (env var só de runtime, sem prefixo
 * NEXT_PUBLIC_, então não é "gravada" no bundle) apontando pro serviço
 * `backend` do docker-compose. No navegador, continua usando
 * NEXT_PUBLIC_API_URL (localhost:8080, que é a porta publicada no host).
 */
const API_URL = (
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL
)?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Faz uma chamada à API configurada por NEXT_PUBLIC_API_URL.
 *
 * Exemplo:
 * `chamarApi<Cliente>("/clientes/1")`
 */
export async function chamarApi<T>(
  caminho: string,
  opcoes: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("A variável NEXT_PUBLIC_API_URL não foi configurada.");
  }

  const headers = new Headers(opcoes.headers);

  if (opcoes.body && !(opcoes.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resposta = await fetch(`${API_URL}/${caminho.replace(/^\//, "")}`, {
    ...opcoes,
    headers,
  });

  const contentType = resposta.headers.get("content-type") ?? "";
  const body = resposta.status === 204
    ? undefined
    : contentType.includes("application/json")
      ? await resposta.json()
      : await resposta.text();

  if (!resposta.ok) {
    const mensagem =
      typeof body === "object" && body !== null && "message" in body
        ? String(body.message)
        : `Erro ${resposta.status} ao chamar a API.`;

    throw new ApiError(mensagem, resposta.status, body);
  }

  return body as T;
}

/**
 * Como `chamarApi`, mas devolve `null` em 404 em vez de lançar — útil pros
 * "buscar X por id" onde "não encontrado" é um resultado válido (quem chama
 * decide se isso vira `notFound()`, mensagem de erro, etc.), não uma
 * exceção a tratar em todo lugar que busca por id.
 *
 * Exemplo:
 * `chamarApiOuNull<Cliente>("/api/v1/clientes/999")` -> `null`, sem lançar.
 */
export async function chamarApiOuNull<T>(
  caminho: string,
  opcoes: RequestInit = {}
): Promise<T | null> {
  try {
    return await chamarApi<T>(caminho, opcoes);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
