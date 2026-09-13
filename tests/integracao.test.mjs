import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
// Carrega os próprios services TS com o compilador já instalado, sem dependências de teste adicionais.
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) return load("src/" + specifier.slice(2) + ".ts");
    if (specifier.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), specifier + ".ts")));
    return require(specifier);
  };
  new Function("require", "module", "exports", code)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
process.env.API_INTERNAL_URL = "http://backend:8080";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
const perfil = load("src/services/perfilCliente.service.ts");
const usuarios = load("src/services/usuarios.service.ts");
const reunioes = load("src/services/reunioes.service.ts");
const { ApiError } = load("src/services/api.ts");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("perfil ordena reuniões, usa resumo processado e isola falhas de análise", async (t) => {
  const reunioes = [1, 4, 2, 3].map((id) => ({ id, dataReuniao: `2026-09-0${id}T10:00:00`, clienteId: 1, usuarioId: 1, duracaoMinutos: 0, criacao: "2026-09-01T10:00:00" }));
  const chamadas = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    chamadas.push(url);
    if (url.endsWith("/clientes/1")) return json({ id: 1, nome: "Cliente", status: true });
    if (url.endsWith("/clientes/1/reunioes")) return json(reunioes);
    if (url.endsWith("/reuniao/4")) return json({ message: "Falha" }, 500);
    if (url.endsWith("/reuniao/3")) return json({ statusProcessamento: "PENDENTE", resumoExecutivo: "" });
    if (url.endsWith("/reuniao/2")) return json({ statusProcessamento: "PROCESSADA", resumoExecutivo: "Resumo real" });
    return json({ message: "Não encontrada" }, 404);
  });
  const result = await perfil.buscarPerfilCliente(1);
  assert.deepEqual(result.timeline.map((x) => x.reuniao.id), [4, 3, 2, 1]);
  assert.equal(result.resumoPrincipal.texto, "Resumo real");
  assert.equal(result.resumoPrincipal.reuniaoId, 2);
  assert.equal(result.analisesIncompletas, true);
  assert.match(perfil.resumoDoItem(result.timeline[0]), /Não foi possível/);
  assert.match(perfil.resumoDoItem(result.timeline[3]), /ainda não disponível/);
  assert.equal(chamadas.length, 6);
  assert.ok(chamadas.every((url) => url.startsWith("http://backend:8080/api/v1/")));
});

test("cliente inexistente retorna null; erro de servidor não vira lista vazia", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json({ message: "Ausente" }, 404));
  assert.equal(await perfil.buscarPerfilCliente(999), null);
  globalThis.fetch.mock.mockImplementation(async () => json({ message: "Falha" }, 500));
  await assert.rejects(perfil.buscarPerfilCliente(1), (e) => e instanceof ApiError && e.status === 500);
});

test("cliente sem reuniões tem resumo vazio; mensagens de processamento são reais", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => json(url.endsWith("/reunioes") ? [] : { id: 1 }));
  const result = await perfil.buscarPerfilCliente(1);
  assert.deepEqual(result.timeline, []);
  assert.equal(result.resumoPrincipal, null);
  assert.equal(result.analisesIncompletas, false);
  assert.match(perfil.resumoDoItem({ analise: { statusProcessamento: "PROCESSANDO" } }), /em processamento/);
  assert.equal(perfil.resumoDoItem({ analise: { statusProcessamento: "ERRO", mensagemErro: "Falha informada" } }), "Falha informada");
});

test("usuários usam paginação Spring e requests separados sem campos extras", async (t) => {
  const calls = [];
  const response = { id: 15, nome: "Nome real", email: "real@example.com", perfil: "DIRETOR_COMERCIAL", ativo: true, criacao: "2026-09-13T12:00:00", atualizacao: "2026-09-13T12:00:00" };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return json(options.method ? response : { content: [response], number: 2, size: 5, totalPages: 3, totalElements: 11 }, options.method === "POST" ? 201 : 200);
  });
  const page = await usuarios.listarUsuarios(2);
  assert.equal(page.number, 2);
  assert.equal(new URL(calls[0].url).searchParams.get("sort"), "nome,asc");
  const dados = { nome: " Nome real ", email: "real@example.com", senha: "senha123", perfil: "DIRETOR_COMERCIAL", ativo: false, id: 999 };
  assert.deepEqual(await usuarios.criarUsuario(dados), response);
  assert.deepEqual(await usuarios.atualizarUsuario(15, dados), response);
  await usuarios.alterarStatusUsuario(15, false);
  assert.deepEqual(calls.slice(1).map((c) => c.options.method), ["POST", "PUT", "PATCH"]);
  assert.deepEqual(JSON.parse(calls[1].options.body), { nome: "Nome real", email: "real@example.com", senha: "senha123", perfil: "DIRETOR_COMERCIAL" });
  assert.deepEqual(JSON.parse(calls[3].options.body), { ativo: false });
  assert.throws(() => usuarios.atualizarUsuario(15, { ...dados, senha: " " }), /obrigatórios/);
});

test("conflito de usuário preserva status e mensagem de ApiError", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json({ message: "Já existe usuário com o email informado" }, 409));
  await assert.rejects(usuarios.criarUsuario({ nome: "Nome", email: "a@example.com", senha: "123", perfil: "EXECUTIVO_COMERCIAL" }),
    (e) => e instanceof ApiError && e.status === 409 && e.message.includes("email"));
});

test("upload envia arquivo real e boundary automático, preservando data local e duração zero", async (t) => {
  const response = { reuniaoId: 12, transcricaoId: 13, analiseId: 14, status: "PENDENTE" };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "http://backend:8080/api/v1/transcricoes/upload");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.has("Content-Type"), false);
    assert.ok(options.body instanceof FormData);
    assert.equal(options.body.get("usuarioId"), "1");
    assert.equal(options.body.get("clienteId"), "2");
    assert.equal(options.body.get("duracaoMinutos"), "0");
    assert.equal(options.body.get("dataReuniao"), "2026-09-13T10:30:00");
    assert.equal(await options.body.get("arquivo").text(), "Reunião com cliente");
    return json(response, 202);
  });
  assert.deepEqual(await reunioes.enviarTranscricao({ arquivo: new File(["Reunião com cliente"], "reuniao.txt"), clienteId: 2, usuarioId: 1, dataReuniao: "2026-09-13T10:30:00", duracaoMinutos: 0 }), response);
});

test("arquivo rejeita vazio, espaços, formato, UTF-8 inválido e tamanho excedido", async () => {
  for (const arquivo of [
    new File([], "vazio.txt"), new File([" \n "], "espacos.txt"), new File(["abc"], "arquivo.pdf"),
    new File([new Uint8Array([0xc3, 0x28])], "invalido.txt"),
    new File(["a".repeat(1_048_577)], "grande.txt"),
  ]) await assert.rejects(reunioes.validarArquivoTranscricao(arquivo));
  await reunioes.validarArquivoTranscricao(new File(["a".repeat(1_048_576)], "limite.TXT"));
});

test("upload propaga erros HTTP sem fabricar sucesso", async (t) => {
  const mock = t.mock.method(globalThis, "fetch");
  for (const status of [400, 404, 409, 413, 415, 500]) {
    mock.mock.mockImplementation(async () => json({ message: "Erro informado" }, status));
    await assert.rejects(reunioes.enviarTranscricao({ arquivo: new File(["abc"], "teste.txt"), clienteId: 1, usuarioId: 1, dataReuniao: "2026-09-13T10:00:00", duracaoMinutos: 1 }),
      (e) => e instanceof ApiError && e.status === status);
  }
});
