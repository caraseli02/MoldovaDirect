<!--
  Email Template Synchronization Component

  Requirements addressed:
  - 5.5: Synchronize templates across languages
-->

<template>
  <Card>
    <CardHeader>
      <CardTitle>Template Synchronization</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Synchronize template structure across all languages. This will update all locales to have the same keys,
          preserving existing translations where available.
        </p>

        <div>
          <UiLabel>Source Language</UiLabel>
          <UiSelect v-model="sourceLocale">
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="en">
                English
              </UiSelectItem>
              <UiSelectItem value="es">
                Español
              </UiSelectItem>
              <UiSelectItem value="ro">
                Română
              </UiSelectItem>
              <UiSelectItem value="ru">
                Русский
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div>
          <UiLabel>Target Languages</UiLabel>
          <div class="space-y-2">
            <UiLabel
              v-for="locale in availableLocales.filter(l => l !== sourceLocale)"
              :key="locale"
              class="flex items-center gap-2"
            >
              <UiCheckbox
                :checked="targetLocales.includes(locale)"
                @update:checked="(val: boolean) => toggleTargetLocale(locale, val)"
              />
              <span class="text-sm text-gray-900 dark:text-white">
                {{ getLocaleName(locale) }}
              </span>
            </UiLabel>
          </div>
        </div>

        <div
          v-if="syncPreview"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Preview Changes
          </h4>
          <div class="space-y-2 text-sm">
            <div
              v-for="(changes, locale) in syncPreview"
              :key="locale"
            >
              <strong class="text-gray-900 dark:text-white">{{ getLocaleName(locale) }}:</strong>
              <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4">
                <li
                  v-for="change in changes"
                  :key="change"
                >
                  {{ change }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            variant="outline"
            :disabled="targetLocales.length === 0 || previewing"
            @click="previewSync"
          >
            {{ previewing ? 'Previewing...' : 'Preview Changes' }}
          </Button>
          <Button
            :disabled="targetLocales.length === 0 || !syncPreview || synchronizing"
            @click="synchronizeTemplates"
          >
            {{ synchronizing ? 'Synchronizing...' : 'Synchronize Templates' }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Checkbox as UiCheckbox } from '@/components/ui/checkbox'

const props = defineProps<{
  templateType: string
}>()

const emit = defineEmits<{
  synchronized: []
}>()

const availableLocales = ['en', 'es', 'ro', 'ru']
const sourceLocale = ref('en')
const targetLocales = ref<string[]>([])
const syncPreview = ref<Record<string, string[]> | null>(null)
const previewing = ref(false)
const synchronizing = ref(false)

function getLocaleName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    es: 'Español',
    ro: 'Română',
    ru: 'Русский',
  }
  return names[locale] || locale
}

function toggleTargetLocale(locale: string, checked: boolean) {
  if (checked) {
    targetLocales.value.push(locale)
  }
  else {
    const index = targetLocales.value.indexOf(locale)
    if (index > -1) {
      targetLocales.value.splice(index, 1)
    }
  }
}

async function previewSync() {
  previewing.value = true
  try {
    const { data } = await useFetch('/api/admin/email-templates/sync-preview', {
      method: 'POST',
      body: {
        type: props.templateType,
        sourceLocale: sourceLocale.value,
        targetLocales: targetLocales.value,
      },
    })

    if (data.value) {
      syncPreview.value = data.value
    }
  }
  catch (error: unknown) {
    console.error('Failed to preview sync:', error)
    useToast().error('Failed to preview synchronization')
  }
  finally {
    previewing.value = false
  }
}

async function synchronizeTemplates() {
  if (!confirm('Are you sure you want to synchronize these templates? This will update the target languages.')) {
    return
  }

  synchronizing.value = true
  try {
    await $fetch('/api/admin/email-templates/synchronize', {
      method: 'POST',
      body: {
        type: props.templateType,
        sourceLocale: sourceLocale.value,
        targetLocales: targetLocales.value,
      },
    }) as any

    useToast().success('Templates synchronized successfully')
    syncPreview.value = null
    targetLocales.value = []
    emit('synchronized')
  }
  catch (error: unknown) {
    console.error('Failed to synchronize templates:', error)
    useToast().error('Failed to synchronize templates')
  }
  finally {
    synchronizing.value = false
  }
}
</script>
