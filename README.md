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

A logo da MentoAI (hoje um placeholder "M" verde) e a foto de avatar do usuário (hoje iniciais) precisam ser substituídas pelos assets reais — exportem direto do Figma (clique direito no layer → Export) e coloquem em `public/`.

O `Card/Tendencia-Sinais` é um caso à parte: no Figma ele é composto por 3 imagens SVG de sparkline exportadas (linhas estáticas). Como isso é um gráfico alimentado por dado real — varia por cliente/período, não é um ícone fixo — reconstruí como um `<svg>` gerado a partir dos pontos recebidos via prop (`buildPontos()` em `Cards.tsx`), do mesmo jeito que qualquer lib de charting faria. Não dá pra versionar "gráfico com os dados de hoje" como asset congelado.

## Nota sobre cores fora do Manual de Identidade

Ao portar os Cards, dois hex apareceram soltos (sem variável do Figma vinculada) em vários deles — `#1c3c3a` pros títulos e `#444441` pro texto de corpo — enquanto cards vizinhos no mesmo arquivo usam a variável `Neutro/Dark` (`#2c2c2a`) pros mesmos papéis. Confirmado via `get_variable_defs` que nenhum dos dois tem variável vinculada em lugar nenhum checado. Como a diferença visual é imperceptível, tratei como drift de cópia e unifiquei tudo em `Neutro/Dark` em vez de criar tokens quase-duplicados. O `Modal/Avaliar-Servico` trouxe um terceiro caso (`#1c3c2a` no título) — mesma decisão. Registrado como item 6 em `claude/adendo_identidade_visual.md` no projeto.

## Nota sobre o Panel/Editar-Usuario

O recorte que o `get_design_context` trouxe do Figma pra esse painel termina no campo Status, sem mostrar ações de rodapé (Cancelar/Salvar). Adicionei essas duas ações mesmo assim, no mesmo padrão do `Panel/Cadastro-Cliente` — um painel de edição real precisa de uma forma de salvar. Se a área abaixo do fold do Figma tiver algo diferente (outros botões, outra ordem), vale conferir no arquivo e ajustar.

## Telas implementadas

- **Clientes** (`src/app/(app)/clientes/page.tsx`) — issue [#64](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/64) (F02). Listagem paginada (`RowCliente` + `TabelaClientesCabecalho`/`Rodape`), busca por nome/segmento, cadastro e edição via `PanelCadastroCliente` (drawer). Dados de `src/mocks/clientes.ts` (24 clientes fictícios) enquanto não há backend.
  - **Gap documentado**: a issue pede "gerenciamento de status", mas `Cliente` no domínio (`src/types/domain.ts`) não tem campo de status/ativo — diferente de `Usuario`, que tem. Não inventei o campo; fica pendente de validação com o time.
  - **Decisão temporária**: a ação "Ver detalhes" do Figma abre o painel de edição (reaproveitando `PanelCadastroCliente` em modo edição, via a nova prop `cliente`), porque a tela de detalhes dedicada (issue #65) ainda não existe. Quando #65 for implementada, revisar se "Ver detalhes" deve navegar pra lá em vez de abrir o drawer.
- **Login / Estado de sessão / Meu Perfil / Logout** (`src/app/login/page.tsx`, `src/lib/auth.tsx`, `src/app/(app)/perfil/page.tsx`) — issue [#60](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/60) (F01). `src/lib/auth.tsx` é uma autenticação **mockada** (`AuthProvider`/`useAuth()`): qualquer e-mail/senha não vazios autenticam, com um delay simulando rede; o perfil vira `DIRETOR_COMERCIAL` se o e-mail contiver "diretor", senão `EXECUTIVO_COMERCIAL` (é o único jeito de ver a seção "Administração" da Sidebar sem UI extra). Sessão persiste em `localStorage`. `(app)/layout.tsx` agora protege as rotas autenticadas de verdade — sem sessão, redireciona pra `/login`; `/` só redireciona pra `/clientes` ou `/login` conforme o estado.
  - **Gap documentado**: "Meu Perfil" **não tem frame no Figma** — o único "perfil" no arquivo é `perfil-cliente-mentoai` (Visão 360° do *cliente*, feature F06/#86), não a conta do usuário logado. A tela em `(app)/perfil/page.tsx` foi montada do zero seguindo o Manual de Identidade Visual e os padrões de formulário já usados em `Panels.tsx`, sem referência visual pra bater 1:1. Vale desenhar no Figma se o time achar importante.
  - Os 2 blobs decorativos (`decor-light-bg`) do painel navy da tela de Login não foram reproduzidos — puramente decorativos, mesma limitação de rede pra baixar assets do README (seção de ícones/imagens).
- **Clientes** (`src/app/(app)/clientes/page.tsx`) — issue [#64](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/64) (F02). Listagem paginada (`RowCliente` + `TabelaClientesCabecalho`/`Rodape`), busca por nome/segmento, cadastro e edição via `PanelCadastroCliente` (drawer). Dados de `src/mocks/clientes.ts` (24 clientes fictícios) enquanto não há backend.
  - **Gap documentado**: a issue pede "gerenciamento de status", mas `Cliente` no domínio (`src/types/domain.ts`) não tem campo de status/ativo — diferente de `Usuario`, que tem. Não inventei o campo; fica pendente de validação com o time.
  - **Decisão temporária**: a ação "Ver detalhes" do Figma abre o painel de edição (reaproveitando `PanelCadastroCliente` em modo edição, via a nova prop `cliente`), porque a tela de detalhes dedicada (issue #65) ainda não existe. Quando #65 for implementada, revisar se "Ver detalhes" deve navegar pra lá em vez de abrir o drawer.
- **Shell compartilhado** (`src/app/(app)/layout.tsx`) — Sidebar + wrapper de conteúdo, reaproveitado por todas as telas autenticadas. Desde #60, `perfil`/`userName` vêm da sessão real (`useAuth()`) em vez do usuário fixo de exemplo do Figma.

**Correções feitas no design system ao construir as telas reais** (validam a tese de que só se vê certos gaps na hora de montar a tela, não no showcase isolado):
- `BadgePorte` (`TableClientes.tsx`) usava uma cor fixa pra todos os portes; o Figma real tem 3 cores diferentes por porte (Pequeno/Médio/Grande) — corrigido.
- `Sidebar` tinha `h-[900px]` fixo (herdado do tamanho do frame no Figma) — trocado por `h-screen`, senão a sidebar não esticava numa página real com viewport diferente de 900px.
- `Sidebar` ganhou `onLogout` (mostra um ícone de sair no rodapé quando presente) e o bloco de usuário virou link pra `/perfil`. O label de perfil também deixou de ser hardcoded ("Executiva Comercial" fixo pro exemplo do Figma) e passou a usar o mapeamento genérico `EXECUTIVO_COMERCIAL`/`DIRETOR_COMERCIAL` → "Executivo Comercial"/"Diretor Comercial", já que agora mostra qualquer usuário logado, não só a Fernanda Costa do mock.

## O que falta

O design system está 100% portado (ver seção acima) — todos os componentes nomeados no Figma têm equivalente em código, tipado com `src/types/domain.ts`.

Falta:

- As outras 11 telas do backlog (Usuários, Nova Reunião, Detalhe da Reunião, Perfil do Cliente, Dashboard, Alertas, Reuniões, Busca Global, Copiloto, Histórico de Análises, Sugestões Estratégicas) — que vão consumir os componentes já prontos.
- Camada de dados: hoje não há chamada a API nenhuma — tudo precisa ser conectado ao backend Java quando ele estiver pronto (ou a mocks/fixtures tipados com `src/types/domain.ts` enquanto isso, como já feito em `src/mocks/clientes.ts`).

## Observação técnica

O `create-next-app` gerou este projeto na versão mais recente do Next.js (16), que tem mudanças relevantes em relação a versões mais antigas — o arquivo `AGENTS.md` na raiz (mantido automaticamente pelo `next dev`) aponta pra documentação local em `node_modules/next/dist/docs/` pra quem for usar convenções que não foram tocadas aqui.
