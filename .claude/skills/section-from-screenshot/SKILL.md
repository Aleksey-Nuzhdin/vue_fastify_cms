---
name: section-from-screenshot
description: Создать секцию целиком из скриншота — seed, форма, типы, Vue-компонент, подключение в HomePage
argument-hint: <section-id>
disable-model-invocation: true
user-invocable: true
---

# Создание полной секции из скриншота

Создай полную секцию `$0` для HomePage на основе приложенного скриншота.

Пользователь ДОЛЖЕН приложить скриншот секции к сообщению.

---

## Фаза 1 — Seed-данные из скриншота

### Шаг 1.1 — Изучить существующие seed-файлы
Прочитай файлы в `server/src/seeds/data/pages/` для понимания формата:
- `baner.page.ts`
- `info.page.ts`
- Другие файлы `*.page.ts` в этой папке

Определи общий паттерн: `export const data = { id, page, name, data: {...} }`.

### Шаг 1.2 — Извлечь данные из скриншота
Внимательно рассмотри приложенный скриншот и извлеки:
- Все тексты (заголовки, описания, подписи)
- Кнопки (текст, предполагаемый URL)
- Ссылки
- Визуальные свойства (цвет карточек: `"primary"` для синих/акцентных, `"dark"` для тёмных)
- Структуру и вложенность элементов

### Шаг 1.3 — Создать seed-файл
Создай файл `server/src/seeds/data/pages/$0.page.ts`:
- `id`: `"$0"`
- `page`: `"home"`
- `name`: человекочитаемое название секции на русском
- `data`: структура данных, извлечённая из скриншота

### Шаг 1.4 — Зарегистрировать seed
Проверь файл `server/src/seeds/data/pages/index.ts` (если существует) и добавь экспорт нового seed-файла по аналогии с остальными.

---

## Фаза 2 — Создание секции (форма, типы, компонент)

Используй структуру `data` из seed-файла, созданного в Фазе 1, как источник истины для всех последующих шагов.

### Шаг 2.1 — Изучить примеры форм и типов
Прочитай эти файлы для понимания паттернов:
- `server/src/seeds/data/forms/page-baner.form.ts` — пример FormConfig
- `shared/types/form/pages/home.pageData.types.shared.ts` — существующие типы
- `shared/types/form/pages/index.ts` — экспорт namespace Home
- `client/src/modules/public/pages/HomePage.vue` — главная страница
- `client/src/modules/public/components/` — существующие компоненты секций

### Шаг 2.2 — FormConfig для админки
Создай файл `server/src/seeds/data/forms/page-$0.form.ts`:
- `id: "page-$0"`
- Поля формы должны соответствовать структуре `data` из seed-файла (Шаг 1.3)
- Для вложенных массивов используй `type: "array"` с `arrayItem`
- Для текстовых полей используй `type: "input"`
- `initionalValues` должны содержать пустые значения по типам из `data`

### Шаг 2.3 — Shared типы
В файле `shared/types/form/pages/home.pageData.types.shared.ts`:
- Добавь тип `<Name>PageData` с полями из `data` seed-файла
- Добавь тип `<Name>Page = PageData<<Name>PageData>`

В файле `shared/types/form/pages/index.ts`:
- Импортируй новый тип
- Добавь `export type <Name>Data = <Name>Page` в `namespace Home`

### Шаг 2.4 — Vue-компонент
Создай `client/src/modules/public/components/Home<Name>.vue`:
- `defineProps<{ data: <Name>PageData }>()`
- Шаблон рендерит данные секции на основе структуры из seed-файла
- Scoped SCSS стили в формате BEM (`home-<name>`, `home-<name>__element`)

### Шаг 2.5 — Подключить в HomePage
В файле `client/src/modules/public/pages/HomePage.vue`:
- Добавь импорт нового компонента
- Добавь `computed` для поиска секции: `sections.value?.find(s => s.id === '$0')`
- Добавь компонент в шаблон: `<Home<Name> v-if="..." :data="....data" />`

---

## Важно
- Следуй стилю и паттернам существующих файлов
- Имена типов в PascalCase, ID секций в kebab-case
- Все импорты типов через `@shared/types/...`
- Сохраняй все тексты на языке оригинала (со скриншота)
- Для массивов однотипных элементов (карточки, кнопки) используй массив объектов
- Если на скриншоте есть кнопка/ссылка без явного URL, используй `"#"` как заглушку
- Данные из seed-файла (Фаза 1) являются единственным источником истины для типов, формы и компонента (Фаза 2)
