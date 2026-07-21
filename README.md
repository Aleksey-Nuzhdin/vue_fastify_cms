# VFC — Vue Fastify CMS (boilerplate)

Фуллстек-монорепо и шаблон-болванка для быстрого старта проектов: **Vue 3 (client) + Fastify (server) + общие типы (shared)**.
Из коробки: аутентификация (JWT access/refresh), профиль, файловое хранилище, редактируемый через админку контент страниц и генератор форм.

> Это шаблон. HomePage содержит 3 демо-секции (`HomeBanner`, `HomeProgram`, `HomeCommittee`) как живой пример загрузки контента с сервера.

## Структура

```
├── client/     # Vue 3 SPA (Vite, Pinia, Vue Router, vue-i18n, TanStack Query)
├── server/     # Fastify 5 REST API (TypeScript, MongoDB, Redis)
├── shared/     # Общие TypeScript-типы и константы между client и server
├── docker-compose.yml           # dev (server + client + redis)
├── docker-compose.prod.yml      # prod
└── CLAUDE.md   # инструкции для проекта
```

Подробнее по частям — в [server/Readme.md](./server/Readme.md) и [client/README.md](./client/README.md).

## Стек

| Слой        | Технологии                                              |
|-------------|---------------------------------------------------------|
| Frontend    | Vue 3, TypeScript, Vite, Pinia, Vue Router, vue-i18n, TanStack Query |
| Backend     | Fastify 5, TypeScript, Pino, Zod, Swagger               |
| БД          | MongoDB (native driver + mongoose)                      |
| Кэш/сессии  | Redis (хранение токенов)                                |
| Auth        | JWT (access + refresh), bcrypt                          |
| Почта       | Nodemailer                                              |
| Изображения | sharp                                                   |

## Быстрый старт (Docker)

Требуется установленный Docker. Пакетный менеджер внутри — **pnpm**.

```bash
# 1. Скопировать шаблон переменных окружения
cp .env.example .env

# 2. Сгенерировать стойкие секреты (JWT_SECRET / COOKIE_SECRET) прямо в .env
pnpm gen:secrets

# 3. Сгенерировать общие типы из shared/
pnpm run gen:types        # или pnpm run dev:types — в watch-режиме

# 4. Поднять весь стек (server + client + redis)
pnpm run dev:all
```

> **Секреты обязательны.** `.env.example` содержит только плейсхолдеры — они не пройдут проверку стойкости. Шаг 2 генерирует настоящие значения (`openssl rand -hex 32` → 64 hex-символа). В prod (`NODE_ENV=production`) сервер **упадёт на старте**, если `JWT_SECRET`/`COOKIE_SECRET` слабые или не заданы. Прод использует тот же `.env` — сгенерируйте его на прод-машине.

По умолчанию (см. `.env.example`):
- client → http://localhost:3002
- server → http://localhost:3001
- redis  → 3003

Для MongoDB укажите строку подключения в `MONGO_DB_CONNECT` (локальный инстанс или Atlas — в compose Mongo не поднимается).

### Полезные npm-скрипты (корень)

| Скрипт                | Назначение                                        |
|-----------------------|---------------------------------------------------|
| `pnpm dev:all`        | Поднять весь dev-стек                             |
| `pnpm dev:server`     | Только server + redis (с --build и watch)         |
| `pnpm dev:client`     | Только client                                     |
| `pnpm gen:secrets`    | Сгенерировать стойкие hex-секреты в `.env` (`--force` — перегенерить) |
| `pnpm gen:types`      | Сгенерировать типы из `shared/`                   |
| `pnpm dev:types`      | Генерация типов в watch-режиме                    |
| `pnpm dev:rebuild`    | Полный пересбор (down -v + up --build)            |
| `pnpm prod:build` / `prod:up` / `prod:down` | Prod через `docker-compose.prod.yml` |
| `pnpm stop`           | Остановить стек                                   |

### Локальный запуск без Docker

```bash
cd server && pnpm install && pnpm run dev    # nodemon
cd client && pnpm install && pnpm run dev    # vite
```

## Переменные окружения

Все переменные — в `.env` в корне (шаблон — `.env.example`).

```
JWT_SECRET, COOKIE_SECRET          # секреты, 64 hex-символа; fail-fast если нет/слабый (см. pnpm gen:secrets)
MONGO_DB_CONNECT, MONGO_DB_NAME    # MongoDB
SERVER_PORT, CLIENT_PORT, REDIS_PORT, PRODACTION_PORT
UPDATE_PAGES_DATA                  # true → пересевать контент при старте
MAILER_IS_ACTIVE, MAILER_HOST, MAILER_PORT, MAILER_FROM   # SMTP (Nodemailer)
```

## API (основное)

Все маршруты под префиксом `/api` (кроме `/upload` и `/health`).

```
POST   /api/auth/login | registration | refresh | logout | logoutAll
PATCH  /api/auth/change-password        [auth]

GET    /api/profile/me                  [auth]
GET    /api/users                       [admin]

...    /api/storage/...                 # файлы и папки
...    /api/content/...                 # контент страниц и справочники-списки
...    /api/reports/...                 # пользовательский контент
GET    /upload/...                      # раздача загруженных файлов
GET    /health
```

Swagger-документация доступна на сервере (`@fastify/swagger-ui`).

## Аутентификация

- Два токена: короткоживущий **access** + долгоживущий **refresh**.
- Access — в памяти + Redis (TTL 15m prod / 30d dev).
- Refresh — httpOnly cookie + Redis (TTL 7d prod / 120d dev).
- Ключ Redis: `user:{userId}:token:{type}:{uuid}`.
- Пароли — bcrypt (12 раундов).

## Общие типы и константы (`shared/`)

Единый источник типов между клиентом и сервером. После изменения `shared/types/*` или `shared/constants/*` запустите `pnpm gen:types` (или держите запущенным `pnpm dev:types`).
