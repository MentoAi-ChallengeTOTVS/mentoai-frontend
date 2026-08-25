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
- **Responsivo** de celular a desktop nas 8 telas do Breno (ver seção "Responsividade" abaixo) — sidebar vira hambúrguer, tabelas viram cards no mobile.

Todos os componentes com interação (`onClick`, `onChange`) são Client Components (`"use client"`) — necessário no App Router do Next.js pra qualquer handler de evento funcionar.

## Camada de serviços — preparado pro backend (24/08/2026)

Todas as telas passaram por uma revisão dedicada pra isolar o acesso a dado mockado atrás de uma camada de serviços (`src/services/*.service.ts`), um módulo por bounded context:

- **`clientes.service.ts`** — `listarClientes`, `buscarClientePorId`, `criarCliente`, `atualizarCliente`.
- **`usuarios.service.ts`** — `listarUsuarios`, `criarUsuario`, `atualizarUsuario`.
- **`reunioes.service.ts`** — `listarReunioesComStatus`, `contarEmProcessamento`, `buscarDetalheReuniao`, `listarFilaProcessamento`, `enviarTranscricao`.
- **`perfilCliente.service.ts`** — `buscarPerfilCliente` (agregado pra Visão 360°), `gerarSugestoesEstrategicas`.
- **`auth.service.ts`** — `autenticar` (usado por `AuthProvider.login()` em `src/lib/auth.tsx`).

Cada função é `async` e hoje só envolve os mocks de `src/mocks/*.ts` — nenhuma tela importa `@/mocks/*` diretamente mais (conferido via grep antes de fechar essa revisão). Quando o backend Java existir, **só o corpo dessas funções muda** (de `return MOCK_X` pra um `fetch` de verdade contra a API) — nenhuma tela, componente ou tipo precisa mudar, porque a assinatura (parâmetros, formato de retorno, `Promise`) já é a mesma que uma chamada real teria. Cada função tem em JSDoc o endpoint REST esperado (ex.: `GET /api/clientes/{id}`), como um contrato informal pro time de backend.

Duas decisões de formato valem registrar:

- Algumas funções devolvem um "view model" já combinado (ex.: `listarReunioesComStatus` devolve reunião + status + tipos de sinal juntos, `buscarDetalheReuniao` devolve reunião + análise + sinais numa chamada só) em vez de forçar a tela a fazer N chamadas separadas e juntar o resultado — é razoável esperar que os endpoints reais também devolvam o dado assim combinado, do jeito que qualquer API REST bem desenhada faria pra uma tela de listagem/detalhe.
- Em `reunioes.service.ts` e `SugestoesEstrategicas.tsx`, o `setTimeout` que anima Pendente → Processando → Processada (Nova Reunião) e o skeleton de carregamento (Sugestões Estratégicas) continuam no client, de propósito — são simulações de UX de um processo que no mundo real seria assíncrono de verdade (fila com polling/push, ou uma chamada de IA que demora), não uma resposta única e instantânea. Só a "borda" da chamada (o que o `POST`/`GET` devolveria no dia 1) virou função de serviço.

Consequência prática de arquitetura: toda tela com listagem/formulário que antes era só Client Component (`"use client"` no topo do arquivo) virou um par **Server Component (`page.tsx`, busca o dado inicial via `service`) + Client Component (`*Client.tsx` / `*Form.tsx`, mantém a interatividade)** — mesmo padrão que já existia em Perfil do Cliente e Detalhe da Reunião desde antes desta revisão, agora aplicado em todas as telas: `clientes/page.tsx` + `ClientesPageClient.tsx`, `usuarios/page.tsx` + `UsuariosPageClient.tsx`, `reunioes/page.tsx` + `ReunioesPageClient.tsx`, `reunioes/nova/page.tsx` + `NovaReuniaoForm.tsx`, `reunioes/fila/page.tsx` + `FilaProcessamentoClient.tsx`.

## Responsividade (25/08/2026)

Todas as 8 telas do Breno (Login, Meu Perfil, Clientes, Perfil do Cliente, Usuários, Reuniões, Nova Reunião, Detalhe da Reunião, Fila de Processamento) foram revisadas pra funcionar de celular (~375px) a desktop grande, sem depender de zoom nem de rolagem horizontal. Estratégia adotada:

- **Breakpoint estrutural único: `lg` (1024px, padrão do Tailwind)**. Abaixo disso, os layouts de duas colunas empilham em uma coluna só, e as tabelas com colunas fixas viram listas de cards. A partir de `lg`, o layout volta a ser exatamente o do Figma (nenhuma mudança visual em telas grandes — conferido lado a lado via screenshot antes/depois). Telas de tablet (768–1024px) recebem o mesmo tratamento do mobile por simplicidade, em vez de um terceiro layout intermediário.
- **Sidebar vira menu hambúrguer abaixo de `lg`** (`Sidebar.tsx`): painel `fixed` fora da tela por padrão, desliza pra dentro com um backdrop escurecido quando aberto. `AppLayout` (`src/app/(app)/layout.tsx`) ganhou um header mobile (`lg:hidden`) com o botão de abrir; clicar em qualquer item de navegação ou no bloco "Meu Perfil" fecha o painel automaticamente (via `onClick` direto nos links, não `useEffect` — evita o cascading-render que o ESLint do React acusa nesse padrão).
- **Tabelas viram cards empilhados abaixo de `lg`**: `RowCliente` (`TableClientes.tsx`), `RowUsuario` e `RowReuniao` (`Rows.tsx`) agora renderizam dois blocos — a linha de tabela original (`hidden lg:flex`) e um card compacto (`flex lg:hidden`) com os mesmos dados reorganizados verticalmente. Os cabeçalhos de coluna (`TabelaClientesCabecalho` e os equivalentes inline em Usuários/Reuniões) somem no mobile, já que não fazem sentido sem colunas.
- **`FilterBar`** (usada em Reuniões, e que o Pedro vai reaproveitar em Alertas) empilha os filtros e o campo de busca em coluna no mobile, com os filtros quebrando em duas colunas a partir de `sm` (640px) antes de virar linha única em `lg`.
- **Drawers (`PanelCadastroCliente`, `PanelEditarUsuario`)** passam de largura fixa (`w-[380px]`/`w-[420px]`) pra `w-full max-w-[Npx]` — ocupam a tela inteira no mobile (onde uma largura fixa estouraria a viewport) e mantêm a largura de referência do Figma a partir de onde já cabem. Ganharam `overflow-y-auto` como rede de segurança em telas bem baixas.
- Formulários com campos lado a lado (Nova Reunião: Cliente/Data) empilham abaixo de `sm` (640px); barras de ação com texto + botões (confirmação de envio, Sugestões Estratégicas) empilham abaixo de `sm` também.

Nenhuma mudança de dado ou de arquitetura — só CSS/layout (classes Tailwind responsivas). `Meu Perfil` não precisou de ajuste: já usava `w-full max-w-[520px]`, responsivo por natureza.

**Correção pós-entrega (25/08/2026):** o `Card/Historico-Analises` (dentro do Detalhe da Reunião) tinha ficado de fora da revisão inicial — as 4 colunas (Início/Fim/Duração/Status) usavam `whitespace-nowrap` numa linha `flex justify-between` sem empilhar, causando rolagem horizontal no card em telas estreitas. Corrigido pra virar um grid 2×2 abaixo de `sm` (640px) e voltar a uma linha só a partir daí — mesmo racional dos outros ajustes desta seção. Varredura com Playwright em 375/390/414/430/820px confirmando zero overflow horizontal em todas as 8 telas depois da correção.

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
  - **Atualizado em 24/08/2026**: agora que a tela de detalhes (issue #65, `/clientes/[id]`) existe, "Ver detalhes" navega pra lá (virou `Link`, não mais um botão que abre o drawer). Como isso tirou o único jeito de editar um cliente pela listagem, `RowCliente` ganhou um ícone de edição (`Pencil`, mesmo padrão de `Row/Usuario`) que abre `PanelCadastroCliente` em modo edição — a prop mudou de `onVerDetalhes` pra `onEditar`.
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
- **Perfil do Cliente / Visão 360°** (`src/app/(app)/clientes/[id]/page.tsx`) — issues [#65](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/65) e [#86](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/86) (F02/F06). As duas issues mapeiam pro mesmo frame no Figma (`perfil-cliente-mentoai`, node 44:326), então viraram uma única página. Linha do Tempo de Reuniões (`ItemTimelineReuniao`, reaproveitado do design system), `CardSinaisRisco`/`CardOportunidades`, card "Resumo Estratégico" e accordion "Sugestões Estratégicas" (só essa parte é Client Component, isolada em `SugestoesEstrategicas.tsx` — o resto da página é Server Component, mesmo padrão do Detalhe da Reunião). Server Component com `params` como `Promise`; `notFound()` pra cliente inexistente.
  - Agregações novas em `src/mocks/perfilCliente.ts` (não um mock de entidade nova — deriva de `MOCK_REUNIOES`/`MOCK_SINAIS`, que já existiam): `reunioesDoCliente`, `sinaisRiscoDoCliente`/`oportunidadesDoCliente` (filtram `SinalComercial` por `tipo` nas reuniões do cliente).
  - **Decisão de dado real vs. exemplo do Figma**: o Figma mostra "3 sinais de risco" e "5 oportunidades" pra Construtora Horizonte (cliente id 1) — números ilustrativos do mockup. Com os 3 registros mockados hoje pra esse cliente (reuniões 1/7/24 em `reunioes.ts`), a contagem real derivada dá **1** sinal de risco e **2** oportunidades. Optamos por manter a derivação real em vez de hardcodar os números do Figma — mesma decisão já registrada pra outras telas (preferir dado domain-accurate a bater 1:1 com o exemplo visual).
  - **Gap de domínio documentado**: "Resumo Estratégico" e "Sugestões Estratégicas" não têm entidade formal no domínio — o candidato mais próximo é `Insight` com `tipo: "ESTRATEGICO"` (por `AnaliseIA`/reunião, não um agregado por cliente), e `Insight` ainda não tem mock em lugar nenhum do projeto. Curado manualmente em `perfilCliente.ts` pra Construtora Horizonte (bate com o Figma); demais clientes caem num fallback genérico derivado da contagem de sinais.
  - O "resumo curto" de cada item da Linha do Tempo (`Item/Timeline-Reuniao` no Figma mostra uma síntese de uma linha, não o `resumoExecutivo` inteiro da `AnaliseIA`) também é curado pras 3 reuniões da Construtora Horizonte; outras reuniões caem no fallback do `resumoExecutivo` genérico já existente em `reunioes.ts`.
  - "Iniciar conversa no Copiloto" aponta pra `/copiloto` (feature F04, tela do Pedro), que ainda não existe nesta base — o link fica quebrado até essa tela ser implementada.
  - **Atualizado em 24/08/2026 — issue [#101](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/101) (F11)**: a seção "Sugestões Estratégicas" ganhou o resto do escopo que a 1ª versão não tinha (confirmado direto na issue no GitHub): botão "Gerar sugestões"/"Atualizar sugestões", skeleton de carregamento (~1,3s simulado) e um estado vazio explícito antes da 1ª geração — clientes sem conteúdo curado agora começam sem nenhuma sugestão, em vez do card genérico fixo de antes. `sugestoesEstrategicasDoCliente` virou duas funções em `perfilCliente.ts`: `sugestoesJaGeradasDoCliente` (estado inicial — curado ou `null`) e `gerarSugestoesEstrategicasDoCliente` (a "geração" em si, com um fallback que agora deriva sugestões reais dos sinais de risco/oportunidade do cliente, em vez de um texto genérico único).
- **Fila de Processamento** (`src/app/(app)/reunioes/fila/page.tsx`) — issue [#80](https://github.com/MentoAi-ChallengeTOTVS/mentoai-api/issues/80) (F04, Pipeline de Análise IA). **Sem frame no Figma** (conferido em `page1_metadata.xml` — não existe nenhum frame de fila/processamento no arquivo) — montada do zero seguindo o Manual de Identidade Visual, mesmo gap já documentado em "Meu Perfil". Escopo da issue: fila de processamento, indicadores visuais de status, atualizações periódicas simples, navegação para análises concluídas. Acessada por um link com contador no header de `/reunioes` ("Fila de processamento").
  - **Simulação client-side**: `setInterval` a cada 2,5s avança PENDENTE → PROCESSANDO → PROCESSADA (progresso +28 por tick), sem polling de verdade. Itens concluídos migram pra uma lista "Concluídas nesta sessão", cada um já linkando pro Detalhe da Reunião — cobre a "navegação para análises concluídas" do escopo.
  - **Gap conhecido, documentado explicitamente aqui**: a "conclusão" simulada nesta página é só estado local do componente — não escreve de volta em `MOCK_ANALISES` (mesmo limite de "sem estado global entre rotas" já documentado em Nova Reunião/Clientes/Usuários). Por isso, clicar num item "concluído" na fila leva pro Detalhe da Reunião, mas essa página lê o status direto do mock e ainda mostra "Processando" — a demonstração é sobre o *comportamento* da fila (indicadores, progresso, navegação), não uma alteração de dado persistente entre telas.
  - Reuniões com `statusProcessamento === "ERRO"` não entram na fila (fora do escopo de "processamento em andamento") — a página tem uma nota explicando onde encontrá-las (Detalhe da Reunião, com a `mensagemErro`).

**Correções feitas no design system ao construir as telas reais** (validam a tese de que só se vê certos gaps na hora de montar a tela, não no showcase isolado):
- `BadgePorte` (`TableClientes.tsx`) usava uma cor fixa pra todos os portes; o Figma real tem 3 cores diferentes por porte (Pequeno/Médio/Grande) — corrigido.
- `Sidebar` tinha `h-[900px]` fixo (herdado do tamanho do frame no Figma) — trocado por `h-screen`, senão a sidebar não esticava numa página real com viewport diferente de 900px.
- `Sidebar` ganhou `onLogout` (mostra um ícone de sair no rodapé quando presente) e o bloco de usuário virou link pra `/perfil`. O label de perfil também deixou de ser hardcoded ("Executiva Comercial" fixo pro exemplo do Figma) e passou a usar o mapeamento genérico `EXECUTIVO_COMERCIAL`/`DIRETOR_COMERCIAL` → "Executivo Comercial"/"Diretor Comercial", já que agora mostra qualquer usuário logado, não só a Fernanda Costa do mock.
- `Sidebar`: o item ativo (`activeHref`) agora também acende pra sub-rotas (`/reunioes/nova`, `/reunioes/5`, ...), não só pro path exato — necessário assim que a primeira tela com sub-rotas (Reuniões) passou a existir.
- `RowReuniao` (`Rows.tsx`) ganhou `status` (antes fixo em `"PROCESSADA"`) e `href` opcionais — com `href`, a row inteira vira link (usado na lista de Reuniões pra navegar pro Detalhe).
- `RowCliente` (`TableClientes.tsx`) trocou `onVerDetalhes` por `onEditar` — "Ver detalhes" virou `Link` pra `/clientes/[id]` (issue #65) e ganhou um botão de edição próprio (ícone `Pencil`) pra não perder a funcionalidade de edição que antes vivia em "Ver detalhes". Coluna "Ação" da tabela foi de `w-30` pra `w-40` pra caber os dois elementos.
- **Cuidado ao compor `Panel/Status-Envio` num flex row**: o componente já tem `w-full` na própria className base (pensado pra um wrapper de largura fixa em volta dele, não pra competir com `flex-1` de um irmão). Passar uma largura fixa (`w-[380px]`) direto no `className` do componente conflita com esse `w-full` interno e quebra o layout (o irmão flex-1 fica espremido a ~0px). Solução usada em `reunioes/nova/page.tsx`: envolver o componente num `<div className="w-[380px] shrink-0">` em vez de passar a largura pelo próprio `className`.

## Fluxo de Git (decidido 24/08/2026)

A `main` está protegida (branch protection rule no GitHub, exige Pull Request + 1 aprovação antes de merge) — ninguém, incluindo quem está aplicando as entregas geradas aqui, commita direto na `main`. Trabalho em dupla (Breno/Pedro) passa a seguir:

**Nota de shell (24/08/2026):** o Breno roda os comandos no PowerShell do Windows, que não aceita `&&` como separador de comandos (isso é sintaxe de `cmd.exe`/bash, não do PowerShell — dá `ParserError`). Por isso os blocos abaixo (e as instruções de git em qualquer entrega futura) sempre vêm com um comando por linha, nunca encadeados com `&&`. Se algum dia o comando precisar mesmo ser combinado numa linha só no PowerShell, o separador correto é `;` (mas sem o "para no primeiro erro" que o `&&` dá no bash).

```bash
git checkout main
git pull                                  # sincroniza antes de começar

git checkout -b feature/70-71-reunioes    # padrão de nome abaixo

# ... aplica as mudanças ...

git add -A
git commit -m "feat: ..."
git push -u origin feature/70-71-reunioes
```

Depois é abrir o PR no GitHub (descrição com `Closes #70, #71` pra linkar automaticamente no board), esperar aprovação, mergear por lá, e só então `git checkout main && git pull` local pra sincronizar.

**Padrão de nome de branch**: `tipo/numero-da-issue-slug-curto` — `tipo` é `feature` (a maioria), `fix`, `chore` ou `docs`; `numero-da-issue` sem o `#` (dois números juntos quando a branch cobre issues relacionadas, ex. `70-71`); `slug-curto` é o nome da tela/funcionalidade, não a issue inteira. Exemplos: `feature/65-detalhe-cliente`, `feature/86-visao-360`, `fix/sidebar-largura`.

A partir de agora, as instruções de git que acompanham cada entrega já vêm nesse formato (branch + PR), não mais como commit direto na `main`.

## O que falta

O design system está 100% portado (ver seção acima) — todos os componentes nomeados no Figma têm equivalente em código, tipado com `src/types/domain.ts`.

Falta:

- As 4 telas do backlog do Pedro (Alertas, Dashboard Executivo, Busca Global, Copiloto — fora do escopo do Breno) — que vão consumir os componentes já prontos. Do lado do Breno, todas as issues atribuídas (`#60`, `#61`, `#64`, `#65`, `#70`, `#71`, `#86`, `#80`, `#101`) estão implementadas.
- Camada de dados: **isolada atrás de `src/services/*.service.ts` desde 24/08/2026** (ver seção "Camada de serviços" acima) — hoje cada função de serviço só envolve os mocks tipados com `src/types/domain.ts` (`src/mocks/clientes.ts`, `usuarios.ts`, `reunioes.ts`, `perfilCliente.ts`), mas a assinatura já é a mesma que uma chamada real à API do backend Java teria. Conectar ao backend de verdade deve significar só trocar o corpo dessas funções, sem tocar em tela nenhuma.

## Observação técnica

O `create-next-app` gerou este projeto na versão mais recente do Next.js (16), que tem mudanças relevantes em relação a versões mais antigas — o arquivo `AGENTS.md` na raiz (mantido automaticamente pelo `next dev`) aponta pra documentação local em `node_modules/next/dist/docs/` pra quem for usar convenções que não foram tocadas aqui.
