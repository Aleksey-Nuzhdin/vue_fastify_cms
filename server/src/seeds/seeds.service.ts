import { Db } from 'mongodb'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { FormConfig, PageData } from '@shared/types/form'
import type { I18nFormConfig, I18nPageData } from './seeds.types'
import { loadFormConfigs, loadPageData } from './seeds.loader'
import { expandFormConfig, expandPageData } from './seeds.expander'

// ES modules замена для __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface SeedsServiceOptions {
  updatePages: boolean // флаг из env — обновлять ли существующие страницы
}

function isI18nFormConfig(data: unknown): data is I18nFormConfig {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return typeof obj.name === 'object' && obj.name !== null && 'ru' in (obj.name as object)
}

function isI18nPageData(data: unknown): data is I18nPageData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return typeof obj.ru === 'object' && obj.ru !== null
}
export function createSeedsService(db: Db, options: SeedsServiceOptions) {
  const formsCollection = db.collection<FormConfig>('formConfigs')
  const pagesCollection = db.collection<PageData>('content')

  const formsDir = join(__dirname, 'data/forms')
  const pagesDir = join(__dirname, 'data/content')

  return {
    // Миграция: добавляем lang: "ru" к старым документам без lang
    async migrateExistingDocuments(): Promise<void> {
      const formResult = await formsCollection.updateMany(
        { lang: { $exists: false } },
        { $set: { lang: 'ru' } as any }
      )
      const pageResult = await pagesCollection.updateMany(
        { lang: { $exists: false } },
        { $set: { lang: 'ru' } as any }
      )
      if (formResult.modifiedCount > 0 || pageResult.modifiedCount > 0) {
        console.log(`[seeds] Migration: ${formResult.modifiedCount} forms, ${pageResult.modifiedCount} pages → lang="ru"`)
      }
    },

    // Формы — обновляем всегда
    async seedFormConfigs(): Promise<void> {
      const rawConfigs = await loadFormConfigs(formsDir)
      let count = 0

      for (const raw of rawConfigs) {
        const expanded: FormConfig[] = isI18nFormConfig(raw)
          ? expandFormConfig(raw as I18nFormConfig)
          : [{ ...(raw as FormConfig), lang: 'ru' as const }]

        for (const config of expanded) {
          await formsCollection.updateOne(
            { id: config.id, lang: config.lang },
            { $set: config },
            { upsert: true }
          )
          count++
        }
      }

      console.log(`[seeds] Form configs: ${count} synced`)
    },

    // Страницы — обновляем только если флаг или записи нет
    async seedPages(): Promise<void> {
      const rawPages = await loadPageData(pagesDir)

      let inserted = 0
      let updated = 0
      let skipped = 0

      for (const raw of rawPages) {
        const expanded: PageData[] = isI18nPageData(raw)
          ? expandPageData(raw as I18nPageData)
          : [{ ...(raw as PageData), lang: 'ru' as const }]

        for (const page of expanded) {
          const existing = await pagesCollection.findOne({ id: page.id, lang: page.lang })

          if (!existing) {
            await pagesCollection.insertOne(page)
            inserted++
          } else if (options.updatePages) {
            await pagesCollection.updateOne(
              { id: page.id, lang: page.lang },
              { $set: page }
            )
            updated++
          } else {
            skipped++
          }
        }
      }

      console.log(`[seeds] Pages: ${inserted} inserted, ${updated} updated, ${skipped} skipped`)
    },

    // Запуск всех сидов
    async runAll(): Promise<void> {
      await this.migrateExistingDocuments()
      await this.seedFormConfigs()
      await this.seedPages()
    }
  }
}

export type SeedsService = ReturnType<typeof createSeedsService>
