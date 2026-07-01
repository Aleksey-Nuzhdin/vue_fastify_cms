<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { pagesDataAdminApi } from '../api/pagesData.admin.api'
import { fetcher } from '@/shared/api'
import type { FormConfig, FormValues } from '@/shared/types/form.types'
import type { Lang } from '@shared/types/form'
import FormGenerator from '@/shared/ui/form/FormGenerator.vue'
import { useLocale } from '@/shared/composables/useLocale'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'

const queryClient = useQueryClient()
const { t } = useI18n()
const { addSuccessPopup, addErrorPopup } = useShowPopup()

// Язык
const { lang: appLang } = useLocale()
const langs: Lang[] = ['ru', 'en']
const selectedLang = ref<Lang>('ru')

// Список page-конфигов
const { data: pagesList, isLoading: isListLoading } = useQuery({
  queryKey: ['admin-pages-list', appLang],
  queryFn: () => pagesDataAdminApi.fetchConfigList(appLang.value, true),
})

// Выбранная page
const selectedPageId = ref<string | null>(null)

// Данные page по id + lang
const pageDataEnabled = computed(() => !!selectedPageId.value)
const { data: selectedPage, isLoading: isPageLoading } = useQuery({
  queryKey: ['admin-page-data', selectedPageId, selectedLang],
  queryFn: () => pagesDataAdminApi.fetchById(selectedPageId.value!, selectedLang.value),
  enabled: pageDataEnabled,
})

// FormConfig для выбранной page + lang
const configEnabled = computed(() => !!selectedPageId.value)
const { data: formConfig, isLoading: isConfigLoading } = useQuery({
  queryKey: ['admin-page-config', selectedPageId, selectedLang],
  queryFn: () => fetcher.get<FormConfig>(`/content/config/item/${selectedPageId.value}?lang=${selectedLang.value}`),
  enabled: configEnabled,
})

// Данные формы (редактируемая копия page.data)
const formValues = ref<FormValues>({})

// При выборе page
function selectPage(page: { id: string }) {
  selectedPageId.value = page.id
}

// При загрузке / смене данных page (включая смену языка) — обновить formValues
watch(selectedPage, (page) => {
  if (page) {
    formValues.value = JSON.parse(JSON.stringify(page.data)) || {}
  }
})

// Сохранение
const { mutate: savePageData, isPending: isSaving } = useMutation({
  mutationFn: () => {
    if (!selectedPage.value?._id) throw new Error('No page selected')
    return pagesDataAdminApi.update(selectedPage.value._id, { data: formValues.value })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-page-data', selectedPageId, selectedLang] })
    queryClient.invalidateQueries({ queryKey: ['admin-pages-list'] })
    addSuccessPopup(t('admin.pagesData.saveSuccess'))
  },
  onError: () => {
    addErrorPopup(t('admin.pagesData.saveError'))
  },
})

const configForGenerator = computed(() => {
  if (!formConfig.value) return null
  return {
    id: formConfig.value.id,
    fields: formConfig.value.fields,
  }
})
</script>

<template>
  <div class="admin-pages-data">
    <div class="admin-pages-data__nav">
      <h3 class="admin-pages-data__nav-title">{{ $t('admin.pagesData.pagesTitle') }}</h3>
      <div
        v-for="page in pagesList"
        :key="page.id"
        class="admin-pages-data__nav-item"
        :class="{ active: selectedPageId === page.id }"
        @click="selectPage(page)"
      >
        {{ page.name }}
      </div>
      <BaseLoader v-if="isListLoading" />
    </div>

    <div class="admin-pages-data__content">
      <template v-if="selectedPage && configForGenerator">
        <div class="admin-pages-data__header">
          <h3>{{ selectedPage.name }}</h3>
          <div class="admin-pages-data__lang-switcher">
            <BaseButton v-for="l in langs" :key="l"
              size="sm" color="primary"
              :variant=" selectedLang === l ? 'filled' : 'outline'"
              @click="selectedLang = l"
            >
               {{ l.toUpperCase() }}
            </BaseButton>
          </div>
          <BaseButton
            color="primary"
            :disabled="isSaving"
            @click="savePageData()"
          >
            {{ isSaving ? $t('admin.pagesData.saving') : $t('common.save') }}
          </BaseButton>
        </div>
        <div class="base-block-md">
          <FormGenerator
            v-model="formValues"
            :formConfig="configForGenerator"
          />
        </div>
        <div class="admin-pages-data__footer">
          <BaseButton
            color="primary"
            :disabled="isSaving"
            @click="savePageData()"
          >
            {{ isSaving ? $t('admin.pagesData.saving') : $t('common.save') }}
          </BaseButton>
        </div>
      </template>
      <template v-else-if="selectedPageId && (isConfigLoading || isPageLoading)">
        <BaseLoader />
      </template>
      <template v-else>
        <p class="admin-pages-data__placeholder">{{ $t('admin.pagesData.selectPagePlaceholder') }}</p>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-pages-data {
  display: flex;
  gap: $spacing-lg;
  min-height: 400px;
}

.admin-pages-data__nav {
  min-width: 200px;
  border-right: 1px solid $color-border;
  padding-right: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.admin-pages-data__nav-title {
  margin-bottom: $spacing-sm;
}

.admin-pages-data__nav-item {
  padding: $spacing-xs $spacing-sm;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: $color-bg-gray-hover;
  }

  &.active {
    background-color: $color-primary;
    color: $color-white;
  }
}

.admin-pages-data__content {
  flex: 1;
}

.admin-pages-data__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.admin-pages-data__lang-switcher {
  display: flex;
  overflow: hidden;
}

// .admin-pages-data__lang-btn {
//   padding: $spacing-xs $spacing-sm;
//   border: none;
//   background: transparent;
//   cursor: pointer;
//   font-weight: 500;
//   font-size: 14px;
//   transition: background-color 0.2s, color 0.2s;

//   &:hover {
//     background-color: $color-bg-gray-hover;
//   }

//   &.active {
//     background-color: $color-primary;
//     color: $color-white;
//   }
// }

.admin-pages-data__placeholder {
  color: $color-text-secondary;
}

.admin-pages-data__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: $spacing-md;
}
</style>
