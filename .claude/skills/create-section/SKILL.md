---
name: create-section
description: Создать новую секцию на главной странице (seed, форма, типы, компонент)
argument-hint: <section-id> <описание структуры данных>
disable-model-invocation: true
user-invocable: true
---

# Создание новой секции на главной странице

Создай новую секцию для HomePage по ID: `$0`
Описание/структура данных: $1

## Пошаговый план

### Шаг 1 — Изучить существующие примеры
Прочитай эти файлы для понимания паттернов:
- `server/src/seeds/data/pages/baner.page.ts` — пример seed-данных
- `server/src/seeds/data/forms/page-baner.form.ts` — пример FormConfig
- `shared/types/form/pages/home.pageData.types.shared.ts` — существующие типы
- `shared/types/form/pages/index.ts` — экспорт namespace Home
- `client/src/modules/public/pages/HomePage.vue` — главная страница
- `client/src/modules/public/components/` — существующие компоненты секций

### Шаг 2 — Seed-данные страницы
Создай файл `server/src/seeds/data/pages/$0.page.ts`:
- `id` должен совпадать с `$0`
- `page: "home"`
- `data` — структура данных секции на основе описания пользователя

### Шаг 3 — FormConfig для админки
Создай файл `server/src/seeds/data/forms/page-$0.form.ts`:
- `id: "page-$0"`
- Поля формы должны соответствовать структуре `data` из шага 2
- Для вложенных массивов используй `type: "array"` с `arrayItem`
- Для текстовых полей используй `type: "input"`
- `initionalValues` должны содержать пустые значения по типам из `data`

### Шаг 4 — Shared типы
В файле `shared/types/form/pages/home.pageData.types.shared.ts`:
- Добавь тип `<Name>PageData` с полями из `data`
- Добавь тип `<Name>Page = PageData<<Name>PageData>`

В файле `shared/types/form/pages/index.ts`:
- Импортируй новый тип
- Добавь `export type <Name>Data = <Name>Page` в `namespace Home`

### Шаг 5 — Vue-компонент
Создай `client/src/modules/public/components/Home<Name>.vue`:
- `defineProps<{ data: <Name>PageData }>()`
- Шаблон рендерит данные секции
- Scoped SCSS стили в формате BEM (`home-<name>`, `home-<name>__element`)

### Шаг 6 — Подключить в HomePage
В файле `client/src/modules/public/pages/HomePage.vue`:
- Добавь импорт нового компонента
- Добавь `computed` для поиска секции: `sections.value?.find(s => s.id === '$0')`
- Добавь компонент в шаблон: `<Home<Name> v-if="..." :data="....data" />`

## Важно
- Следуй стилю и паттернам существующих файлов
- Имена типов в PascalCase, ID секций в kebab-case
- Все импорты типов через `@shared/types/...`
