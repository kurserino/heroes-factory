# Heroes Factory

Uma pequena aplicação full-stack CRUD para gerenciar registros de heróis: criar,
listar, buscar, visualizar, editar, ativar/desativar e excluir heróis permanentemente.

## Visão geral

Um herói tem nome, nome de guerra, data de nascimento, universo, habilidade principal
e imagem de avatar, além de um estado de ciclo de vida ativo/inativo. A aplicação impõe
um pequeno conjunto de regras de negócio em torno desse ciclo de vida:

- Novos heróis são sempre criados **ativos**.
- Apenas heróis **ativos** podem ser editados ou excluídos permanentemente.
- Heróis **inativos** só podem ser reativados — nenhuma outra ação está disponível
  para eles.
- A exclusão é **permanente** (hard delete). Não existe "lixeira", nem campo
  `deleted_at`, nem forma de recuperar um herói excluído.

O escopo é intencionalmente pequeno: um recurso, uma tela principal, sem autenticação.
O objetivo é demonstrar arquitetura limpa, aplicação correta das regras de negócio e
código sustentável, em vez de amplitude de funcionalidades.

## Arquitetura

```
Frontend (React SPA)  ──HTTP/JSON──►  Backend (NestJS REST API)  ──Prisma──►  MySQL 8
```

**Backend** segue um fluxo em camadas — `Controller → Service → Repository → Prisma → MySQL`:

- **Controller**: apenas transporte HTTP (rotas, status codes, validação de DTO).
- **Service**: regras de negócio (criação sempre ativa por padrão, restrição de
  edição/exclusão a heróis ativos, verificação da URL do avatar), independente de
  detalhes de HTTP e persistência.
- **Repository**: a única abstração do código-base, isolando o Prisma do service.
  Ela existe por um motivo concreto — permite testar o service com um fake em memória,
  sem um banco de dados real.
- Nenhum objeto de caso de uso, mapper, gateway ou camada de domain-event foi
  introduzido. Com um único recurso e sem fluxos transversais, eles não teriam
  problema algum para resolver.

**Frontend** não tem gerenciador de estado global. Todo o estado de servidor (lista,
detalhes, mutações, invalidação de cache) é gerenciado pelo TanStack Query; tudo o
mais (qual modal está aberto, qual herói está selecionado) é estado local de
componente. Também não há roteador — a aplicação é uma tela única com interações
via modal/menu.

Ambas as aplicações usam TypeScript em modo `strict`, e cada dependência da stack
corresponde a uma necessidade concreta (veja [Trade-offs](#trade-offs-e-decisões)
abaixo).

## Estrutura de pastas

```
heroes-factory/
├── docker-compose.yml       # Apenas o MySQL 8 — a API e o frontend rodam localmente via Node.js
├── package.json              # Raiz com npm workspaces; scripts compartilhados de dev/build/test/lint
├── .env.example               # Variáveis do Docker Compose (nome/usuário/senha/porta do banco)
│
├── apps/
│   ├── api/                   # API REST NestJS + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Model Hero, datasource MySQL
│   │   │   ├── seed.ts             # Popula o banco a partir do dataset em seed-data/
│   │   │   ├── seed-data/          # heroes.json — dataset em cache de heróis reais
│   │   │   └── migrations/        # histórico de schema versionado
│   │   ├── src/
│   │   │   ├── common/            # filtro de exceção global (formato de erro consistente)
│   │   │   ├── prisma/             # PrismaService/PrismaModule
│   │   │   └── heroes/             # o único módulo de feature
│   │   │       ├── dto/                    # validação de request (class-validator)
│   │   │       ├── entities/               # a representação da API com 10 campos
│   │   │       ├── heroes.controller.ts
│   │   │       ├── heroes.service.ts        # as regras de negócio ficam aqui
│   │   │       ├── heroes.repository.ts     # interface abstrata
│   │   │       ├── prisma-heroes.repository.ts
│   │   │       ├── avatar-url-validator.ts  # verifica se avatar_url resolve pra uma imagem
│   │   │       └── heroes.module.ts
│   │   └── test/
│   │       ├── unit/               # HeroesService + AvatarUrlValidator, isolados
│   │       └── integration/        # comportamento HTTP completo contra um banco real
│   │
│   └── web/                   # Frontend React + Vite
│       └── src/
│           ├── app/                 # Shell da aplicação, tema, TanStack QueryClient
│           ├── lib/                  # wrapper de fetch + normalização de erros de API
│           ├── components/ui/        # peças de UI genéricas e reutilizáveis (não específicas da feature)
│           └── features/heroes/
│               ├── api/               # heroesApi.ts (chamadas fetch) + heroesQueries.ts (hooks do TanStack Query)
│               ├── components/        # HeroList, HeroCard, HeroActions, dialogs, estados, etc.
│               ├── hooks/             # useHeroListParams (estado local de página/busca)
│               ├── schemas/           # validação Zod do formulário de criação/edição
│               └── types/             # tipo TypeScript Hero
│
└── specs/001-hero-management/   # artefatos de design orientado por spec (spec, plan, tasks, contracts)
```

## Escolhas tecnológicas e justificativa

| Escolha                                                     | Por quê                                                                                                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **npm workspaces**, sem Turborepo/Nx                        | Dois pacotes sem biblioteca interna compartilhada não precisam de ferramentas de build-graph; workspaces sozinho já dá instalação compartilhada e scripts na raiz.                    |
| **NestJS**                                                  | Módulos Nest estruturados e orientados por convenção mapeiam diretamente para a camada Controller→Service→Repository exigida, com DI tornando trivial trocar o repository nos testes. |
| **Prisma**                                                  | Queries type-safe, e migrations são um artefato de primeira classe e versionado — sem arquivos de migration SQL escritos à mão pra manter sincronizados.                              |
| **MySQL 8 via Docker Compose**                              | Banco de dados local reprodutível sem instalar MySQL na máquina; apenas o banco roda em container, então os processos da aplicação iteram com o hot-reload normal do `npm run dev`.   |
| **Uma única abstração de repositório (`HeroesRepository`)** | A única abstração sancionada: permite testar as regras de negócio do `HeroesService` com um fake, sem banco de dados. Nenhuma outra camada de abstração foi adicionada.               |
| **React + Vite**                                            | Dev server rápido, configuração mínima, sem opiniões de framework que a tela única da aplicação não precisa.                                                                          |
| **Material UI**                                             | Fornece primitivos acessíveis por padrão (dialogs, menus, switches), então a acessibilidade não precisou ser construída do zero.                                                      |
| **TanStack Query, sem Redux**                               | O único estado entre componentes é dado de servidor; o cache do TanStack Query já é a fonte da verdade pra isso, então uma segunda store global só duplicaria estado.                 |
| **React Hook Form + Zod**                                   | Poucos re-renders, e um schema tipado que espelha as regras de validação do backend pra feedback rápido no cliente — enquanto o backend continua sendo a fonte real da verdade.       |
| **Jest/Supertest (backend), Vitest/RTL (frontend)**         | O padrão nativo de cada toolchain — minimiza a superfície de configuração em vez de introduzir um segundo bundler/runner.                                                             |

## Pré-requisitos

- Node.js 20 LTS e npm
- Docker (para o container do MySQL 8)

## Configuração do ambiente

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Os valores padrão já funcionam para desenvolvimento local. O `DATABASE_URL` de
`apps/api/.env` precisa bater com as credenciais/porta do MySQL do `.env` da raiz,
caso você as altere.

## Instalando as dependências

```bash
npm install
```

Rode uma única vez na raiz do repositório — os npm workspaces instalam tanto
`apps/api` quanto `apps/web`.

## Subindo o MySQL com Docker

```bash
docker compose up -d
docker compose ps   # confirme que o serviço mysql está "healthy"
```

Isso sobe o MySQL 8 com um volume nomeado persistente, então os dados sobrevivem a
reinícios do container. Apenas o banco roda em Docker; a API e o frontend rodam
localmente via Node.js.

## Rodando as migrations

### (Opcional) Garantir privileges para dev local

O `migrate:dev` precisa de permissão pra criar um shadow database temporário e
detectar divergências de schema. O usuário padrão `heroes_app` (veja
`docker-compose.yml`) pode não ter privilégios suficientes pra isso num ambiente
novo. Se você rodar `migrate:dev` e ver um erro de permissão, rode isso uma única
vez contra o container do MySQL:

```bash
docker compose exec mysql mysql -uroot -pheroes_root_password -e "GRANT ALL PRIVILEGES ON *.* TO 'heroes_app'@'%'; FLUSH PRIVILEGES;"
```

Ajuste o usuário/senha se você alterou os valores padrão do `.env` da raiz. Isso é
só uma conveniência de dev local; o `migrate deploy` (usado pra aplicações
repetíveis/CI) não precisa disso.

```bash
npm run migrate:dev --workspace apps/api
```

Aplica (e, se o schema mudou, gera) migrations contra o banco em execução. Para uma
aplicação não interativa/estilo CI de migrations já commitadas, use
`npm run migrate --workspace apps/api` (`prisma migrate deploy`).

## Populando o banco com dados de exemplo (seed)

```bash
npm run seed --workspace apps/api
```

Insere 50 heróis reais (nome, nome de guerra, universo, habilidade e avatar) a
partir de um dataset em cache em `apps/api/prisma/seed-data/heroes.json`, sem
depender de nenhuma API externa em tempo de execução. A quantidade é configurável:

```bash
npm run seed --workspace apps/api -- --count=50
```

Se omitido, o padrão é 50 (o tamanho do dataset em cache). Pedir uma quantidade
maior que 50 faz o script repetir o dataset em ciclo até atingir a quantidade
pedida.

## Iniciando a API

```bash
npm run dev --workspace apps/api
```

Inicia o servidor NestJS em modo watch em `http://localhost:3000`.

## Iniciando o frontend

```bash
npm run dev --workspace apps/web
```

Inicia o dev server do Vite em `http://localhost:5173`.

**Rodar os dois ao mesmo tempo** a partir da raiz do repositório:

```bash
npm run dev
```

## Rodando os testes

```bash
npm run test --workspace apps/api        # testes unitários do backend
npm run test:e2e --workspace apps/api    # testes de integração do backend (precisa do banco rodando)
npm run test --workspace apps/web        # testes de componente do frontend

npm run test      # roda o script "test" padrão de cada workspace (apenas unitário/componente)
npm run lint       # lint em ambos os workspaces
```

## Endpoints da API REST

Base path: `/heroes`. Sem autenticação. Todas as requisições/respostas são JSON.

| Método   | Caminho                 | Descrição                                                                  |
| -------- | ----------------------- | -------------------------------------------------------------------------- |
| `POST`   | `/heroes`               | Cria um herói (sempre criado ativo)                                        |
| `GET`    | `/heroes?page=&search=` | Lista heróis, paginado (10/página), busca opcional por nome/nome de guerra |
| `GET`    | `/heroes/:id`           | Retorna os detalhes completos de um herói                                  |
| `PATCH`  | `/heroes/:id`           | Edita os campos editáveis de um herói ativo (rejeita heróis inativos)      |
| `PATCH`  | `/heroes/:id/status`    | Altera apenas `is_active` (ativar ou desativar)                            |
| `DELETE` | `/heroes/:id`           | Exclui permanentemente um herói ativo (rejeita heróis inativos)            |

A representação de um herói na API sempre contém exatamente estes campos: `id`,
`name`, `nickname`, `date_of_birth`, `universe`, `main_power`, `avatar_url`,
`is_active`, `created_at`, `updated_at`. Respostas de erro compartilham um formato
consistente `{ statusCode, error, message }`; detalhes internos de ORM/banco de
dados nunca são expostos ao cliente. Exemplos completos de request/response:
[`specs/001-hero-management/contracts/heroes-api.md`](specs/001-hero-management/contracts/heroes-api.md).

## Regras de negócio: heróis ativos/inativos

- Um herói é **ativo** por padrão quando criado.
- Heróis **ativos** podem ser editados, desativados ou excluídos permanentemente.
- Heróis **inativos** só podem ser reativados — editar ou excluir um herói inativo é
  rejeitado, tanto no que a UI oferece quanto de forma independente no nível da API
  (`409 Conflict`), então a regra vale mesmo que uma requisição contorne a UI.
- Ativar/desativar altera apenas `is_active` (e atualiza `updated_at`); todos os
  outros campos permanecem intocados.
- Toda ativação/desativação e toda exclusão exige confirmação explícita do usuário
  antes de ser aplicada.

## Comportamento de exclusão permanente

A exclusão é um hard delete: a linha do banco é removida por completo. Não há coluna
`deleted_at`, nem flag de soft-delete, nem caminho de recuperação — uma vez
confirmado, um herói excluído desaparece e imediatamente para de aparecer em
qualquer listagem, busca ou consulta direta (`404`). A exclusão só é permitida para
heróis ativos; um herói inativo precisa ser reativado antes de poder ser excluído.

## Trade-offs e decisões

- **Sem autenticação.** Explicitamente fora do escopo; todos os endpoints estão
  abertos. Não é adequado, como está, para um deploy real.
- **Uma única abstração de repositório, nada além disso.** Objetos de caso de uso,
  mappers e camadas semelhantes foram deliberadamente não adicionados — eles não
  teriam problema concreto a resolver nessa escala, e seriam só indireção a explicar.
- **Sem atualizações otimistas na UI.** Mutações esperam a resposta do servidor
  antes de refletir uma mudança; mais simples de raciocinar, ao custo de uma
  pequena diferença de latência percebida num banco local rápido.
- **A validação no cliente não replica todas as regras do servidor.** Em
  particular, a verificação "a URL do avatar resolve pra uma imagem carregável" só
  acontece no servidor (exige uma requisição de rede); o cliente valida
  formato/obrigatoriedade pra feedback rápido, mas o servidor continua sendo a
  fonte da verdade.
- **Banco de dev único compartilhado pelos testes de integração do backend.** Os
  testes de integração rodam contra a mesma instância local do MySQL usada pra
  teste manual (limpando as linhas de heróis entre os testes), em vez de um
  banco/container de teste dedicado. Adequado nessa escala; precisaria de
  isolamento pra um ambiente maior ou compartilhado em CI.
- **Sem versionamento de API ou rate limiting.** Não necessário para uma aplicação
  de avaliação pequena, sem autenticação e com um único consumidor.

## Possíveis melhorias futuras

- Autenticação/autorização (ex.: posse de herói por usuário).
- Atualizações otimistas na UI para mutações, com rollback em caso de falha.
- Code-splitting do bundle do frontend (atualmente um único chunk de ~500 KB — ok
  nessa escala, mas importaria numa aplicação maior).
- Um banco/container de teste dedicado, isolado dos dados de teste manual local.
- Operações em lote (desativar/excluir em massa) e importação/exportação CSV.
- Busca além de correspondência simples de substring (ex.: fuzzy matching,
  ranqueamento multi-campo).
- Rate limiting de API e logging/observabilidade estruturados de requisições.
