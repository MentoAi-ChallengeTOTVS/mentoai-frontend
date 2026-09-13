const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
