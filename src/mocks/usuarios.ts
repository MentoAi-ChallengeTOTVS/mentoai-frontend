import type { Usuario } from "@/types/domain";

/**
 * Dados fictícios de usuários, usados enquanto não há backend conectado
 * (mesmo padrão de `src/mocks/clientes.ts`). Os 5 primeiros batem com os
 * nomes de exemplo do próprio Figma (frame "admin-usuarios-mentoai").
 */
export const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nome: "Fernanda Costa", email: "fernanda@mentoai.com", perfil: "DIRETOR_COMERCIAL", ativo: true, criacao: "2026-01-10T09:00:00Z", atualizacao: "2026-01-10T09:00:00Z" },
  { id: 2, nome: "Carlos Mendes", email: "carlos.mendes@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-01-15T09:00:00Z", atualizacao: "2026-01-15T09:00:00Z" },
  { id: 3, nome: "Ana Beatriz Silva", email: "ana.silva@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-02-03T09:00:00Z", atualizacao: "2026-02-03T09:00:00Z" },
  { id: 4, nome: "Rafael Oliveira", email: "rafael.oliveira@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: false, criacao: "2026-02-20T09:00:00Z", atualizacao: "2026-06-01T09:00:00Z" },
  { id: 5, nome: "Juliana Santos", email: "juliana.santos@mentoai.com", perfil: "DIRETOR_COMERCIAL", ativo: true, criacao: "2026-03-05T09:00:00Z", atualizacao: "2026-03-05T09:00:00Z" },
  { id: 6, nome: "Bruno Almeida", email: "bruno.almeida@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-03-18T09:00:00Z", atualizacao: "2026-03-18T09:00:00Z" },
  { id: 7, nome: "Camila Rocha", email: "camila.rocha@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-04-02T09:00:00Z", atualizacao: "2026-04-02T09:00:00Z" },
  { id: 8, nome: "Diego Fernandes", email: "diego.fernandes@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: false, criacao: "2026-04-10T09:00:00Z", atualizacao: "2026-07-12T09:00:00Z" },
  { id: 9, nome: "Larissa Martins", email: "larissa.martins@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-04-25T09:00:00Z", atualizacao: "2026-04-25T09:00:00Z" },
  { id: 10, nome: "Eduardo Barros", email: "eduardo.barros@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-05-08T09:00:00Z", atualizacao: "2026-05-08T09:00:00Z" },
  { id: 11, nome: "Patrícia Nunes", email: "patricia.nunes@mentoai.com", perfil: "DIRETOR_COMERCIAL", ativo: true, criacao: "2026-05-19T09:00:00Z", atualizacao: "2026-05-19T09:00:00Z" },
  { id: 12, nome: "Thiago Pereira", email: "thiago.pereira@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-06-14T09:00:00Z", atualizacao: "2026-06-14T09:00:00Z" },
  { id: 13, nome: "Vanessa Lima", email: "vanessa.lima@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: false, criacao: "2026-06-30T09:00:00Z", atualizacao: "2026-08-01T09:00:00Z" },
  { id: 14, nome: "Gustavo Ramos", email: "gustavo.ramos@mentoai.com", perfil: "EXECUTIVO_COMERCIAL", ativo: true, criacao: "2026-07-22T09:00:00Z", atualizacao: "2026-07-22T09:00:00Z" },
];
