<!--
  Email Template Version History Component

  Requirements addressed:
  - 5.6: Template version history and rollback functionality
-->

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Version History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          @click="loadHistory"
        >
          Refresh
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div
        v-if="loading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>

      <div
        v-else-if="history.length > 0"
        class="space-y-4"
      >
        <div
          v-for="version in history"
          :key="version.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  Version {{ version.version }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {{ formatEmailType(version.templateType) }}
                </span>
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                  {{ version.locale.toUpperCase() }}
                </span>
              </div>

              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Subject:</strong> {{ version.subject }}
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-500">
                Archived: {{ formatDate(version.archivedAt) }}
              </div>
            </div>

            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="viewVersion(version)"
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="rollingBack"
                @click="rollbackToVersion(version)"
              >
                Rollback
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-8 text-gray-600 dark:text-gray-400"
      >
        No version history available
      </div>
    </CardContent>
  </Card>

  <!-- Version Details Modal -->
  <Dialog v-model:open="showVersionModal">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Version {{ selectedVersion?.version }} Details</DialogTitle>
        <DialogDescription>View details and translations for this archived email template version</DialogDescription>
      </DialogHeader>
      <div
        v-if="selectedVersion"
        class="space-y-4"
      >
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">
            {{ selectedVersion.subject }}
          </p>
        </div>

        <div v-if="selectedVersion.preheader">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Preheader</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">
            {{ selectedVersion.preheader }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Translations</label>
          <pre class="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto">{{ JSON.stringify(selectedVersion.translations, null, 2) }}</pre>
        </div>

        <div class="flex gap-2 pt-4">
          <Button
            :disabled="rollingBack"
            class="flex-1"
            @click="rollbackToVersion(selectedVersion)"
          >
            {{ rollingBack ? 'Rolling back...' : 'Rollback to This Version' }}
          </Button>
          <Button
            variant="outline"
            class="flex-1"
            @click="showVersionModal = false"
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'

const props = defineProps<{
  templateType: string
  locale: string
}>()

const emit = defineEmits<{
  rollback: []
}>()

const toast = useToast()
const history = ref<TemplateHistoryEntry[]>([])
const loading = ref(false)
const showVersionModal = ref(false)
const selectedVersion = ref<TemplateHistoryEntry | null>(null)
const rollingBack = ref(false)

interface TemplateHistoryEntry {
  id: number
  version: number
  templateType: string
  locale: string
  subject: string
  preheader?: string
  translations: Record<string, any>
  archivedAt: string
}

watch(() => [props.templateType, props.locale], () => {
  loadHistory()
}, { immediate: true })

async function loadHistory(): Promise<void> {
  loading.value = true
  try {
    const { data } = await useFetch<TemplateHistoryEntry[]>('/api/admin/email-templates/history', {
      params: {
        type: props.templateType,
        locale: props.locale,
      },
    })

    if (data.value) {
      history.value = data.value
    }
  }
  catch (error: unknown) {
    console.error('Failed to load version history:', error)
  }
  finally {
    loading.value = false
  }
}

function viewVersion(version: TemplateHistoryEntry): void {
  selectedVersion.value = version
  showVersionModal.value = true
}

async function rollbackToVersion(version: TemplateHistoryEntry): Promise<void> {
  if (!confirm(`Are you sure you want to rollback to version ${version.version}? This will create a new version with the old content.`)) {
    return
  }

  rollingBack.value = true
  try {
    await $fetch('/api/admin/email-templates/rollback', {
      method: 'POST',
      body: {
        historyId: version.id,
        type: version.templateType,
        locale: version.locale,
      },
    }) as any

    toast.success('Template rolled back successfully')
    showVersionModal.value = false
    emit('rollback')
    await loadHistory()
  }
  catch (error: unknown) {
    console.error('Failed to rollback template:', error)
    toast.error('Failed to rollback template')
  }
  finally {
    rollingBack.value = false
  }
}

function formatEmailType(type: string): string {
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1),
  ).join(' ')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
</script>
