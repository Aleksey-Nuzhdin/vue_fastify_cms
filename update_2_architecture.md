# Фаза 1 — архитектурный разбор VFC (2026-07-09)

Фокус: границы модулей, дублирование, нарушения слоёв, циклические зависимости,
толстые контроллеры. Отсортировано по влиянию на поддерживаемость.
Стиль/форматирование не рассматривались. Security-находки — только пометки для фазы 2.

**Общий вердикт**: модульная структура здоровая, циклических зависимостей нет
(auth→users, profile→users, все→common/services — ациклично). Клиент заметно
чище сервера. Главные болячки — мёртвая система ошибок, копипаста multipart и
три разных политики сериализации пользователя.

---

## 1. Система ошибок написана, но не подключена (cross-cutting, quick win)

- `server/src/common/errors/errors.handler.ts` — `errorHandler` с единым форматом
  `{success:false, error:{code,message}}` **нигде не регистрируется**:
  `setErrorHandler` в проекте не вызывается ни разу (grep пуст).
- Ошибки — plain-объекты (`errors.factory.ts:8`), не `Error`. Fastify отдаёт их
  дефолтным хендлером в формате `{statusCode, error:'<статус-текст>', message}`;
  поле `code` теряется, stack trace в логах нет.
- Клиент при этом ждёт именно задуманный формат: `fetcher.ts:145-146` читает
  `apiError?.error?.code` и `apiError?.error?.message` — у дефолтного ответа
  `error` это строка → клиент **всегда** показывает `UNKNOWN_ERROR` /
  «Request failed with status N». Вся система кодов и человеческих сообщений
  об ошибках фактически не работает.
- Починка: `app.setErrorHandler(errorHandler)` в `app.ts` + прогнать клиентские
  сценарии ошибок. Одна строка — максимальный эффект.

## 2. Три политики сериализации пользователя (граница repository ↔ API)

- `users.repository.ts:10,12` — `findAll`/`findById` возвращают документ целиком,
  **включая `password` (bcrypt-хеш)**; `create`/`update` тоже (`:57,65`).
  Контроллер отдаёт как есть: `/api/users/all` (admin), `/item/:id`
  (vereficator!), ответы create/update.
- `users.repository.ts:27` — `findList` наоборот делает `$unset: ['password',...]`.
- `profile.service.ts:22-34` — третий вариант: ручная белая проекция полей.
- Чем грозит: любое новое поле в user надо не забыть в 2 местах из 3; хеши
  паролей уже сейчас уезжают в админку. → Единая проекция на уровне repository
  (либо `toPublicUser()` в одном месте). *Security-аспект — в фазу 2.*

## 3. Копипаста multipart-парсинга ×5 + буферизация в память

Один и тот же цикл `for await (part of parts)` + `toBuffer()` + `Readable.from`:
- `profile.controller.ts:22-33` (uploadAvatar)
- `files.controller.ts:19-32` (create) и `:45-58` (update)
- `reports.controller.ts:61-92` (create) и `:105-143` (update)

Весь файл (до 100MB по лимиту `app.ts:36`) буферизуется в память на каждый
запрос. Нужен общий хелпер `parseMultipart()` в `common/`, в идеале —
стриминг в fs без промежуточного буфера (fsStorage уже принимает stream).

## 4. Регистрация «registration» продублирована в auth и users

- `auth.service.ts:226-263` (registration) и `users.service.ts:26-43` (create)
  независимо делают: findByEmail-проверку, bcrypt.hash(12), дефолт роли.
- Политики уже разъехались: auth нормализует email
  (`trim().toLowerCase()`, `auth.service.ts:245`), users.create — **нет** →
  админ может завести `User@Mail.ru`, и `findByEmail` при логине его не найдёт
  (логин той же почтой в другом регистре создаст дубля через регистрацию).
- Направление: auth.registration должен вызывать users.service.create (или общий
  `createUserWithPassword`), а не свою копию.

## 5. Толстые контроллеры и логика, размазанная по слоям (reports, files)

- `reports.controller.ts:55-95,97-146` — контроллер вручную собирает payload,
  парсит JSON авторов (`parseAuthors:18-38`), ветвит статусы; затем
  `reports.service.update:84-137` повторно ветвит по ролям и заново решает,
  что можно менять. Правила «кто что может» размазаны по двум слоям.
- `files.controller.ts:60-64` строит `buildUpdate`, и `files.service.update:97-101`
  строит `buildUpdate` **ещё раз** — частичный апдейт конструируется дважды на
  разных слоях.
- Чем грозит: при изменении правил (например, новый статус) надо синхронно
  править 2 места; забыл одно — тихое расхождение.

## 6. Storage: три стиля навешивания guard'ов в одном модуле

- `storage.routes.ts:17` — `addHook(preHandler, requireManager)` на весь роутер;
- `files.routes.ts:14-15` — вложенный `register` + `addHook(requireAdmin)`;
- `folders.routes.ts:17` — точечный `guardAdmin` только на `/all`.

Итоговая матрица прав (files=admin; folders CRUD=manager; folders `/all`=admin;
`/folderData/:id`=manager) нигде не видна целиком — её надо вычислять из трёх
файлов. Плюс опечатки: файл `storage.contraller.ts`, тип `FoldersController`
у storage-контроллера (`storage.contraller.ts:15`).

## 7. Конвенция «/upload»-префикса размазана по 6+ местам

- fsStorage возвращает пути с `/upload/` (`fsStorage.service.ts:33,57`);
- сервисы срезают его обратно: `profile.service.ts:69`, `reports.service.ts:120,146`;
- `upload.controller.ts:16` — `.replace('upload','')` (первое вхождение где угодно);
- fsStorage сам же срезает: `:125,154,183` — `.replace(/^\/upload\//,'/')`.
- Корень хранилища определён **дважды разными способами**: `app.ts:39` —
  `process.cwd()/public/upload`; `fsStorage.service.ts:20` — от `__dirname`
  с веткой `isProd ? 'app/public' : 'public'`. Если cwd ≠ ожидаемому, файлы
  пишутся в одно место, а раздаются из другого.
- Направление: один модуль-константа (`uploadRoot`, `toDiskPath()`, `toUrlPath()`).

## 8. Клиент: reports API и типы продублированы в двух модулях

- `profile.api.ts:12-25` и `admin.reports.api.ts:5-14` оборачивают одни и те же
  5 эндпоинтов `/reports/*`; типы `ReportBase`/`ResponseReportList` живут и в
  `profile.type.ts`, и в `admin.reports.type.ts`, при том что есть
  `shared/types/report.types.shared.ts`.
- Также reports-CRUD пользователя живёт внутри модуля profile
  (`useReports.ts`), хотя это отдельный домен. Направление: единый
  `reports.api.ts` + типы из `@shared`.

## 9. Противоположная семантика `roles: []` на сервере и клиенте

- Сервер: пустой массив/`undefined` = «достаточно авторизации»
  (`authRole.guard.ts:23`).
- Клиент: пустой массив = «не пускать никого» (`routes.guard.ts:43-45` —
  `[].includes(role)` всегда false) — страница `/guard` (`routes.ts:113-118`)
  недоступна никому.
- Риск: перенос интуиции с одного слоя на другой даёт дыру или блокировку.
  Решить, какая семантика верная, и выровнять (плюс убрать/починить `/guard`).

## 10. Потерянные await и проглоченные ошибки

- `folders.service.ts:38` — `repo.delete(id)` **без await**: ответ уходит до
  фактического удаления, ошибка Mongo молча теряется.
- `files.service.ts:114-115` — `catch (error) { throw internalError() }` —
  оригинальная ошибка не логируется и не попадает никуда.
- `reports.controller.ts:35` — `catch {}` у parseAuthors: битый JSON авторов
  молча превращается в пустой список.

## 11. `new ObjectId(id)` без валидации во всех репозиториях

`users.repository.ts:12`, `content.repository.ts:38`, folders/files/reports —
невалидный `:id` в URL кидает `BSONError` → 500 (generic) вместо 400.
Один хелпер `toObjectId(id)` с `validationError` закрыл бы всё.

## 12. Мёртвый код и пустые заготовки

- `server/src/modules/index.ts` — `registerModules` никем не импортируется.
- Закомментированные блоки: `users.routes.ts:23-24`, `storage.routes.ts:24-27`,
  `routes/index.ts:33-48`, `auth.controller.ts:112-118`.
- Клиент: пустые `modules/users/` (роуты закомментированы в `routes.ts:120-140`)
  и `stores/`; `useReports.ts:92-93` — `isFetcherError(res)` на resolved-значении
  (мёртвая ветка: fetcher бросает, а не возвращает ошибку).

---

## Прочие наблюдения (не проблемы, зафиксировать)

- DI-контейнера нет — фабрики пересоздаются в каждом routes-файле
  (`createUsersRepository` вызывается в 3 модулях). При stateless-фабриках это
  безвредно, но единая точка сборки упростила бы будущие тесты.
- Клиентская архитектура последовательная: единый `fetcher`, vue-query в admin,
  один Pinia-store. Отклонение по стилю только в `useReports.deleteReport`
  (`setQueryData` вместо `invalidateQueries`, ошибки наружу).
- `resizeInProgress` (`fsStorage.service.ts:60`) — дедупликация ресайзов есть;
  нет только лимита на число параллельных воркеров (уточнено в backlog).

## Замечено мимоходом → в фазу 2 (security), здесь не анализировалось

- `reports.service.ts:29-31` — `findById` без проверки владельца: любой
  авторизованный читает чужой доклад по id (IDOR).
- `reports.service.ts:38-54` — не-админ может передать `?userId=<чужой>` в
  `/reports/list` и получить чужие доклады: закомментированная проверка
  строк 38-40 как раз должна была это закрывать.
- Утечка password-хешей из users-эндпоинтов (см. п.2).
- `getPageDataList` — публичный `?showHidden=true` отдаёт скрытый контент
  (`content.controller.ts:19`) — решить, фича это или дыра.

## Топ-5 «быстрых побед» (эффект/стоимость)

| # | Действие | Стоимость |
|---|----------|-----------|
| 1 | `app.setErrorHandler(errorHandler)` + сверить контракт с клиентом | ~1 строка + проверка |
| 2 | Проекция user без `password` в users.repository (или общий `toPublicUser`) | малая |
| 3 | `await` в `folders.service.delete` + логирование в `files.service.delete` | тривиальная |
| 4 | Общий `parseMultipart()` хелпер | средняя |
| 5 | Нормализация email в `users.service.create` (как в auth) | малая |
