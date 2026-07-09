# Карта проекта VFC (аудит кода, 2026-07-09)

Результат изучения кодовой базы «как есть»: точки входа, модули, поток auth,
расхождения между CLAUDE.md и реальным кодом, открытые вопросы.
Без предложений по улучшению — только факты из кода.

---

# 1. Точки входа и порядок инициализации

**Сервер** — `server/src/index.ts` → `server/src/server.ts` → `server/src/app.ts`:

1. `initEnv()` (`server/src/configs/index.ts`) — dotenv из `../.env` (корень монорепы), fail-fast только на `JWT_SECRET` и `COOKIE_SECRET`.
2. `buildApp()` регистрирует плагины в порядке: cookie → cors → helmet (CSP выключен) → rate-limit → multipart (лимит 100MB) → static (`public/upload` без serve; `public` с prefix `/`) → swagger → **redis** → **jwt** → **mongodb** → **seeds** → routes, затем `await app.ready()`.
3. `plugins/mongodb/mongodb.ts` при подключении вызывает `mongodb.init.ts`: создаёт 6 коллекций (users, folders, files, reports, formConfigs, content) с индексами + корневую папку с фиксированным `ObjectId('000...0')`.
4. `plugins/seeds.ts` (зависит от mongodb) → `seeds/seeds.service.ts`: миграция `lang:'ru'`, formConfigs апсертятся **всегда**, страницы — только новые либо все при `UPDATE_PAGES_DATA=true`.
5. `listen` на `0.0.0.0:3000` — порт **захардкожен** (`server.ts:9`). Graceful shutdown через close-with-grace.
6. `routes/index.ts`: `/api/{users,auth,storage,content,profile,reports}`, `/upload` вне `/api`, `/health`, SPA-fallback (любой GET не-`/api`/не-`/upload` → `public/index.html`).

**Клиент** — `client/src/main.ts`: SCSS → Pinia → router → i18n → VueDOMPurifyHTML → VueQueryPlugin (staleTime 1 мин, retry 1). `App.vue` выбирает layout по `route.meta.layout` (default/auth/profile/admin/empty). Auth-инициализации при старте нет — она лениво в router guard (`router/routes.guard.ts:18` → `authStore.init()`).

---

# 2. Модули

## Сервер

Все по одному шаблону: `*.routes.ts` вручную собирает цепочку
`createRepository(app.mongo.db)` → `createService(...)` → `createController(...)`
(фабрики, без DI-контейнера). Межмодульные связи — прямой импорт чужих фабрик.

| Модуль | Отвечает за | Связи |
|---|---|---|
| `modules/auth` | login, registration, refresh, logout(All), change-password, forgot-password + reset по коду, check-email, get-code (admin) | `users.repository`, redis, jwt, `services/mailer` |
| `modules/users` | админ-CRUD: `/all`, `/create`, `/update/:id`, `/delete/:id` (admin); `/item/:id`, `/list` (vereficator+admin) | самодостаточен; его repository переиспользуют auth и profile |
| `modules/profile` | `/me`, `/update`, `/upload/avatar` (все под auth) | `users.repository`, `services/fsStorage.service` |
| `modules/storage` | файлы/папки CMS, подмодули `files/` и `folders/`; весь роутер под `requireManager` | fsStorage |
| `modules/content` | коллекции `content` (страницы) + `formConfigs`; GET-ы **публичные**, PATCH update — admin | кормит и публичные страницы, и админку |
| `modules/reports` | доклады пользователей: CRUD под `requireAuth`, `/all` — admin | самодостаточен |
| `modules/upload` | публичная раздача файлов, для картинок — подбор/фоновая генерация webp-размеров (sharp) | fsStorage, `services/imageResize.worker` |

Кросс-модульное: `common/middlewares/authRole.guard.ts` (requireAuth/Admin/Manager/Vereficator), `common/errors` (фабрика ошибок), mailer, fsStorage.

**`server/src/modules/index.ts` (`registerModules`) — мёртвый код, никто не импортирует.**

## Клиент

Роуты всех модулей централизованы в `client/src/router/routes.ts`, модули сами
роуты не регистрируют. Все ходят в API через единый `shared/api/fetcher.ts`.

- `modules/auth` — Pinia-store (единственный глобальный стейт), api, страницы Login/Registration/ForgotPassword.
- `modules/profile` — профиль, смена пароля, аватар, CRUD своих докладов (`useReports`).
- `modules/admin` — 4 подмодуля: `files` (файл-менеджер), `pages-data` (редактор контента), `reports`, `users`; общий `AdminPageLayout`. Серверный стейт — через vue-query composables.
- `modules/public` — только HomePage с секциями Banner/Committee/Program; данные через `shared/composables/content/*` из `/api/content`.
- `modules/testPage` — `/test` (admin), песочница инпутов.
- **`modules/users` — пустая папка.** `src/stores/` — тоже пустая.

---

# 3. Поток auth

1. **Login**: `POST /api/auth/login {email, password, remember}` → `auth.service.ts` (`getAccessAndRefreshTokens`) генерирует пару: access-JWT (`_id, email, name, role, type:'access', uuid`; TTL 15m prod / 30d dev) и refresh-JWT (`_id, type:'refresh', uuid, remember`; 7d / 120d) — `configs/auth.config.ts`, переключение по `NODE_ENV`.
2. **Redis**: `user:{id}:token:access:{uuid}` = `''` (пустая строка) и `user:{id}:token:refresh:{uuid}` = сам refresh-JWT, оба с TTL.
3. **Cookie**: контроллер ставит `refreshToken` (httpOnly, secure, sameSite=lax, path=`/api/auth`); `maxAge` ставится **только при `remember=true`**, иначе session-cookie (`auth.controller.ts:7-15`). Access уходит в JSON.
4. **Клиент**: access живёт в переменной модуля `shared/lib/token.storage.ts` (чистая память, не localStorage). Store после логина дотягивает `GET /profile/me`.
5. **Защита запросов**: `authRole.guard.ts` проверяет только подпись/exp JWT, `type==='access'` и роль. **Redis для access-токена не проверяется** — запись из п.2 на авторизацию не влияет.
6. **Refresh**: fetcher на любой 401 делает single-flight `POST /api/auth/refresh` (cookie) и повторяет исходный запрос (`fetcher.ts:117-132`). Сервер: verify → `type==='refresh'` → ключ есть в Redis (отзыв) → удаляет ключ (ротация) → новая пара (`auth.service.ts` `refresh()`).
7. **Восстановление сессии** после перезагрузки: access потерян → guard → `init()` → `/profile/me` → 401 → авто-refresh по cookie → повтор. Явного вызова `/refresh` в store нет — всё через перехват 401.
8. **Logout** удаляет оба Redis-ключа + чистит cookie; **logoutAll** — `redis.keys('user:{id}:token:*')` + del. Следствие п.5: отозванные access-токены остаются валидными до exp (в dev — до 30 дней).
9. **change-password / reset-password-code** → `logoutAll` + выдача новой пары.

---

# 4. Расхождения CLAUDE.md ↔ код

1. **«Validation: Zod»** — zod и fastify-type-provider-zod есть в `server/package.json`, но в `server/src` ни одного импорта; валидация — ручные `if` в сервисах.
2. **«MongoDB (native driver + mongoose)»** — mongoose в зависимостях, в коде не используется вовсе.
3. **`GET /api/users [admin]`** — на деле `GET /api/users/all`, плюс не упомянутые `/create`, `/update/:id`, `/delete/:id` (admin) и `/item/:id`, `/list` (vereficator) — `users.routes.ts`.
4. **Не упомянуты auth-эндпоинты**: `GET /check-email/:email`, `POST /forgot-password`, `POST /reset-password-code`, `GET /get-code/:email` (admin) — `auth.routes.ts`.
5. **`SERVER_PORT=3001`** — сервер всегда слушает 3000 (`server.ts:9`); `SERVER_PORT`/`CLIENT_PORT`/`REDIS_PORT` — это только маппинги портов в `docker-compose.yml`. `SERVER_PORT` дополнительно читает vite-proxy с fallback **4100** (`client/vite.config.ts:17`).
6. **`REDIS_URL` обязателен** (`plugins/redis.ts:9`), но отсутствует и в CLAUDE.md, и в `.env.example` — задаётся только в docker-compose. Запуск сервера вне докера без него упадёт.
7. **«Access token: in memory + Redis»** — формально хранится в Redis, но guard его там не проверяет (см. п.3.5) — фраза создаёт ложное впечатление server-side отзыва access-токенов.
8. **Refresh cookie TTL 7d** — только при `remember=true`; по умолчанию session-cookie.
9. Клиентский модуль **`users` — пустой**, `stores/` — пустой (все сторы в модулях); CLAUDE.md подаёт их как содержательные.
10. Tech stack не упоминает заметные вещи: **@tanstack/vue-query** (весь серверный стейт клиента), vue-dompurify-html, sharp.
11. Мелочь: в структуре auth-клиента не указаны `ForgotPassword.vue` и composables.

---

# 5. Осталось непонятным

- **Где живёт MongoDB при docker-запуске**: в `docker-compose.yml` сервиса mongo нет, а `MONGO_DB_CONNECT=mongodb://localhost:27017/` изнутри контейнера указывает на сам контейнер. Либо compose используется частично, либо есть внешний Mongo, не отражённый в репо.
- **Назначение Redis-записи access-токена**: значение пустое, никто не читает — задел под server-side отзыв или атавизм; в `auth.service.ts` (`refresh()`) есть TODO про «семейства токенов».
- **`/guard` роут** с `meta.roles: []`: клиентский guard при пустом массиве всегда даёт `hasRole=false` (`routes.guard.ts:43-45`) — страница фактически недоступна никому; задумка неясна (на сервере пустой массив ролей означает «просто auth» — семантика противоположная).
- **`shared/dist` и `shared/scripts`** + `build-seeds.mjs` в серверном билде (`tsup && node build-seeds.mjs`) — как собирается shared-пакет, не изучено.
- Роль **`vereficator`** (с опечаткой) — используется в guard'ах и users-роутах, но какого пользователя она описывает — из кода не выводится.
