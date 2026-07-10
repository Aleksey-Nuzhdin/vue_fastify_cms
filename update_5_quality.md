# Фаза 4 — аудит типизации и конфигурации VFC (2026-07-10)

Фокус: строгость компилятора, места, где типы врут или молчат, и конфигурация,
расходящаяся с реальностью. Ничего не чинилось. Обработка ошибок/статусы —
update_2/update_4; security-severity — update_3 (здесь только однострочные
отсылы); паттерны между модулями и именование — update_4.

**Тесты — факт одной строкой**: тестов ноль (vitest у клиента настроен,
`tsconfig.vitest.json` компилирует пустое множество файлов), в ближайшее время
не планируются.

**Тезисы.**
- **Типы сервера никто не проверяет.** Сборка = tsup/esbuild (типы стираются,
  не проверяются), скрипта `tsc --noEmit` нет ни в scripts, ни в CI (CI нет
  вообще). Проверено вживую: `npx tsc --noEmit` сейчас **чист** — но первый же
  внесённый type-error молча уедет в прод.
- **Клиентский тулинг на хосте мёртв**: все симлинки `client/node_modules`
  указывают на переименованную папку `vue_fastify_cms1` — eslint, oxlint,
  vue-tsc, vitest на хосте не запускаются вовсе. Типы клиента реально
  проверяются в одном месте — `vue-tsc` внутри прод-сборки докера.
- **shared — не пакет**: нет своего tsconfig/package.json; компилируется дважды
  под разными флагами (клиент строже сервера: `noUncheckedIndexedAccess`,
  `verbatimModuleSyntax`) и двумя разными версиями TS (5.9 против 5.6).
  `shared/dist` — бесхозный артефакт: не в git, никем не импортируется,
  генератора в репозитории нет.
- Самые дорогие «врущие» типы: клиент верит `ReturnUser` (без password) там,
  где сервер шлёт полный документ с хешем; `deleteUser` типизирован как
  `Promise<ReturnUser>`, а фактически возвращает `null` (204); multipart-роут
  объявлен с JSON-`Body`; `!` на `findOne(...)` вообще не делает того, что
  задумано.
- **Mailer выключен во всех окружениях**: `MAILER_IS_ACTIVE` есть только в
  `.env.example` — и dev, и prod молча работают на заглушке, которая печатает
  письма (включая код сброса пароля) в stdout.
- Линт существует, но не живёт: серверный eslint при ручном прогоне даёт
  **79 проблем (23 error)**, мёртвые импорты копятся; хуков и CI нет.
- 4 мёртвые прод-зависимости сервера (mongoose, zod,
  fastify-type-provider-zod, @sinclair/typebox); pino задан `logger: true` без
  redact и без разделения уровней dev/prod.

Разделы отсортированы по риску тихой поломки.

---

## 1. Ворота компилятора: типы сервера не проверяет никто

- `server/package.json:6-14` — весь жизненный цикл без проверки типов:
  `dev` = nodemon→tsx (транспиляция esbuild), `build` = `tsup && node
  build-seeds.mjs` (оба на esbuild, который **не проверяет типы**), `start` =
  node dist. Скрипта `typecheck`/`tsc --noEmit` нет. CI и git-hooks в репо
  отсутствуют (`git ls-files` — ни `.github`, ни husky).
- Следствие: единственное место, где серверный TS «читается» компилятором —
  редактор. Прогнал вручную: `npx tsc --noEmit` в `server/` сейчас проходит
  чисто (0 ошибок) — т.е. ворота поставить дёшево, долга пока нет. Но любой
  будущий type-error (сломанный контракт `@shared`, опечатка в поле) соберётся
  и уедет в прод без единого красного сигнала.
- Клиент формально имеет ворота: `client/package.json:12` — `build` =
  `run-p type-check build-only` (`vue-tsc --build`). Но `dev` = чистый vite
  (vue-плагин типы не проверяет), а хостовый запуск сломан (раздел 2) — итого
  типы клиента проверяются **только при прод-сборке докера**
  (`Dockerfile.prod:9`).
- `server/tsconfig.json:8` — `strict: true`, но нет
  `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. Клиент
  через `@vue/tsconfig` (base) получает `strict` **плюс**
  `noUncheckedIndexedAccess` и `verbatimModuleSyntax` → один и тот же
  shared-код обязан удовлетворять двум разным наборам флагов, и серверная
  половина проверяется мягче (индексация `arr[i]` на сервере типизирована как
  всегда-определённая).
- Версии TS разъехались: server `typescript ~5.6.2`
  (`server/package.json:60`) vs client `~5.9.3` (`client/package.json:54`).
  Пока сервер не запускает tsc — это латентно; при добавлении ворот shared
  начнёт проверяться двумя версиями с разным поведением.

## 2. Хостовый тулинг клиента сломан: симлинки в несуществующую папку

- Все записи `client/node_modules/*` — симлинки вида
  `-> /c/git repo/vue_fastify_cms1/client/node_modules/.pnpm/...` (папка
  репозитория была переименована из `vue_fastify_cms1`, абсолютные симлинки
  pnpm остались). Проверено: `npx eslint .`, `npx oxlint .` в `client/` падают
  с `MODULE_NOT_FOUND`; то же будет с `vue-tsc`, `vitest`, `vite`.
- Чем грозит: `pnpm run lint` / `type-check` / `test:unit` на хосте не
  работают **молча для того, кто их не запускает** — сигналов качества от
  клиента нет вообще, IDE-подсветка TS тоже может работать на встроенной
  версии вместо проектной. Лечится переустановкой (`pnpm install` в client) —
  зафиксировано для Фазы 5.
- Сервер этим не задет: его `node_modules` переустановлены после переименования
  (tsc/eslint запускаются — см. разделы 1 и 6).

## 3. Типы, которые врут (заявленное ≠ реальное)

Отсортировано по вредоносности.

### 3.1 Клиент верит `ReturnUser`, сервер шлёт полный документ с хешем

- `client/src/modules/admin/users/admin.users.api.ts:5-14` — все методы
  типизированы `ReturnUser`/`ReturnUserList` (`Omit<UserBase,'password'>`,
  `shared/types/user.types.shared.ts:38`). Реально: `findAll`/`findById`/
  `create`/`update` возвращают документ целиком
  (`server/src/modules/users/users.repository.ts:10,12,57,65`), контроллер
  отдаёт как есть. Честна только `findList` (`$unset`, `:27`).
- Чем грозит: в рантайме объекты admin-панели содержат `password`, которого
  нет в типе — TS не поймает ни случайный вывод поля в таблицу, ни его
  утечку при пере-отправке объекта на сервер (`{...user}` в payload).
  *Security-аспект — update_3 H3.*
- Тот же паттерн внутри одного модуля: `UpdateProfileResponse extends
  ProfileBase` (без password, `shared/types/profile.types.shared.ts:12`), а
  `profile.service.ts:57` возвращает `{...updatedUser, _id: ...}` — spread
  обходит excess-property-check, компилятор не видит, что password уезжает
  (update_3 L2). Контракт `ProfileResponse` рядом (`profile.service.ts:19-35`)
  собран честным whitelist'ом — эталон есть в том же файле.

### 3.2 `deleteUser` типизирован `Promise<ReturnUser>`, фактически резолвится в `null`

- Сервер отвечает 204 без тела (`users.controller.ts:34`); fetcher на 204
  возвращает `null as T` (`client/src/shared/api/fetcher.ts:11-13`);
  `admin.users.api.ts:13` заявляет `Promise<ReturnUser<string>>`.
- Обобщение: `parseResponse` дважды делает `null as T` (`fetcher.ts:12,24`) —
  **любой** вызов fetcher'а с не-JSON/204 ответом получает `null` под маской
  `T`. Первый же `res._id` на таком ответе — TypeError в проде, который типы
  обещали не допустить.
- Та же пара «204 против типа» у reports: `deleteReport` в
  `client/src/modules/profile/profile.api.ts` (сервер:
  `reports.controller.ts:148-151` — 204).

### 3.3 Multipart-роуты объявлены с JSON-`Body`, которого не существует

- `server/src/modules/profile/profile.routes.ts:15` —
  `app.patch<{ Body: UpdateProfileDto }>('/upload/avatar', ...)`: тело —
  multipart-стрим, `request.body` в хендлере не существует; контроллер парсит
  `request.parts()` (`profile.controller.ts:22`). Тип обещает поля, которых
  нет; любой, кто «доверится» и прочитает `request.body.name`, получит
  undefined без ошибки компиляции. (Разность вариаций multipart — update_4
  срез 5; здесь именно лживый Body-тип.)

### 3.4 `!` на `findOne(...)` — оператор не делает того, что задумано

- `server/src/modules/reports/reports.repository.ts:93` —
  `return collection.findOne({...})!`. Non-null assertion применяется к
  **Promise**, а не к его результату: `Promise<Report | null>` так и остаётся
  `Promise<Report | null>`, `!` — мёртвый оператор. От поломки спасает только
  то, что сервис перепроверяет (`reports.service.ts:79`). Соседний `update`
  в том же файле делает правильно — явный null-check + `notFoundError`
  (`reports.repository.ts:96-103`) — эталон в двух строках ниже.

### 3.5 `jwt.verify` через аннотацию — это скрытый cast

- `auth.service.ts:80` (`const payload: PayloadRefresh = jwt.verify(...)` в
  changePassword), `:189` (payloadOld), `:197-201` (logout) — generic
  `verify<T>` выводится из аннотации и **ничего не проверяет**: аннотация =
  `as`. В `refresh()` после этого стоит runtime-проверка
  `payload.type !== 'refresh'` (`:169`), а в `changePassword` — нет: cookie с
  access-токеном пройдёт как `PayloadRefresh`, и `remember` окажется
  `undefined` при типе `boolean` (молча уедет в `getAccessAndRefreshTokens` и
  в `setCookie` как falsy).
- Родственное: `server/src/types/fastify.d.ts:17-21` объявляет
  `user: JwtUserPayload` (access-payload) для любого `jwtVerify` — после
  верификации refresh-токена тип врёт; страхует только ручная проверка
  `user.type !== 'access'` в guard'е (`authRole.guard.ts:17`).

### 3.6 `aggregate<T>` — генерик как непроверяемый cast

- `users.repository.ts:46` (`aggregate<ReturnUserList<ObjectId>>`) и
  `reports.repository.ts:80` (`aggregate<AggregateReturn>`) — тип результата
  задан руками и никак не связан с пайплайном. Сегодня оба честны (в users
  password вырезан `$unset`'ом), но любое изменение пайплайна тип не заметит —
  это единственные места, где «тип ответа списков» вообще задан, и держатся
  они на дисциплине.
- Рядом: `users.service.ts:23` — `(await repo.findList(params))[0]` без
  проверки. Из-за отсутствия `noUncheckedIndexedAccess` на сервере тип —
  не-nullable; reports-сервис тот же `[0]` перепроверяет
  (`reports.service.ts:57`). Для `$facet` пустой массив невозможен, так что
  практического бага нет — но одинаковый код в двух модулях типизирован
  с разной честностью.

### 3.7 `accessToken!` при разборе заголовка

- `auth.controller.ts:88,91` —
  `request.headers.authorization?.split(' ')[1]` даёт `string | undefined`,
  дальше `service.logout(refreshToken, accessToken!)`. При заголовке без
  токена (`Authorization: Bearer`) в `logout` уедет `undefined`,
  `jwt.verify(undefined)` бросит, catch внутри `logout`
  (`auth.service.ts:199-204`) молча проглотит — **Redis-ключи не удалятся**,
  но клиент получит успех. `!` спрятал ветку, которую стоило обработать 401-м.

## 4. Конфигурация, расходящаяся с реальностью

### 4.1 Диф `.env*` ↔ реально читаемые переменные

Читаемые сервером переменные (grep `process.env` по `server/src`):
`JWT_SECRET, COOKIE_SECRET, REDIS_URL, MONGO_DB_CONNECT, MONGO_DB_NAME,
UPDATE_PAGES_DATA, MAILER_IS_ACTIVE, MAILER_HOST, MAILER_PORT, MAILER_FROM,
NODE_ENV`. Клиентом: `SERVER_PORT` (только vite.config), `VITE_API_URL`,
`VITE_SITE_NAME`.

| Переменная | Кто читает | .env | .env.example | .env.production | Расхождение |
|---|---|---|---|---|---|
| JWT_SECRET / COOKIE_SECRET | `configs/index.ts:17`, `jwt.ts:6`, `app.ts:28` | ✓ (слабые) | ✓ | ✓ (слабые) | значения = имена переменных → update_3 C1/L1, здесь не разбирается |
| REDIS_URL | `plugins/redis.ts:6-9` (обязателен) | — | — | — | только в docker-compose (известно из update_1); вне докера старт падает |
| MONGO_DB_CONNECT / MONGO_DB_NAME | `mongodb.ts:8-12` (обязательны) | ✓ | ✓ | ✓ | текст ошибки требует несуществующие `MONGODB_URL`/`MONGODB_NAME` (`mongodb.ts:12`) — диагностика отправит искать не те переменные |
| UPDATE_PAGES_DATA | `plugins/seeds.ts:8` | ✓ (true) | ✓ | ✓ | ок |
| **MAILER_IS_ACTIVE** | `mailer.ts:38` | **—** | ✓ (false) | **—** | см. 4.2 — мейлер выключен везде |
| MAILER_HOST / MAILER_PORT | `mailerTransporter.ts:6-7` | ✓ | ✓ | **—** | в prod при включении мейлера бросит `mailer.ts:44` на **первом письме**, не на старте |
| MAILER_FROM | `mailer.ts:29-30` | ✓ (плейсхолдер) | ✓ | **—** | то же |
| NODE_ENV | `auth.config.ts:1`, `seeds.loader.ts:51`, `fsStorage.service.ts:14` | — | — | — | задаётся compose'ом; dev=development → 30-дневные токены (update_3 H1) |
| SERVER_PORT | compose-маппинг + `vite.config.ts:17` | 7101 | 3001 | — | app всегда слушает 3000 (`server.ts:9`); vite-fallback 4100 ≠ compose-fallback 3000 (известно из update_1): без .env прокси смотрит в пустоту |
| CLIENT_PORT / REDIS_PORT | только compose-маппинги | ✓ | ✓ | — | ок (задокументировано) |
| PRODACTION_PORT | `docker-compose.prod.yml:9` | ✓ | ✓ | ✓ | опечатка в имени (production), закреплена во всех файлах и CLAUDE.md |
| VITE_API_URL | `fetcher.ts:5` | — | — | — | нигде не задан и не задекларирован в `env.d.ts` (там только VITE_SITE_NAME) — типизирован `any` через index-signature vite/client; fallback `/api` работает всегда |
| VITE_SITE_NAME | `router/index.ts:7`, `env.d.ts:4` | — | — | — | см. 4.3 — задать её негде |

### 4.2 Mailer фактически отключён во всех окружениях — и это никак не видно

- `mailer.ts:38-41`: при `MAILER_IS_ACTIVE !== 'true'` письмо не отправляется,
  а **печатается в console.log** — включая код сброса пароля. Переменной нет
  ни в `.env`, ни в `.env.production` → и dev, и prod живут на заглушке.
- Чем грозит в prod: `forgot-password` отвечает пользователю успехом, письмо
  не уходит никогда, а одноразовый код оседает в docker-логах (однострочный
  security-отсыл в формате update_3: утечка кода сброса в логи + тихая
  недоставка). MAILER_HOST/PORT/FROM в dev `.env` — инертные строки,
  создающие впечатление настроенной почты.
- Если переменную включат в prod — упадёт не на старте, а на первом письме
  (`mailer.ts:44-46`), т.к. MAILER_* в `.env.production` нет: fail-fast
  `initEnv` про mailer не знает.

### 4.3 VITE_-переменные невозможно задать: envDir не настроен

- `vite.config.ts:16` читает корневой `.env` через `loadEnv(mode, rootDir)` —
  но это работает **только для самого конфига** (SERVER_PORT). Для
  `import.meta.env.*` vite использует `envDir`, который не задан → ищет
  `.env` в `client/`, где его нет (и он в `.gitignore`).
- Итог: `VITE_SITE_NAME` задекларирована в `env.d.ts:4` и прочитана в
  `router/index.ts:7`, но даже добавление её в корневой `.env` ничего не
  изменит — всегда работает fallback `'VFC'`. Тип обещает настраиваемость,
  конфигурация её не даёт.

### 4.4 docker-compose dev против prod (сверх известного из update_1/3)

- `docker-compose.yml:60-61` — volumes `server_modules`/`client_modules`
  объявлены и **никем не смонтированы** — мёртвый конфиг, вводит в заблуждение
  о том, где живут node_modules.
- `docker-compose.yml:29-30` — client-контейнер получает весь `.env` через
  `env_file`, включая JWT_SECRET/COOKIE_SECRET, которые vite не нужны
  (однострочный отсыл к формату update_3: лишняя поверхность для секретов).
- Redis: prod — `--appendonly yes` (`docker-compose.prod.yml:34`), dev — без
  AOF: рестарт dev-redis теряет свежие refresh-токены (все разлогинены) —
  расхождение поведения, которое выглядит как баг auth.
- `Dockerfile.server:8`/`Dockerfile.client:8` — `pnpm install` **без**
  `--frozen-lockfile` (prod-сборка — с ним, `Dockerfile.prod:6,16`): dev-образ
  может молча уехать от lockfile.
- Рядом: в `client/` лежат **два lockfile** — `pnpm-lock.yaml` (используется
  докером) и `package-lock.json` от npm (свежее по mtime) — параллельная
  история установок; сейчас pnpm-lock синхронен package.json (проверено по
  specifier'ам), но двойник провоцирует дрейф.
- Раскладка shared в контейнерах держится на совпадении относительного пути:
  `COPY shared /shared` + WORKDIR `/app` ⇒ `../shared` резолвится. Работает,
  но это неявный контракт между Dockerfile и tsconfig paths.

## 5. Инвентарь дыр в типах (`any` / `as` / `!` / ts-ignore)

Полный список по src обоих пакетов (node_modules/сгенерированное исключено).

**Server — `any` (11):**
- `content.repository.ts:14,23,28` — `filter: any` ×3. Особенно обидно:
  `hide?: boolean` и `page?: boolean` **есть** в типах
  (`form.types.shared.ts:137,124`) — `Filter<PageDataMongoDB>` типизировал бы
  фильтр без единого изменения данных; сейчас опечатка в имени поля фильтра
  уедет в Mongo молча (фильтр просто перестанет фильтровать).
- `content.types.ts:16` — `FormConfigMongoDB extends FormConfig<any>` —
  `initionalValues` любого конфига нетипизирован по всей цепочке.
- `mongodb.init.ts:3` — `indexes?: any[]`.
- `seeds.service.ts:40,44` — `{ $set: { lang: 'ru' } as any }`;
  `seeds.expander.ts:17,26` — `base: any` + `opt: any`.
- `auth.service.ts:46,258` — `catch (e: any)`; `any` прячет конкретный баг
  приоритета операторов в `:47,259`: `e?.message+'' || 'Mailer error'` — при
  отсутствующем message получается строка `"undefined"` (truthy), fallback
  недостижим — в ответ клиенту уходит INTERNAL_ERROR c текстом «undefined».

**Server — `as` (ключевые):**
- `Readable.from(buffer) as typeof file.file` ×5 — `profile.controller.ts:30`,
  `files.controller.ts:28,54`, `reports.controller.ts:77,118`: Readable
  выдаётся за BusboyFileStream; работает, пока никто не позовёт
  busboy-специфичные методы (`.truncated`).
- `part.fieldname as keyof CreateReportPayload` / `as keyof UpdateReportDto` —
  `reports.controller.ts:79,124`: **любое** имя поля из multipart-формы
  становится «валидным ключом» DTO — лишнее поле от клиента молча попадает в
  payload (и дальше в `$set`, см. mass-assignment-заметку update_3).
- `part.value as string` — `files.controller.ts:30,56`.
- `errors.handler.ts:28` (`as FastifyError` — за runtime-проверкой, ок),
  `seeds.loader.ts:10-40` / `seeds.service.ts:19-25,58-85` — `as` после
  type-guard'ов (приемлемо), `imageResize.worker.ts:12` — `workerData as
  WorkerData` (IPC-границу иначе не типизировать).

**Server — non-null `!` (3):** `jwt.ts:6` (задокументировано initEnv — ок),
`auth.controller.ts:91` (см. 3.7), `reports.repository.ts:93` (см. 3.4 —
мёртвый оператор).

**Client — `any` (14):**
- `shared/api/fetcher.ts:66` — `query?: Record<string, any>` (+ единственный
  ручной eslint-disable в проекте, `:65`).
- Кеш vue-query правится вслепую: `useAdminFileMutations.ts:43,56,75` и
  `useAdminFolderMutations.ts:25,38,52` — все `setQueryData((oldData: any) =>
  ...)`; `:56` вдобавок `oldData.filter(...)` без `?` — если кеша ещё нет,
  это TypeError в рантайме, который тип скрыл (соседние строки используют
  `oldData?`).
- `App.vue:15` (layoutsMap), `FormGenerator.vue:29,38` (componentMap +
  `value: any` — вся форма-генерация нетипизирована в точке связывания),
  `shared/types/form.types.ts:4` (`FormValues = Record<string, any>` —
  значения всех форм), `useGetBreakpointVariables.ts:6`, `useDeepMerge.ts:1`,
  `TestInputs.vue:19`.

**Client — non-null `!` (5):** `AdminPagesDataPage.vue:35`
(`selectedPageId.value!` в queryFn — страхуется `enabled`),
`useReports.ts:34` (`options.itemId!` — то же), `AdminFilesPage.vue:30` и
`useStorageNavigation.ts:49` (`crumbs[crumbs.length-1]!._id` — на пустых
крошках упадёт), `Slider.vue:71` (`dataset.index!` + `as HTMLElement`).

**`@ts-ignore`/`@ts-nocheck`:** только в сгенерированном
`client/src/types/components.d.ts` (норма для unplugin). Ручных подавлений в
написанном коде нет — хороший знак.

**Дубль глобального типа:** `ExplicitPick` объявлен дважды —
`server/src/types/globals.d.ts:4` и `client/src/types/globals.d.ts:4`
(построчные близнецы). Сам тип полезный (валит компиляцию при необработанных
полях), но копии разъедутся, а shared его использовать не может (у shared нет
своего окружения компиляции).

## 6. Резолв импортов: alias `'src/...'` и хрупкий инвариант сидов

- Alias-стиль `from 'src/...'` — ровно в 7 импортах: `auth.service.ts:10,11`,
  `auth.routes.ts:5`, `profile.service.ts:10`, `reports.service.ts:1`,
  `upload.service.ts:10`, `files.controller.ts:7`; остальной сервер — на
  относительных путях. Держится на трёх опорах сразу: tsconfig paths
  (`server/tsconfig.json:13-16`), tsx (dev) и esbuild/tsup (build, с
  `noExternal: [/^@shared/]` в `tsup.config.ts:9`). Работает во всех текущих
  сценариях; сломается в любом инструменте, который не читает tsconfig
  (ts-node, node --loader, будущий vitest сервера).
- **Сиды — единственное место, где сборка не бандлит**: `build-seeds.mjs:3-8`
  транспилирует `src/seeds/data/**` файл-в-файл без `bundle`, импорты остаются
  как есть. Сегодня все импорты в seed-файлах — `import type` (проверено
  grep'ом: только `../../seeds.types` и `@shared/types/form/pages`), esbuild их
  стирает, поэтому prod-сидинг жив. Но инвариант «в seeds/data только
  type-импорты» нигде не закреплён: первый же value-import (константа из
  `@shared/constants`) даст в `dist/data/*.js` неразрешимый специфаер — и
  **упадёт только прод при старте** (dev через tsx продолжит работать).
- `@shared` резолвится тремя независимыми механизмами, которые обязаны
  совпадать: tsconfig paths сервера (`tsconfig.json:14`), tsconfig клиента
  (`tsconfig.app.json:14`), vite alias (`vite.config.ts:61-63`), плюс tsup
  noExternal. Четыре места на один маппинг — при переносе shared меняется
  всё сразу.
- Мелочь: `tsconfig.app.json:7` включает `src/components.d.ts`, а файл
  генерится в `src/types/components.d.ts` (`vite.config.ts:30`) — мёртвая
  запись include (покрывается `src/**/*`, вреда нет, но врёт о раскладке).

## 7. Линтеры: конфиги есть, запуска нет, долг копится

- Конфиги на месте: `server/eslint.config.js` (recommended + TS; но
  `no-unused-vars` и `no-explicit-any` понижены до warn — `:26,28`),
  `client/eslint.config.ts` (create-vue: vue + ts + oxlint + skipFormatting),
  prettier у обоих (`server/.prettierrc`, `client/.prettierrc.json`). shared
  не покрыт **ничем**: серверный lint-скрипт ограничен `src/`
  (`server/package.json:10`), клиентский — своим деревом.
- Запускается только руками: scripts есть, CI/hooks нет. Клиентский и руками
  не запустится (раздел 2).
- Фактический прогон серверного eslint: **79 проблем (23 errors, 56
  warnings)**. Показательные:
  - `no-undef 'ExplicitPick'` (`users.types.ts:7`) — конфиг не знает
    TS-глобалов (правило `no-undef` не отключено для TS, как рекомендует
    typescript-eslint) → false positive, приучающий игнорировать errors;
  - мёртвые импорты, подтверждающие «линт не запускается»:
    `upload.service.ts:3-9` (все 5 error-фабрик не используются),
    `folders.controller.ts:2` (validationError), `mongodb.ts:2` (ObjectId,
    Db), `mongodb.init.ts:1` (MongoClient), `users.types.ts:3`;
  - `server.ts:15` — unused `err` в catch: сервер при падении `listen` делает
    `process.exit(1)` **не напечатав ошибку** — unused-предупреждение здесь
    указывает на реально проглоченную диагностику;
  - `no-async-promise-executor` — `mailerTransporter.ts:14`.
- Мёртвый файл целиком: `services/mailer/checkMailDelivery.ts` — экспорт без
  единого импорта.

## 8. Зависимости и логгер

- **Мёртвые прод-зависимости сервера** (0 импортов в `server/src`, проверено
  grep'ом): `mongoose` (^9.0.1), `zod`, `fastify-type-provider-zod`,
  `@sinclair/typebox` (`server/package.json:31,37,39,43`). Первые два известны
  из update_1; typebox и type-provider — новые. Это не только вес образа:
  mongoose@9 в package.json создаёт ложное впечатление второго ODM и его
  версия будет «обновляться» вхолостую.
- `pino` в dependencies (`server/package.json:41`) — прямого импорта нет;
  логгер приходит из fastify (`logger: true`). Дубль версии рядом с
  fastify-встроенной — кандидат на удаление после проверки.
- Клиент: `@vitejs/plugin-basic-ssl` (devDeps) не импортируется —
  `vite.config.ts:36-39` читает ручные сертификаты из `.cert.dev`. Остальные
  зависимости клиента используются (vue-quill — в
  `shared/ui/inputs/Quill/*`).
- **Логгер**: `app.ts:22-24` — `Fastify({ logger: true })`, и всё. Нет
  `redact` (authorization, cookie, set-cookie), нет уровней по окружению —
  prod и dev пишут одинаково (info). Сегодня утечки нет — дефолтные
  сериализаторы fastify headers не логируют, — но первый же
  `log.info(request.headers)` или кастомный сериализатор отправит
  Bearer-токены в логи без страховки; а `errorHandler`
  (`errors.handler.ts:9`) уже логирует произвольный `error` целиком, включая
  всё, что в него вложили. Плюс два канала логов (`console.*` в
  seeds/mailer/upload) — зафиксировано в update_4 срез 2, не дублирую.

---

## Сводная таблица

| Срез | Находок | Худшая | Ключевые файлы |
|---|---|---|---|
| 1. Ворота компилятора | 4 | сервер не проходит tsc нигде и никогда (сейчас чист — ворота бесплатны) | `server/package.json`, `server/tsconfig.json`, `tsup.config.ts` |
| 2. Хостовый тулинг клиента | 1 | все симлинки node_modules → `vue_fastify_cms1`: lint/type-check/test клиента на хосте мертвы | `client/node_modules/*` |
| 3. Типы, которые врут | 7 | клиент верит `ReturnUser` без password там, где сервер шлёт полный документ | `admin.users.api.ts`, `users.repository.ts`, `fetcher.ts:12`, `profile.routes.ts:15`, `reports.repository.ts:93` |
| 4. Конфигурация vs реальность | 9 | mailer молча выключен в prod: коды сброса — в stdout, письма «отправляются» | `mailer.ts:38`, `.env.production`, `vite.config.ts:16`, `docker-compose.yml:29,60` |
| 5. Инвентарь any/as/! | 11 any + 5 any (client 14) + 8 `!` | `catch(e:any)` + precedence-баг → ошибка «undefined»; `as keyof` легализует чужие поля из multipart | `content.repository.ts`, `auth.service.ts:47`, `reports.controller.ts:79`, `useAdminFileMutations.ts` |
| 6. Резолв импортов | 3 | сиды держатся на незакреплённом инварианте «только import type» — value-import уронит prod-старт | `build-seeds.mjs`, `seeds/data/*`, `server/tsconfig.json:13` |
| 7. Линтеры | 5 | линт нигде не запускается: 79 проблем на сервере, клиентский не запускается физически | `server/eslint.config.js`, `upload.service.ts:3-9`, `checkMailDelivery.ts` |
| 8. Зависимости и логгер | 4 | 4 мёртвые прод-зависимости; pino без redact и уровней | `server/package.json`, `app.ts:23` |
