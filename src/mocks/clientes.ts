import type { Cliente } from "@/types/domain";

/**
 * Dados fictícios de clientes, usados enquanto não há backend conectado
 * (ver "Camada de dados" em claude/decisoes_tecnicas_stack.md no projeto).
 * Tipados direto com `Cliente` — quando a API existir, essa lista sai e o
 * fetch entra no lugar sem mudar o contrato usado pela tela.
 */
export const MOCK_CLIENTES: Cliente[] = [
  { id: 1, nome: "Construtora Horizonte Ltda", segmento: "Construção Civil", porte: "Grande", criacao: "2026-03-12T09:00:00Z" },
  { id: 2, nome: "FarmaTech Distribuidora", segmento: "Saúde / Farmacêutica", porte: "Médio", criacao: "2026-04-28T09:00:00Z" },
  { id: 3, nome: "Logística Expressa S.A.", segmento: "Logística", porte: "Grande", criacao: "2026-01-05T09:00:00Z" },
  { id: 4, nome: "NovaPonto Contabilidade", segmento: "Serviços Financeiros", porte: "Pequeno", criacao: "2026-06-19T09:00:00Z" },
  { id: 5, nome: "AgroVita Cooperativa", segmento: "Agronegócio", porte: "Grande", criacao: "2026-02-02T09:00:00Z" },
  { id: 6, nome: "DigitalForge Studios", segmento: "Tecnologia", porte: "Médio", criacao: "2026-07-15T09:00:00Z" },
  { id: 7, nome: "Padaria Trigo Dourado", segmento: "Varejo", porte: "Pequeno", criacao: "2026-05-03T09:00:00Z" },
  { id: 8, nome: "MetalForte Indústria", segmento: "Indústria", porte: "Grande", criacao: "2026-01-22T09:00:00Z" },
  { id: 9, nome: "Clínica Vida Plena", segmento: "Saúde", porte: "Pequeno", criacao: "2026-06-30T09:00:00Z" },
  { id: 10, nome: "TransRápido Cargas", segmento: "Logística", porte: "Médio", criacao: "2026-03-27T09:00:00Z" },
  { id: 11, nome: "Escritório Almeida & Souza", segmento: "Serviços", porte: "Pequeno", criacao: "2026-08-01T09:00:00Z" },
  { id: 12, nome: "TerraViva Agroindustrial", segmento: "Agronegócio", porte: "Médio", criacao: "2026-02-14T09:00:00Z" },
  { id: 13, nome: "ByteWave Sistemas", segmento: "Tecnologia", porte: "Pequeno", criacao: "2026-07-08T09:00:00Z" },
  { id: 14, nome: "Confecções Estrela Sul", segmento: "Varejo", porte: "Médio", criacao: "2026-04-11T09:00:00Z" },
  { id: 15, nome: "Rede Construir Materiais", segmento: "Construção Civil", porte: "Médio", criacao: "2026-05-20T09:00:00Z" },
  { id: 16, nome: "Instituto Ensinar Mais", segmento: "Educação", porte: "Pequeno", criacao: "2026-01-30T09:00:00Z" },
  { id: 17, nome: "Química Nordeste S.A.", segmento: "Indústria", porte: "Grande", criacao: "2026-06-05T09:00:00Z" },
  { id: 18, nome: "Frota Verde Transportes", segmento: "Logística", porte: "Pequeno", criacao: "2026-03-08T09:00:00Z" },
  { id: 19, nome: "Consultoria Rumo Certo", segmento: "Serviços", porte: "Médio", criacao: "2026-07-22T09:00:00Z" },
  { id: 20, nome: "SaúdeMax Diagnósticos", segmento: "Saúde", porte: "Grande", criacao: "2026-02-27T09:00:00Z" },
  { id: 21, nome: "CloudNine Tecnologia", segmento: "Tecnologia", porte: "Grande", criacao: "2026-04-04T09:00:00Z" },
  { id: 22, nome: "Sabor & Cia Alimentos", segmento: "Varejo", porte: "Pequeno", criacao: "2026-08-10T09:00:00Z" },
  { id: 23, nome: "Cooperativa Grão Fértil", segmento: "Agronegócio", porte: "Pequeno", criacao: "2026-05-15T09:00:00Z" },
  { id: 24, nome: "Engenharia Alicerce Firme", segmento: "Construção Civil", porte: "Médio", criacao: "2026-06-23T09:00:00Z" },
];
