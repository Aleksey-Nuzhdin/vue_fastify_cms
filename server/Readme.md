# Server — Fastify 5 REST API

Бэкенд VFC: Fastify 5 + TypeScript, MongoDB (native driver + mongoose), Redis для токенов/сессий, Zod для валидации.
Общее описание проекта и запуск через Docker — в корневом [README.md](../README.md).

## Запуск

```bash
pnpm install
pnpm run dev            # nodemon (tsx watch src/index.ts)
pnpm run dev:log        # то же + pino-pretty
pnpm run build          # tsup + сборка сидов
pnpm run start          # node dist/index.js
pnpm run lint | lint:fix | format | format:check
```

Переменные окружения читаются из корневого `.env` (см. [.env.example](../.env.example)).
`JWT_SECRET` и `COOKIE_SECRET` обязательны — при отсутствии сервер падает на старте (fail-fast).

## Структура

```
src/
├── index.ts              # Точка входа → initEnv() + startServer()
├── server.ts             # Запуск, graceful shutdown
├── app.ts                # Сборка Fastify, регистрация плагинов
├── configs/              # auth.config (TTL токенов), initEnv
├── plugins/              # jwt, redis, mongodb, seeds, swagger
├── common/               # middlewares (authRole.guard), errors
├── routes/index.ts       # Регистрация префиксов (/api/*, /upload, /health)
├── services/             # mailer и пр. кросс-модульные сервисы
├── seeds/                # Сиды контента (data/content/*.page.ts | *.list.ts)
└── modules/
    ├── auth/             # login, registration, refresh, logout, change-password
    ├── users/            # CRUD пользователей
    ├── profile/          # /api/profile/me
    ├── storage/          # файлы и папки
    ├── content/          # контент страниц + справочники-списки (type: page|list)
    ├── reports/          # пользовательский контент
    └── upload/           # раздача загруженных файлов
```

## Анатомия модуля

```
src/modules/<module>/
├── <module>.routes.ts        # Маршруты
├── <module>.controller.ts    # HTTP вход/выход
├── <module>.service.ts       # Бизнес-логика
├── <module>.repository.ts    # Работа с БД
├── <module>.schema.ts        # Валидация (Zod)
├── <module>.dto.ts           # Трансформация ответов
└── <module>.types.ts         # Типы модуля
```

Дополнительные слои — по мере роста проекта:

| Слой              | Когда добавлять                                  |
|-------------------|--------------------------------------------------|
| Schema/Validation | Сразу — защита от мусорных данных                |
| DTO/Mapper        | Когда нужно скрывать поля или менять формат      |
| Middleware        | Для сквозной логики (auth, logging, timing)      |
| Events/Queue      | Когда нужна асинхронная обработка                |
| Cache             | Когда нагрузка на БД высокая                     |

## Контент и сиды

Коллекция `content` хранит и страницы, и справочники-списки, различаемые полем `type: 'page' | 'list'`.
Сиды лежат в `src/seeds/data/content/` (`*.page.ts` и `*.list.ts`); пересев при старте включается флагом `UPDATE_PAGES_DATA=true`.

## Документация API

Swagger UI подключён через `@fastify/swagger` + `@fastify/swagger-ui`.
```
