# Фаза 3 — аудит консистентности VFC (2026-07-10)

Фокус: «одна задача, решённая в разных модулях по-разному». Для каждого среза
выбран эталон — самый чистый из уже существующих в проекте вариантов — и
перечислены отклонения от него с `file:line`. Ничего не чинилось.
Severity/эксплуатация — в `update_3_security.md`, здесь не повторяется;
слои/связность как таковые — в `update_2_architecture.md`.

**Тезисы.**
- Каркас у всех модулей один (routes → controller → service → repository через
  фабрики), но почти каждый сквозной вопрос — guard'ы, статусы ответов,
  проекции, пагинация, ObjectId — решён 2–3 способами.
- Самое дорогое: три политики сериализации user и «почти близнецы» пагинации
  (users/reports) с разными именами полей и разными дефолтами limit.
- В storage — три стиля guard'ов и опечатка в имени файла; итоговую матрицу
  прав не видно ни в одном месте.
- Клиент однороднее сервера: vue-query везде, единый fetcher. Но reports API
  обёрнут дважды, мутации сделаны тремя стилями (invalidateQueries /
  setQueryData / единственный useMutation), контракт ошибок композаблов гуляет
  (popup+boolean / error-объект / throw), query-string собирается двумя
  способами, а пользовательские сообщения — то через i18n, то хардкодом.
- Внутренний эталон уже есть: все `*.types.ts` на сервере и клиенте —
  реэкспорт-шимы из `@shared/types` (дублирование типов, отмеченное в
  update_2 п.8, уже устранено). На эту дисциплину стоит равнять остальное.

Срезы отсортированы по влиянию на поддерживаемость.

**Решения по развилкам** (подтверждены владельцем 2026-07-10, вход для Фазы 5):
1. Опечатки в данных БД — **мигрировать обе**: `vereficator → verificator`
   (документы users) и `initionalValues → initialValues` (formConfigs;
   пересоздаются сидами — миграция почти бесплатная).
2. Семантика `roles: []` — **как на сервере**: пустой массив/отсутствие =
   «достаточно авторизации»; клиентский guard привести к этому, страницу
   `/guard` удалить или дать ей реальные роли.
3. Список пользователей в админке — **admin + vereficator** (как сервер и
   навигация): добавить явные `roles` в meta роутов `/admin/users` и
   `/admin/reports`.
4. Конвенция путей файлов — **в БД остаются URL-пути с `/upload`** (без
   миграции); все конверсии свести в один модуль (`uploadRoot`,
   `toDiskPath()`/`toUrlPath()`), разбросанные `replace` убрать.

---

## 1. Сериализация сущностей: три политики для user, и ни одна не главная

**Эталон**: ручная белая проекция `profile.service.getProfile`
(`server/src/modules/profile/profile.service.ts:22-34`) — единственное место,
где явно перечислено, что уходит наружу. Контракт для неё уже есть в типах:
`ReturnUser = Omit<UserBase,'password'>` (`shared/types/user.types.shared.ts:38`),
но репозитории его не соблюдают. Правильная точка для единой проекции — слой
repository (как задумано в `findList`), с явным списком полей.

**Отклонения**:
- `server/src/modules/users/users.repository.ts:10` (`findAll`), `:12`
  (`findById`), `:57` (возврат из `create`), `:65` (возврат из `update`) —
  документ целиком, включая `password`; контроллер отдаёт как есть
  (`users.controller.ts:11-30`). В эталоне — явный whitelist.
- `server/src/modules/users/users.repository.ts:27` — вторая политика:
  `$unset: ['password','createdAt','updatedAt']` только в `findList`. Blacklist
  vs whitelist эталона: новое чувствительное поле надо не забыть добавить в
  `$unset`, whitelist защищает по умолчанию.
- `server/src/modules/profile/profile.service.ts:57` — внутри одного модуля обе
  политики: `getProfile` фильтрует, а `updateProfile` возвращает
  `{...updatedUser}` — сырой документ с хешем.
- `server/src/modules/reports/reports.repository.ts:10,12` — `findAll`/`findById`
  отдают сырой документ (включая внутренний путь `fileAnnotation`), а соседний
  `findList` (`:36-39`) уже делает `$project: {name:1,email:1}` для
  подмешанного user — половинчатая третья политика.
- `server/src/modules/storage/files/files.repository.ts:49-61` и
  `folders/folders.repository.ts:47-53` — у превью есть `$project`-whitelist, у
  CRUD-методов тех же коллекций (`files.repository.ts:10-39`) — сырой документ.
  Для storage это безвредно (секретов нет), но показывает: политика «что
  проецируем» решается на каждом методе заново.

## 2. Формат ответа и обработка ошибок: контракт ошибок един, контракт успеха — нет

После подключения `app.setErrorHandler(errorHandler)` (`server/src/app.ts:56`)
формат **ошибок** `{success:false, error:{code,message}}` един: фабрика
(`errors.factory.ts`), хендлер (`errors.handler.ts:12-45`), 404
(`routes/index.ts:29-32`) и ожидания клиента (`fetcher.ts:143-147`) сходятся.
Разъезд остался в **успешных** ответах и в дисциплине «не терять ошибку».

**Эталон формы хендлера**: `users.controller.ts` — `return service.x()` для
200, `reply.status(201).send(user)` для создания (`users.controller.ts:25`),
`reply.status(204).send()` для удаления (`:34`). Плюс правило «ошибка либо
пробрасывается в errorHandler, либо логируется» — как в `files.service.create`
(`files.service.ts:60-67`: catch → компенсация → `throw error` без подмены).

**Отклонения — статусы и способ отправки**:
- `reports.controller.ts:94` — create возвращает объект напрямую → **200**, у
  users/files/folders создание — 201.
- `files.controller.ts:70-72` и `folders.controller.ts:20-22` — delete
  возвращает удалённый документ с 200; у users (`users.controller.ts:32-35`) и
  reports (`reports.controller.ts:148-151`) — 204 без тела. Два контракта
  удаления в одном API.
- `files.controller.ts:41,68` и `folders.controller.ts:18` — `reply.code(...)`,
  а `users.controller.ts:25,34` — `reply.status(...)` для того же самого.
- `auth.controller.ts:80` — единственный `reply.send(...)` вместо `return` в
  файле, где все остальные хендлеры возвращают значение (`:52,65,109`).
- `auth.controller.ts:83-99` — `logout`/`logoutAll` не возвращают тело и не
  ставят статус вообще (ни 204, ни объект) — третий вариант «успеха».

**Отклонения — проглоченные ошибки и потерянные await**:
- `reports.controller.ts:35` — `catch {}` в `parseAuthors`: битый JSON молча
  превращается в пустой список авторов.
- `files.service.ts:114-115` — `catch (error) { throw internalError() }`:
  оригинальная ошибка (и от fs, и от Mongo) не логируется и не попадает в
  errorHandler.
- `profile.service.ts:81-82` — тот же паттерн: `catch (error) { throw
  conflictError('User not updated') }` — причина потеряна.
- `folders.service.ts:38` — `repo.delete(id)` без `await`: ответ уходит до
  удаления, ошибка Mongo теряется.
- `auth.service.ts:61` — `redis.del('forgotPassword:'+email)` без `await` (в
  соседних местах того же файла del/setex ждут: `:191,206-207`).
- клиент: `useProfile.ts:66` — `fetcher.refreshToken()` без `await`
  (fire-and-forget среди await-цепочки).
- `upload.service.ts:56` — фоновая ошибка ресайза уходит в `console.error`, а
  не в pino (`request.log`/`app.log`), которым логирует всё остальное
  (`errors.handler.ts:9`); та же смесь `console.*` в
  `seeds.service.ts:47,71,105` и `mailer.ts:39` — фактически два канала логов.

## 3. Guard'ы: три стиля навешивания, в storage — все три сразу

**Эталон**: `reports.routes.ts` — единственный файл, где скомбинированы оба
уместных приёма: общий guard всего роутера одним `addHook`
(`reports.routes.ts:13`) + вложенный `register`+`addHook` для подгруппы с
другой ролью (`:22-25`). Для единичных исключений — точечный options-объект
`guardX`, как в `auth.routes.ts:22-25`.

Матрица «где как»:

| Файл | Стиль | Где |
|---|---|---|
| `reports.routes.ts` | addHook на роутер + вложенный register для `/all` | `:13`, `:22-24` |
| `auth.routes.ts` | точечные `guardAuth`/`guardAdmin` | `:22-25` |
| `users.routes.ts` | два вложенных register+addHook | `:13-14`, `:27-28` |
| `storage.routes.ts` | addHook (`requireManager`) на весь модуль | `:17` |
| `files.routes.ts` | вложенный register+addHook (`requireAdmin`) | `:14-15` |
| `folders.routes.ts` | точечный `guardAdmin` только на `/all` | `:17` |
| `profile.routes.ts` | точечный `guardAuth` ×3 | `:13-15` |
| `content.routes.ts` | точечный `guardAdmin` на PATCH | `:21` |

**Отклонения от эталона**:
- `files.routes.ts:14-23` — вложенный `register` оборачивает **все** роуты
  модуля: это форма «для подгруппы», применённая ко всему файлу; эквивалент —
  один `addHook`, как в storage/reports. Плюс guard'ы складываются со
  storage-уровнем (`storage.routes.ts:17`): фактически requireManager →
  requireAdmin, и итог «files = admin-only» не виден ни в одном файле.
- `folders.routes.ts:17` — задача «этот роут только admin» решена третьим
  стилем в том же модуле storage; сосед files ту же задачу решает вложенным
  register.
- `profile.routes.ts:13-15` — весь модуль под auth, но guard повторён на каждом
  роуте вместо одного `addHook` (стиль reports).
- Экспортируются две параллельные формы одного и того же:
  `requireX` (функции для `addHook`) и `guardX` (options-объекты) —
  `authRole.guard.ts:30-38`; выбор между ними в модулях случаен.

## 4. Repository-паттерны: пагинация-близнецы, ObjectId, buildUpdate

### 4a. Пагинация: два почти одинаковых aggregation с разными контрактами

**Эталон**: `users.repository.findList` (`users.repository.ts:16-47`) — чуть
чище: есть проекция (`$unset`, `:27`), форма `{list, count}` совпадает с
shared-типом `ReturnUserList` (`user.types.shared.ts:40-43`) без переупаковки в
сервисе (`users.service.ts:23` просто берёт `[0]`).

**Отклонения** (`reports.repository.findList`, `reports.repository.ts:14-81`):
- Имена внутри facet: `meta:[{$count:'count'}]` + `list`
  (`users.repository.ts:30-37`) против `meta:[{$count:'total'}]` + `data`
  (`reports.repository.ts:58-64`) — один паттерн, разный словарь.
- Форма ответа наружу: `{list, count}` против `{reports, count}`
  (`report.types.shared.ts:27-30`), причём reports-сервис вынужден
  переупаковывать `total→count, data→reports` (`reports.service.ts:59-62`).
- Дефолт limit: users — **нет** (`users.repository.ts:33`: `$limit` добавляется
  только если limit передан → без него отдаётся вся коллекция;
  `users.service.ts:22-24` дефолт не подставляет), reports — `limit || 10`
  (`reports.service.ts:43`). Одинаковый эндпоинт-паттерн `/list` ведёт себя
  по-разному.
- Проекции нет: reports отдаёт документы целиком (см. срез 1).

### 4b. `new ObjectId(id)` — валидация есть, но через метод

**Эталон**: `folders.repository.update` (`folders.repository.ts:25`) и вообще
files/folders — `ObjectId.isValid` → `validationError` перед конструированием
(`files.repository.ts:13,26,31,42,46,50`, `folders.repository.ts:13,25,40,44,48,55`,
`reports.repository.ts:83`).

**Отклонения** — те же репозитории и их соседи в других методах конструируют
без проверки (невалидный `:id` → `BSONError` → 500 вместо 400):
- `users.repository.ts:12` (findById), `:61,65` (update), `:68` (delete) — во
  всём файле ни одной проверки.
- `reports.repository.ts:12` (findById), `:98,101` (update), `:106` (delete) —
  при том что `create` в этом же файле проверяет (`:83`).
- `files.repository.ts:11` (findById), `:24` (delete) — эталонный модуль сам же
  отступает в двух методах.
- `folders.repository.ts:11` (findById), `:23` (delete) — то же.
- `content.repository.ts:38` (updatePageData) — без проверки.

### 4c. buildUpdate: один раз в сервисе vs дважды на двух слоях

**Эталон**: частичный апдейт строится один раз в сервисе —
`users.service.ts:63-72`, `profile.service.ts:43-52`, `folders.service.ts:75-78`.

**Отклонения**:
- files: `files.controller.ts:60-64` строит `buildUpdate` из multipart-полей,
  затем `files.service.ts:97-101` строит его **ещё раз** из уже построенного.
- reports: контроллер вручную собирает payload с ветвлением по статусам
  (`reports.controller.ts:108-143`), сервис затем повторно ветвит по ролям и
  строит `buildUpdate` в двух ветках (`reports.service.ts:96-103,111-118`) —
  конструирование апдейта размазано на два слоя.
- Клиентская копия той же функции: `useBuildUpdate`
  (`client/src/shared/composables/utils/useBuildUpdate.ts:3-9`) — построчный
  двойник `server/src/common/utils/buildUpdate.ts:1-7`; кандидат в `shared/`.

## 5. Multipart: один цикл скопирован 5 раз, трёх разных сортов

**Эталон** (за неимением общего хелпера): цикл в `files.controller.create`
(`files.controller.ts:24-32`) — минимальная форма «файл + поля в Record». По
факту нужен общий `parseMultipart()` в `common/` (направление уже в update_2
п.3 — здесь фиксируется именно расхождение «нет общего хелпера, копии
разъехались»).

**Отклонения — пять копий, каждая со своими мутациями**:
- `profile.controller.ts:26-33` — упрощённый вариант: берёт только первый файл,
  `break` после него, поля игнорирует.
- `files.controller.ts:24-32` (create) и `:50-58` (update) — файл + `body:
  Record<string,string>` без типизации полей.
- `reports.controller.ts:73-92` (create) — файл + typed payload +
  `parseAuthors` + ветвление статусов; `:112-143` (update) — четвёртая
  вариация: фильтр `part.fieldname !== 'fileAnnotation'`, спец-обработка
  пустой строки.
- Типизация роутов тоже разная: multipart-роут profile объявлен с `Body:
  UpdateProfileDto` (`profile.routes.ts:15`), которого в multipart нет; у
  files/reports роуты без Body-типа (`files.routes.ts:20-21`,
  `reports.routes.ts:18-19`).
- Общее у всех пяти: `part.toBuffer()` + `Readable.from(buffer)` — буферизация
  до 100MB (`app.ts:37`) в память при живом стриминге в fsStorage.

## 6. Клиент: reports API обёрнут дважды, контракт композаблов гуляет

**Эталон**: связка admin-модулей users/reports — api-объект на `fetcher` c
`query`-опцией (`admin.users.api.ts:4-15`), серверный стейт в composable,
чтение через `useQuery` (`useAdminUsers.ts:38-41`), мутации «async-функция +
popup + boolean + `invalidateQueries`» (`useAdminUser.ts:20-44`).

**Отклонения**:
- Дубль API: `profile.api.ts:12-25` и `admin.reports.api.ts:5-14` оборачивают
  одни и те же 5 эндпоинтов `/reports/*`. Именование методов разное: `getReports`/
  `getReportItem` против `fetchReportsList`/`fetchReportItem`. (Типы, в отличие
  от состояния на момент update_2, уже дедуплицированы: `profile.type.ts:1-13`
  и `admin.reports.type.ts:1-17` — реэкспорт из `@shared/types`.)
- Мутации — **три стиля** по модулям: (а) ручной async + `invalidateQueries` —
  admin.users/admin.reports/useReports create+update (`useAdminUser.ts:36-37`,
  `useReports.ts:63,79-80`); (б) ручной async + точечная правка кеша
  `setQueryData` — весь admin.files (`useAdminFileMutations.ts:41-44,54-57,73-76`,
  `useAdminFolderMutations.ts:23-26,36-39,50-53`) и `useReports.deleteReport:95-98`;
  (в) настоящий `useMutation` — единственное место в проекте,
  `AdminPagesDataPage.vue:63-76`. В `useReports.deleteReport:93` вдобавок
  мёртвая проверка `isFetcherError(res)` на resolved-значении — fetcher
  бросает, а не возвращает ошибку.
- Где живёт серверный стейт: у admin.users/reports/files — в composables, у
  pages-data вся работа с useQuery/useMutation лежит прямо в странице
  (`AdminPagesDataPage.vue:23-76`), причём один из запросов минует свой же
  api-объект и зовёт `fetcher` напрямую (`AdminPagesDataPage.vue:43` при
  импортированном `pagesDataAdminApi` строкой выше).
- Контракт ошибок мутаций — три варианта: popup+boolean (эталон,
  `useAdminUser.ts:34-44`, `useReports.createReport:61-71`), возврат
  error-объекта наружу (`useProfile.ts:64-73` saveEdit, `:96-106`
  changePassword; `useForgotPassword.ts:9-30` — гибрид: FetcherError
  возвращает, неизвестное бросает), throw наружу (`useReports.deleteReport:91-99`).
- Сообщения пользователю — i18n против хардкода: эталон `t()` —
  `useProfile.ts:68`, `AdminPagesDataPage.vue:71,74`; захардкоженный русский —
  `useReports.ts:46-52,64`, `useAdminFileMutations.ts:21,47,58,61,77,81`,
  `useAdminFolderMutations.ts:29,40,43,54,57`, `routes.guard.ts:30-34,49-53`.
  Meta-заголовки роутов та же смесь: ключи (`routes.ts:9,15,40,88`) и сырой
  русский (`routes.ts:53,58,64,69,99,111`).
- Query-string двумя способами: `query`-опция fetcher'а (`fetcher.ts:98-104`;
  `profile.api.ts:13`, admin apis) против ручной конкатенации
  `?lang=${...}` — `usePageData.ts:24`, `useConfigData.ts:25`,
  `useOptionList.ts:28`, `pagesData.admin.api.ts:12-14`. В
  `pagesData.admin.api.ts:12` проверка `page !== null` при типе
  `page?: boolean` всегда истинна → в URL уезжает `&page=undefined`.
- Мёртвый/рассинхронённый эндпоинт: `auth.api.ts:27-28` — `GET /content/login`,
  которого на сервере нет (`content.routes.ts:16-21`); нигде не вызывается.
- Латентный рассинхрон формата тела: `admin.users.api.ts:9-10` — `createUser`
  шлёт `FormData` на `POST /users/create`, а сервер ждёт JSON
  (`users.controller.ts:23-26`, multipart там не парсится). Функция не
  используется — упадёт при первом применении.
- Именование api-объектов/файлов: `profile.api.ts` (методы `get*/update*`),
  `admin.reports.api.ts` (`fetch*`), `pagesData.admin.api.ts` (`fetchList`,
  порядок префиксов в имени файла обратный соседям: `pagesData.admin` vs
  `admin.reports`).

## 7. Семантические рассинхроны клиент↔сервер

Эталона тут нет — это пары мест, где одинаковая запись означает разное; для
каждой пары нужно выбрать одну семантику.

- **`roles: []`**: сервер — «достаточно авторизации»
  (`authRole.guard.ts:23`), клиент — «не пускать никого»
  (`routes.guard.ts:43-45`: `[].includes(role)` всегда false). Страница
  `/guard` с `roles: []` (`client/src/router/routes.ts:113-118`) недоступна
  никому.
- **Роли `/admin/users`, три списка для одной страницы**: router-meta пускает
  manager'а (собственных `roles` у роута нет — `routes.ts:100-105`, наследуется
  родительское `['admin','manager','vereficator']`, `routes.ts:79`); сервер на
  `/api/users/list` пускает только admin+vereficator
  (`users.routes.ts:27-31`) → manager получает страницу с 403 на данные;
  навигация же прячет пункт по третьему списку `['admin','vereficator']`
  (`AdminLayout.vue:36,45`).
- **Префикс `/upload`**: в БД пути хранятся с префиксом (fsStorage возвращает
  `join('/upload/',...)` — `fsStorage.service.ts:33,57`), клиент использует их
  как URL как есть (`FileCard.vue:47`, `BaseSelectFileModal.vue:88`), а сервер
  при каждом обращении к диску срезает префикс заново:
  `fsStorage.service.ts:125,154,183`, `profile.service.ts:69`,
  `reports.service.ts:120,146`, `upload.controller.ts:16` (там вообще
  `.replace('upload','')` — первое вхождение в любом месте пути). Корень
  хранилища определён двумя разными способами: `app.ts:40`
  (`process.cwd()/public/upload`) и `fsStorage.service.ts:20` (`__dirname` +
  ветка `isProd`). Конвенция «путь = URL» и «путь = диск» нигде не
  зафиксирована — шесть мест конверсии.
- **Нормализация email**: `auth.service.ts:245` и `:220` — `trim().toLowerCase()`;
  клиент дублирует то же перед отправкой (`auth.store.ts:155`); а
  `users.service.create` (`users.service.ts:27-42`) не нормализует вовсе —
  админ может завести дубль в другом регистре (уже отмечено в update_2 п.4,
  здесь как третья точка одной задачи).

## 8. Сборка модулей: фабрики пересоздаются, второй (мёртвый) реестр

**Эталон**: `content.routes.ts:11-14` / `reports.routes.ts:8-11` — модуль
собирает только свою цепочку repo→service→controller у себя в routes-файле;
регистрация всех модулей централизована в `routes/index.ts:11-22`.

**Отклонения**:
- `createUsersRepository` вызывается в трёх модулях: `users.routes.ts:9`,
  `auth.routes.ts:10`, `profile.routes.ts:9` — три инстанса одного репозитория.
- В storage репозитории files и folders создаются **трижды в трёх файлах
  одного модуля**: `storage.routes.ts:12-13`, `files.routes.ts:9-10`,
  `folders.routes.ts:12-13` — шесть инстансов на модуль. (Фабрики stateless,
  вреда нет, но единая точка сборки нужна для будущих тестов — уже отмечено в
  update_2 «прочие наблюдения»; здесь зафиксирован масштаб.)
- `server/src/modules/index.ts:4-6` — `registerModules` регистрирует только
  users с префиксом `/api/users` и никем не импортируется: второй,
  конкурирующий способ регистрации модулей рядом с рабочим
  `routes/index.ts`.
- Именование роутеров двумя конвенциями: `authRoutes`/`usersRoutes`/
  `contentRoutes`/`profileRoutes`/`reportsRoutes`/`uploadRoutes` против
  `storageRouter`/`filesRouter`/`folderRouter` (`storage.routes.ts:11`,
  `files.routes.ts:8`, `folders.routes.ts:11` — вдобавок `folderRouter` в
  единственном числе при `filesRouter` во множественном).

## 9. Именование и опечатки (сквозное)

**Эталон**: конвенции остального кода — файлы `*.controller.ts`, английские
идентификаторы без опечаток, тип контроллера = имя модуля.

**Отклонения** (только те, что видны в идентификаторах/именах файлов — не
стиль):
- `storage.contraller.ts` — имя файла (`storage.routes.ts:8` импортирует как
  есть); внутри тип назван `FoldersController`
  (`storage.contraller.ts:15`) — коллизия по смыслу с настоящим
  `FoldersController` из `folders.controller.ts:30`; локальная переменная
  `contraller` (`storage.routes.ts:15,19`).
- `serivice` — параметр контроллера (`upload.controller.ts:19,42`).
- `acceessTtlStr`/`acceessTtlSeconds` (`configs/auth.config.ts:20,23,27,29`,
  используются в `auth.service.ts:128,138`) и `refreshTokenPrfix`
  (`auth.config.ts:31`).
- Роль `vereficator` (verificator) — закреплена в рантайм-константе
  `shared/constants/user.constants.shared.ts:4`, guard'ах
  (`authRole.guard.ts:33`), роутах (`users.routes.ts:27-31`), клиентском
  router/nav (`routes.ts:79`, `AdminLayout.vue:36,45`), i18n
  (`ru.json:261`, `en.json:261`) — переименование уже стало миграцией данных
  (роль лежит в документах users).
- `initionalValues`/`InitionalValues` (initial) — системная опечатка контракта:
  `shared/types/form/form.types.shared.ts:125`, все `shared/types/form/pages/*`
  (например `login.pageData.types.shared.ts:11`), сиды
  (`server/src/seeds/seeds.types.ts:81`, `seeds.expander.ts:52`, все
  `seeds/data/forms/*.form.ts`), клиент (`useConfigData.ts:36-47`,
  `useProfile.ts:27-41`) и даже документация скиллов
  (`.claude/skills/create-section/SKILL.md:37`). Лежит в БД (поле документов
  formConfigs) — исправление тоже миграция.
- `usePageBandle` (bundle) — функция в файле с правильным именем
  `usePageBundle.ts:7`; вызывается как `usePageBandle` (`LoginPage.vue:12`).
- Двойной экспорт `loginFormConfig`: `seeds/data/forms/header.form.ts:31`
  (конфиг хедера назван loginFormConfig) и настоящий в
  `seeds/data/forms/login.form.ts:10`.
- Файлы с опечатками: `TestFroms.vue` (Forms), `page-baner.form.ts` (banner).
- Мелкие идентификаторы: `chankSize` (chunk) — `useAdminReports.ts:9`,
  `useAdminUsers.ts:10`; `canselEdit`/`canselCreate` (cancel) —
  `useProfile.ts:76`, `ProfileReportCreatePage.vue:49`,
  `ProfileReportEditPage.vue:50`; `chekRoles` (check) —
  `reports.service.ts:88`.
- Файлы типов на клиенте — две конвенции: `auth.types.ts` (мн. число, как на
  сервере) против `profile.type.ts`, `admin.reports.type.ts`,
  `admin.users.type.ts`, `admin.files.type.ts`, `test.type.ts` (ед. число).
  Сервер единообразен: везде `*.types.ts`.

---

## Сводная таблица

| # | Срез | Эталон | Отклонений | Ключевые файлы |
|---|------|--------|-----------|----------------|
| 1 | Сериализация user/сущностей | whitelist `profile.service.getProfile:22-34` + тип `ReturnUser` | 5 | `users.repository.ts`, `profile.service.ts`, `reports.repository.ts` |
| 2 | Формат ответа и ошибки | `users.controller.ts` (return/201/204) + «throw без подмены» | 5 форм ответа + 7 потерь ошибок/await | `files.controller.ts`, `reports.controller.ts`, `auth.controller.ts`, `folders.service.ts` |
| 3 | Стили guard'ов | `reports.routes.ts` (addHook + вложенный register), точечный `guardX` для исключений | 4 (3 стиля в storage, дубли в profile) | `storage.routes.ts`, `files.routes.ts`, `folders.routes.ts`, `profile.routes.ts` |
| 4 | Repository-паттерны | `users.findList` (пагинация), `folders.update` (isValid), buildUpdate в сервисе | 4a: 4; 4b: 9 мест; 4c: 3 | `users.repository.ts`, `reports.repository.ts`, `files.controller.ts`, `content.repository.ts` |
| 5 | Multipart-парсинг | нет (нужен общий `parseMultipart` в `common/`) | 5 копий, 3 вариации | `profile.controller.ts`, `files.controller.ts`, `reports.controller.ts` |
| 6 | Клиент: API/composables | admin-связка users/reports (`admin.users.api` + `useAdminUser`) | 9 | `profile.api.ts`, `admin.reports.api.ts`, `useReports.ts`, `useProfile.ts`, `useAdminFileMutations.ts`, `AdminPagesDataPage.vue` |
| 7 | Клиент↔сервер семантика | — (выбрать одну семантику на пару) | 4 пары | `routes.guard.ts` ↔ `authRole.guard.ts`, `routes.ts` ↔ `users.routes.ts`, fsStorage/`upload.controller.ts` |
| 8 | Сборка модулей | `content.routes.ts` + центральный `routes/index.ts` | 4 | `storage.routes.ts`, `files.routes.ts`, `modules/index.ts` |
| 9 | Именование | конвенции остального кода | ~13 (2 — с миграцией данных: `vereficator`, `initionalValues`) | `storage.contraller.ts`, `auth.config.ts`, `user.constants.shared.ts`, `form.types.shared.ts` |
