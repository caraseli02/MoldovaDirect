<template>
  <div class="space-y-6 pb-12">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
      <p class="text-muted-foreground mt-2">
        Generate test data, simulate users, and test admin functionality
      </p>
    </div>

    <!-- Warning Banner -->
    <Alert variant="destructive" v-if="showWarning">
      <commonIcon name="lucide:alert-triangle" class="h-4 w-4" />
      <AlertTitle>Testing Mode</AlertTitle>
      <AlertDescription>
        This page allows you to modify database content. Use with caution.
        All test data will be marked appropriately.
      </AlertDescription>
    </Alert>

    <!-- Database Statistics -->
    <DatabaseStatsCard
      :stats="stats"
      :loading-stats="loadingStats"
      @refresh="refreshStats"
    />

    <!-- Quick Actions -->
    <QuickActionsCard
      :loading="loading"
      @run-action="handleRunQuickAction"
      @quick-delete="quickDelete"
    />

    <!-- Progress Indicator -->
    <ProgressIndicator :progress="progress" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Simulation -->
      <UserSimulationCard
        :loading="loading"
        @create-users="createUsers"
      />

      <!-- User Impersonation -->
      <UserImpersonationCard
        :loading="loading"
        :is-active="impersonation.active"
        :target-name="impersonation.targetName"
        :expires-at="impersonation.expiresAt"
        @start="startImpersonation"
        @stop="stopImpersonation"
      />

      <!-- Data Cleanup -->
      <DataCleanupCard
        :loading="loading"
        @cleanup="cleanup"
      />

      <!-- Scenario Templates -->
      <ScenarioTemplatesCard
        :scenarios="savedScenarios"
        @load="loadScenario"
        @delete="deleteScenario"
        @open-dialog="showSaveScenarioDialog = true"
      />
    </div>

    <!-- Advanced Options -->
    <AdvancedDataGenerationCard
      v-model="customData"
      :loading="loading"
      @generate="generateCustomData"
    />

    <!-- Results Display -->
    <TestResultsCard
      :result="result"
      @close="clearResult"
      @export-credentials="exportCredentials"
    />

    <!-- Generation History -->
    <GenerationHistoryCard :history="generationHistory" />

    <!-- Save Scenario Dialog -->
    <SaveScenarioDialog
      :show="showSaveScenarioDialog"
      @close="showSaveScenarioDialog = false"
      @save="saveScenario"
    />
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { ScenarioTemplate, GenerationHistoryItem, CustomDataConfig } from '~/types/admin-testing'

// Import components
import DatabaseStatsCard from '~/components/admin/testing/DatabaseStatsCard.vue'
import QuickActionsCard from '~/components/admin/testing/QuickActionsCard.vue'
import ProgressIndicator from '~/components/admin/testing/ProgressIndicator.vue'
import UserSimulationCard from '~/components/admin/testing/UserSimulationCard.vue'
import UserImpersonationCard from '~/components/admin/testing/UserImpersonationCard.vue'
import DataCleanupCard from '~/components/admin/testing/DataCleanupCard.vue'
import ScenarioTemplatesCard from '~/components/admin/testing/ScenarioTemplatesCard.vue'
import AdvancedDataGenerationCard from '~/components/admin/testing/AdvancedDataGenerationCard.vue'
import TestResultsCard from '~/components/admin/testing/TestResultsCard.vue'
import GenerationHistoryCard from '~/components/admin/testing/GenerationHistoryCard.vue'
import SaveScenarioDialog from '~/components/admin/testing/SaveScenarioDialog.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// Use composable for shared state and logic
const {
  loading,
  loadingStats,
  result,
  stats,
  progress,
  refreshStats,
  runQuickAction,
  cleanup,
  quickDelete,
  createUsers,
  generateCustomData,
  clearResult
} = useTestingDashboard()

// Local state
const showWarning = ref(true)
const customData = ref<CustomDataConfig>({
  products: 20,
  users: 10,
  orders: 30,
  clearExisting: false
})

// Impersonation state
const impersonation = ref({
  active: false,
  userEmail: '',
  reason: '',
  duration: 30,
  targetName: '',
  expiresAt: '',
  logId: 0
})

// Scenarios
const savedScenarios = ref<ScenarioTemplate[]>([])
const showSaveScenarioDialog = ref(false)

// Generation history
const generationHistory = ref<GenerationHistoryItem[]>([])

// Lifecycle
onMounted(async () => {
  await refreshStats()
  loadSavedScenarios()
  loadGenerationHistory()
})

// Quick action handler with history tracking
const handleRunQuickAction = async (preset: string) => {
  await runQuickAction(preset, (response) => {
    addToHistory(preset, response)
  })
}

// Impersonation handlers
const startImpersonation = async (config: { userEmail: string; reason: string; duration: number }) => {
  try {
    const response = await $fetch('/api/admin/impersonate', {
      method: 'POST',
      body: {
        action: 'start',
        userId: config.userEmail,
        reason: config.reason,
        duration: config.duration
      }
    })

    if (response.success) {
      impersonation.value.active = true
      impersonation.value.targetName = response.impersonating.name
      impersonation.value.expiresAt = response.expiresAt
      impersonation.value.logId = response.logId
    }
  } catch (err: any) {
    console.error('Failed to start impersonation:', err)
  }
}

const stopImpersonation = async () => {
  try {
    const response = await $fetch('/api/admin/impersonate', {
      method: 'POST',
      body: {
        action: 'end',
        logId: impersonation.value.logId
      }
    })

    if (response.success) {
      impersonation.value.active = false
      impersonation.value.userEmail = ''
      impersonation.value.reason = ''
      impersonation.value.targetName = ''
    }
  } catch (err: any) {
    console.error('Failed to stop impersonation:', err)
  }
}

// Scenario management
const loadSavedScenarios = () => {
  const saved = localStorage.getItem('admin-test-scenarios')
  if (saved) {
    savedScenarios.value = JSON.parse(saved)
  }
}

const saveScenario = (data: { name: string; description: string }) => {
  const scenario: ScenarioTemplate = {
    id: Date.now().toString(),
    name: data.name,
    description: data.description,
    config: { ...customData.value },
    createdAt: new Date().toISOString()
  }

  savedScenarios.value.push(scenario)
  localStorage.setItem('admin-test-scenarios', JSON.stringify(savedScenarios.value))
  showSaveScenarioDialog.value = false
}

const loadScenario = (scenario: ScenarioTemplate) => {
  customData.value = { ...scenario.config }
}

const deleteScenario = (id: string) => {
  savedScenarios.value = savedScenarios.value.filter(s => s.id !== id)
  localStorage.setItem('admin-test-scenarios', JSON.stringify(savedScenarios.value))
}

// History management
const loadGenerationHistory = () => {
  const saved = localStorage.getItem('admin-test-history')
  if (saved) {
    generationHistory.value = JSON.parse(saved)
  }
}

const addToHistory = (preset: string, response: any) => {
  const item: GenerationHistoryItem = {
    id: Date.now().toString(),
    preset,
    config: { preset: preset as any },
    timestamp: new Date().toISOString(),
    results: {
      users: response.results?.steps?.find((s: any) => s.step === 'Create users')?.count || 0,
      products: response.results?.steps?.find((s: any) => s.step === 'Create products')?.count || 0,
      orders: response.results?.steps?.find((s: any) => s.step === 'Create orders')?.count || 0
    },
    duration: response.totalDuration || 0
  }

  generationHistory.value.unshift(item)
  generationHistory.value = generationHistory.value.slice(0, 10)
  localStorage.setItem('admin-test-history', JSON.stringify(generationHistory.value))
}

// Export credentials
const exportCredentials = () => {
  if (!result.value?.users) return

  const csv = [
    ['Name', 'Email', 'Role', 'Phone'].join(','),
    ...result.value.users.map(u =>
      [u.name, u.email, u.role, u.phone].join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-users-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

useHead({
  title: 'Testing Dashboard - Admin - Moldova Direct'
})
</script>
