# MentoAI — Frontend (Next.js)

Scaffold inicial do frontend do MentoAI, gerado a partir do arquivo real do Figma (`MentoAI — UI`) via Figma MCP, com fidelidade às specs (cores, tipografia, componentes) — não é uma aproximação por print.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/design-system` pra ver a vitrine dos componentes já portados.

> A fonte Inter é carregada via `next/font/google` — precisa de acesso à internet no primeiro build/dev pra baixá-la (normal em qualquer máquina com internet; só falhou no sandbox onde isso foi gerado).

## O que já está pronto

- **Setup**: Next.js 16 (App Router) + TypeScript + Tailwind v4, com os tokens do Manual de Identidade Visual configurados em `src/app/globals.css` (cores Menta/Navy/Neutro/Sinal, tipografia Inter em 5 estilos: Título, Subtítulo, Corpo, Legenda, Caption).
- **Tipos de domínio** (`src/types/domain.ts`): todas as entidades e enums do DDD (`Cliente`, `Reuniao`, `Transcricao`, `AnaliseIA`, `Insight`, `SinalComercial`, `Usuario`, `Chat`, `PerguntaChat`, `Alerta`, `AlertaUsuario`), transcritos direto do `diagrama_de_classes.png` — é o contrato que o time de backend também deve seguir.
- **`Sidebar`** (`src/components/design-system/Sidebar.tsx`): unifica `Sidebar/Main` e `Sidebar/Admin` do Figma num componente só, parametrizado por `perfil` (mostra a seção "Administração" só pra `DIRETOR_COMERCIAL`). Usa ícones do `lucide-react` no lugar dos assets exportados do Figma (ver nota abaixo).
- **Badges** (`src/components/design-system/Badges.tsx`): `BadgeStatus`, `BadgeSinalComercial` (decide sozinho entre o badge neutro e o colorido, conforme o tipo), `BadgePrioridade`, `BadgeGeradoPorIA`, `BadgeStatusAcesso` — todos recebendo os enums do domínio diretamente.
- **`ButtonPrimary`** (`src/components/design-system/Button.tsx`): botão verde-menta com ícone opcional.
- **`FilterBar` + `FilterSelect`** (`src/components/design-system/FilterBar.tsx`): barra de filtros genérica (os filtros de cada tela variam — Reuniões usa Cliente/Período/Status, Alertas vai usar Prioridade/Lido — por isso os filtros entram como children, não fixos) + campo de busca.
- **Rows** (`src/components/design-system/Rows.tsx`): `RowReuniao`, `RowUsuario`, `RowAlerta`, `RowBuscaCliente`, `RowBuscaReuniao` — todos recebendo as entidades do domínio (`Reuniao`, `Usuario`, etc.) diretamente como prop, não campos soltos.
- **Cards** (`src/components/design-system/Cards.tsx`): os 11 `Card/*` do Figma — `CardUploadTranscricao`, `CardLoginForm`, `CardKPI`, `CardSinaisRisco`, `CardOportunidades`, `CardSugestaoEstrategica` (feature F11), `CardClientesAtencao`, `CardTendenciaSinais`, `CardResumoExecutivo`, `CardHistoricoAnalises`, `CardSinaisComerciais`. Reusam os Badges/Button existentes por dentro (`BadgeGeradoPorIA`, `BadgePrioridade`, `BadgeSinalComercial`, `BadgeStatus`, `ButtonPrimary`). `CardHistoricoAnalises` recebe a `AnaliseIA` direto e deriva início/fim/duração dos campos que já existem, sem duplicar dado formatado. `CardTendenciaSinais` reconstrói o gráfico de linha como SVG gerado a partir dos dados (não como imagem estática — ver nota abaixo).
- **Panels** (`src/components/design-system/Panels.tsx`): os 5 `Panel/*` do Figma — `PanelCadastroCliente` e `PanelEditarUsuario` (drawers de formulário à direita, com campo de texto/select/toggle reutilizáveis internamente), `PanelStatusEnvio` (progresso de upload/transcrição por `StatusProcessamento`), `PanelBoasVindasLogin` (metade esquerda da tela de Login) e `PanelBuscaGlobal` (reaproveita `RowBuscaCliente`/`RowBuscaReuniao` de `Rows.tsx` direto pras linhas de resultado).
- **Timeline** (`src/components/design-system/Timeline.tsx`): `ItemTimelineReuniao` — histórico de reuniões da tela Perfil do Cliente (marcador + linha conectora + card com data/status/resumo), reaproveita `BadgeStatus`.
- **Chat** (`src/components/design-system/Chat.tsx`): `ItemConversa` (item da lista de histórico do Copiloto), `BubblePergunta` e `BubbleRespostaIa` (bolhas de pergunta/resposta — o alinhamento à esquerda/direita fica por conta de quem monta a tela).
- **Avaliação** (`src/components/design-system/Avaliacao.tsx`): `StarRating` (input de 1 a 5 estrelas, controlado) e `ModalAvaliarServico` (o item extra "Avaliar o MentoAI" da Sidebar, fora do backlog oficial).
- **Tabela de Clientes** (`src/components/design-system/TableClientes.tsx`): `RowCliente` + `TabelaClientesCabecalho` + `TabelaClientesRodape` (com paginação) — usados juntos na tela Clientes, feature F01 do Breno.

Todos os componentes com interação (`onClick`, `onChange`) são Client Components (`"use client"`) — necessário no App Router do Next.js pra qualquer handler de evento funcionar.

## Nota sobre ícones e imagens

O sandbox onde esse scaffold foi gerado não tem acesso de rede pra baixar os assets exportados do Figma (ícones em SVG, logo, foto de avatar) — as URLs que o Figma MCP retorna expiram em ~7 dias e não puderam ser baixadas aqui.

Pra resolver isso sem depender de assets frágeis, os ícones foram trocados por equivalentes do pacote `lucide-react` (os nomes das camadas no Figma — `search`, `layout-dashboard`, `users`, `calendar`, `bell`, `sparkles`, `star-icon`, `clock`, `check`, `alert-triangle` — batem exatamente com ícones do Lucide, então a troca é 1:1 visualmente). É mais fácil de manter do que gerenciar arquivos de imagem soltos.

A logo da MentoAI já usa o asset real (`public/logo-mentoai.png`, também reaproveitado como favicon/app icon em `src/app/icon.png`) — veio dos arquivos do projeto, não do Figma, já que o export do Figma esbarrava na mesma limitação de rede acima. Aparece no topo da `Sidebar` e no painel de boas-vindas do Login (`PanelBoasVindasLogin`). A foto de avatar do usuário (hoje iniciais) segue como placeholder — precisa ser substituída pelo asset real quando existir.

O `Card/Tendencia-Sinais` é um caso à parte: no Figma ele é composto por 3 imagens SVG de sparkline exportadas (linhas estáticas). Como isso é um gráfico alimentado por dado real — varia por cliente/período, não é um ícone fixo — reconstruí como um `<svg>` gerado a partir dos pontos recebidos via prop (`buildPontos()` em `Cards.tsx`), do mesmo jeito que qualquer lib de charting faria. Não dá pra versionar "gráfico com os dados de hoje" como asset congelado.

## Nota sobre cores fora do Manual de Identidade

Ao portar os Cards, dois hex apareceram soltos (sem variável do Figma vinculada) em vários deles — `#1c3c3a` pros títulos e `#444441` pro texto de corpo — enquanto cards vizinhos no mesmo arquivo usam a variável `Neutro/Dark` (`#2c2c2a`) pros mesmos papéis. Confirmado via `get_variable_defs` que nenhum dos dois tem variável vinculada em lugar nenhum checado. Como a diferença visual é imperceptível, tratei como drift de cópia e unifiquei tudo em `Neutro/Dark` em vez de criar tokens quase-duplicados. O `Modal/Avaliar-Servico` trouxe um terceiro caso (`#1c3c2a` no título) — mesma decisão. Registrado como item 6 em `claude/adendo_identidade_visual.md` no projeto.

## Nota sobre o Panel/Editar-Usuario

O recorte que o `get_design_context` trouxe do Figma pra esse painel termina no campo Status, sem mostrar ações de rodapé (Cancelar/Salvar). Adicionei essas duas ações mesmo assim, no mesmo padrão do `Panel/Cadastro-Cliente` — um painel de edição real precisa de uma forma de salvar. Se a área abaixo do fold do Figma tiver algo diferente (outros botões, outra ordem), vale conferir no arquivo e ajustar.

## Telas implementadas

- **Login / Estado de sessão / Meu Perfil / Logout** (`src/app/login/page.tsx`, `src/lib/auth.tsx`, `src/app/(app)/perfil/page.tsx`) — issue [#60](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/60) (F01). `src/lib/auth.tsx` é uma autenticação **mockada** (`AuthProvider`/`useAuth()`): qualquer e-mail/senha não vazios autenticam, com um delay simulando rede; o perfil vira `DIRETOR_COMERCIAL` se o e-mail contiver "diretor", senão `EXECUTIVO_COMERCIAL` (é o único jeito de ver a seção "Administração" da Sidebar sem UI extra). Sessão persiste em `localStorage`. `(app)/layout.tsx` agora protege as rotas autenticadas de verdade — sem sessão, redireciona pra `/login`; `/` só redireciona pra `/clientes` ou `/login` conforme o estado.
  - **Gap documentado**: "Meu Perfil" **não tem frame no Figma** — o único "perfil" no arquivo é `perfil-cliente-mentoai` (Visão 360° do *cliente*, feature F06/#86), não a conta do usuário logado. A tela em `(app)/perfil/page.tsx` foi montada do zero seguindo o Manual de Identidade Visual e os padrões de formulário já usados em `Panels.tsx`, sem referência visual pra bater 1:1. Vale desenhar no Figma se o time achar importante.
  - Os 2 blobs decorativos (`decor-light-bg`) do painel navy da tela de Login não foram reproduzidos — puramente decorativos, mesma limitação de rede pra baixar assets do README (seção de ícones/imagens).
- **Clientes** (`src/app/(app)/clientes/page.tsx`) — issue [#64](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/64) (F02). Listagem paginada (`RowCliente` + `TabelaClientesCabecalho`/`Rodape`), busca por nome/segmento, cadastro e edição via `PanelCadastroCliente` (drawer). Dados de `src/mocks/clientes.ts` (24 clientes fictícios) enquanto não há backend.
  - **Gap documentado**: a issue pede "gerenciamento de status", mas `Cliente` no domínio (`src/types/domain.ts`) não tem campo de status/ativo — diferente de `Usuario`, que tem. Não inventei o campo; fica pendente de validação com o time.
  - **Decisão temporária**: a ação "Ver detalhes" do Figma abre o painel de edição (reaproveitando `PanelCadastroCliente` em modo edição, via a nova prop `cliente`), porque a tela de detalhes dedicada (issue #65) ainda não existe. Quando #65 for implementada, revisar se "Ver detalhes" deve navegar pra lá em vez de abrir o drawer.
- **Usuários** (`src/app/(app)/usuarios/page.tsx`) — issue [#61](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/61) (F01). Listagem paginada (5 por página, como no Figma) com `RowUsuario`, cadastro e edição via `PanelEditarUsuario` (agora com `usuario` opcional — ausente = criação, mesmo padrão do `PanelCadastroCliente`). Dados de `src/mocks/usuarios.ts` (14 usuários fictícios). **Restrita ao perfil Diretor Comercial** (confirmado em `claude/roteiro_validacao_telas.md`): além da Sidebar só mostrar o item pra esse perfil, a rota em si bloqueia acesso direto por URL com uma tela de "Acesso restrito".
  - O Figma aqui não tem barra de busca no header (só o botão "Novo usuário") — não inventei uma pra manter fidelidade.
  - `table-header`/`table-footer` ficaram inline na página, não viraram componentes exportados como em `TableClientes.tsx`, porque o Figma não promoveu esses frames a componentes nomeados aqui (só `Row/Usuario` é) — diferente do caso de Clientes, onde `Table/Row-Cliente` é um componente formal.
- **Nova Reunião** (`src/app/(app)/reunioes/nova/page.tsx`) — issue [#70](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/70) (F03). Upload de transcrição (`CardUploadTranscricao`), seleção de cliente (`src/mocks/clientes.ts`) e data da reunião, envio simulado com `PanelStatusEnvio` animando Pendente → Processando (barra de progresso) → Processada — liga com BL001 (upload) e BL003/BL016 (estado assíncrono de processamento).
  - **Gap de persistência**: sem backend, o envio é só simulado em memória — a reunião criada não é adicionada à lista mockada de `/reunioes` (não há estado global entre rotas, mesmo limite já documentado em Clientes/Usuários). Por isso o fluxo termina na própria página, com um link pra "Ver todas as reuniões" em vez de redirecionar pra um registro que não existiria lá.
- **Reuniões — lista** (`src/app/(app)/reunioes/page.tsx`) — issue [#71](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/71) (F03, parte 1). Listagem paginada (8 por página, como no Figma) com `Filter-Bar` (Cliente/Período/Status + busca) e `Row/Reuniao`, cada linha navegando pro Detalhe da Reunião. Dados de `src/mocks/reunioes.ts` (24 reuniões fictícias, com `AnaliseIA`/`SinalComercial` associados).
- **Detalhe da Reunião** (`src/app/(app)/reunioes/[id]/page.tsx`) — issue #71 (parte 2). Resumo executivo (`CardResumoExecutivo`), sinais comerciais identificados (`CardSinaisComerciais`, os 9 tipos com ícone + texto) e Histórico de Análises (`CardHistoricoAnalises`) — cobre BL003/BL004/BL005. Server Component (`params` como `Promise`, convenção desta versão do Next.js); `notFound()` pra id inexistente.
  - Resumo/sinais só aparecem quando `statusProcessamento === "PROCESSADA"` — pros outros 3 estados (Pendente/Processando/Erro), a página mostra um card de estado (fila de processamento, análise em andamento, ou a `mensagemErro`) em vez de conteúdo vazio.
  - O campo "Participante" que uma versão anterior do frame no Figma tinha foi removido pelo time antes desta implementação (ver `claude/telas_breno_figma.md`) — o frame já não o inclui, e esta página também não.
  - A aba "Histórico de Análises" (BL015) é uma seção fixa na página, não uma aba alternável — replica a decisão já tomada no Figma (ver `claude/roteiro_validacao_telas.md`, decisão pendente 1).
- **Shell compartilhado** (`src/app/(app)/layout.tsx`) — Sidebar + wrapper de conteúdo, reaproveitado por todas as telas autenticadas. Desde #60, `perfil`/`userName` vêm da sessão real (`useAuth()`) em vez do usuário fixo de exemplo do Figma.

**Correções feitas no design system ao construir as telas reais** (validam a tese de que só se vê certos gaps na hora de montar a tela, não no showcase isolado):
- `BadgePorte` (`TableClientes.tsx`) usava uma cor fixa pra todos os portes; o Figma real tem 3 cores diferentes por porte (Pequeno/Médio/Grande) — corrigido.
- `Sidebar` tinha `h-[900px]` fixo (herdado do tamanho do frame no Figma) — trocado por `h-screen`, senão a sidebar não esticava numa página real com viewport diferente de 900px.
- `Sidebar` ganhou `onLogout` (mostra um ícone de sair no rodapé quando presente) e o bloco de usuário virou link pra `/perfil`. O label de perfil também deixou de ser hardcoded ("Executiva Comercial" fixo pro exemplo do Figma) e passou a usar o mapeamento genérico `EXECUTIVO_COMERCIAL`/`DIRETOR_COMERCIAL` → "Executivo Comercial"/"Diretor Comercial", já que agora mostra qualquer usuário logado, não só a Fernanda Costa do mock.
- `Sidebar`: o item ativo (`activeHref`) agora também acende pra sub-rotas (`/reunioes/nova`, `/reunioes/5`, ...), não só pro path exato — necessário assim que a primeira tela com sub-rotas (Reuniões) passou a existir.
- `RowReuniao` (`Rows.tsx`) ganhou `status` (antes fixo em `"PROCESSADA"`) e `href` opcionais — com `href`, a row inteira vira link (usado na lista de Reuniões pra navegar pro Detalhe).
- **Cuidado ao compor `Panel/Status-Envio` num flex row**: o componente já tem `w-full` na própria className base (pensado pra um wrapper de largura fixa em volta dele, não pra competir com `flex-1` de um irmão). Passar uma largura fixa (`w-[380px]`) direto no `className` do componente conflita com esse `w-full` interno e quebra o layout (o irmão flex-1 fica espremido a ~0px). Solução usada em `reunioes/nova/page.tsx`: envolver o componente num `<div className="w-[380px] shrink-0">` em vez de passar a largura pelo próprio `className`.

## O que falta

O design system está 100% portado (ver seção acima) — todos os componentes nomeados no Figma têm equivalente em código, tipado com `src/types/domain.ts`.

Falta:

- As outras 7 telas do backlog do Breno e do Pedro (Perfil do Cliente/Visão 360°, Dashboard, Alertas, Busca Global, Copiloto, Sugestões Estratégicas — Histórico de Análises já está coberto como seção dentro do Detalhe da Reunião) — que vão consumir os componentes já prontos.
- Camada de dados: hoje não há chamada a API nenhuma — tudo precisa ser conectado ao backend Java quando ele estiver pronto (ou a mocks/fixtures tipados com `src/types/domain.ts` enquanto isso, como já feito em `src/mocks/clientes.ts`, `src/mocks/usuarios.ts` e `src/mocks/reunioes.ts`).

## Observação técnica

O `create-next-app` gerou este projeto na versão mais recente do Next.js (16), que tem mudanças relevantes em relação a versões mais antigas — o arquivo `AGENTS.md` na raiz (mantido automaticamente pelo `next dev`) aponta pra documentação local em `node_modules/next/dist/docs/` pra quem for usar convenções que não foram tocadas aqui.
