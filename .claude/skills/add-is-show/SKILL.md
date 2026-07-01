---
name: add-is-show
description: Add isShow checkbox (show/hide section toggle) to an existing HomePage section
argument-hint: <section-id> (e.g. program, committee, homoLegens)
user-invocable: true
---

# Add isShow to a HomePage section

Add the `isShow` field (checkbox "Show section") to the `$ARGUMENTS` section, following the same pattern as the `about` section.

## Step 0 — Study the reference (about section)
Read these files to understand the pattern:
- `shared/types/form/pages/home.pageData.types.shared.ts` — `AboutPageData` type contains `isShow: boolean`
- `server/src/seeds/data/forms/page-about.form.ts` — checkbox field in form config
- `server/src/seeds/data/pages/about.page.ts` — seed data
- `client/src/modules/public/pages/Home/HomePage.vue` — condition `v-if="about && about.data.isShow"`

## Step 1 — Shared types
In `shared/types/form/pages/home.pageData.types.shared.ts`:
- Find the `<SectionName>PageData` type
- Add `isShow: boolean` (after the `title` field)

## Step 2 — Form config
In `server/src/seeds/data/forms/page-<section_id>.form.ts`:
- Add `cols: 8` to the `title` field (if not already present)
- After the `title` field, add a new checkbox field:
```ts
{
  type: "checkbox",
  label: { ru: "Показывать блок", en: "Show block" },
  field: "isShow",
  options: { value: true },
  cols: 4
},
```

## Step 3 — Seed data
In `server/src/seeds/data/pages/<section_id>.page.ts`:
- Add `isShow: true` to the `data` object for each language (ru, en)

## Step 4 — HomePage.vue
In `client/src/modules/public/pages/Home/HomePage.vue`:
- Change the component render condition from `v-if="<var>"` to `v-if="<var> && <var>.data.isShow"`

## Important
- Follow the style and patterns of existing files
- Only modify the files listed above
- Refer to the about section as reference when in doubt
