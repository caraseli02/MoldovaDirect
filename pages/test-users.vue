<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="mb-10 rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur dark:bg-slate-800/80">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              Test Users &amp; Persona Simulator
            </h1>
            <p class="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
              Activate preconfigured customer personas to audit the account, authentication, and checkout journeys without
              creating real Supabase users. Each persona includes a task list, suggested navigation, and state cues so QA can
              reproduce bugs quickly.
            </p>
          </div>
          <div class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              <Icon name="i-heroicons-beaker" class="h-5 w-5" />
              Simulation tools are for local and preview environments only
            </span>
            <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <Icon name="i-heroicons-wrench-screwdriver" class="h-5 w-5" />
              Toggle with <code class="rounded bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-600">ENABLE_TEST_USERS</code>
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="!isSimulationEnabled"
        class="mb-10 rounded-xl border border-dashed border-red-400 bg-white/70 p-6 text-red-700 shadow dark:border-red-500 dark:bg-red-900/10 dark:text-red-200"
      >
        <h2 class="mb-2 text-xl font-semibold">Simulation disabled</h2>
        <p class="text-sm">
          Enable personas by setting <code class="rounded bg-red-100 px-1 py-0.5 dark:bg-red-500/40">ENABLE_TEST_USERS=true</code>
          in your environment or by running Nuxt in development mode. The store exposes test helpers only when the flag is
          active.
        </p>
      </div>

      <div v-else class="space-y-10">
        <section v-if="activePersona" class="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
          <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <span class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-100">
                Active persona
              </span>
              <h2 class="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                {{ activePersona.title }}
              </h2>
              <p class="mt-2 text-slate-600 dark:text-slate-300">
                {{ activePersona.summary }}
              </p>

              <div class="mt-6 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white">Persona goals</h3>
                  <ul class="mt-2 list-disc space-y-1 pl-5">
                    <li v-for="goal in activePersona.goals" :key="goal">{{ goal }}</li>
                  </ul>
                </div>
                <div>
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-slate-900 dark:text-white">Test Script Progress</h3>
                    <span
                      v-if="currentProgress"
                      class="rounded-full px-2 py-1 text-xs font-medium"
                      :class="currentProgress.completionPercentage === 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'"
                    >
                      {{ currentProgress.completionPercentage }}% Complete
                    </span>
                  </div>
                  <div class="mt-2 space-y-3">
                    <div
                      v-for="(step, index) in activePersona.testScript"
                      :key="index"
                      class="group rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div class="flex items-start gap-3">
                        <input
                          type="checkbox"
                          :id="`step-${index}`"
                          :checked="isStepCompleted(index)"
                          @change="handleToggleStep(index)"
                          class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
                        />
                        <label
                          :for="`step-${index}`"
                          class="flex-1 cursor-pointer text-sm"
                          :class="isStepCompleted(index) ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'"
                        >
                          {{ step }}
                        </label>
                      </div>
                      <div
                        v-if="showNoteInput[index] || getStepNote(index)"
                        class="mt-2 pl-7"
                      >
                        <textarea
                          :value="getStepNote(index)"
                          @input="(e) => handleUpdateNote(index, (e.target as HTMLTextAreaElement).value)"
                          placeholder="Add notes (issues found, observations, etc.)"
                          rows="2"
                          class="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                        />
                      </div>
                      <button
                        v-if="!showNoteInput[index] && !getStepNote(index)"
                        @click="showNoteInput[index] = true"
                        class="ml-7 mt-1 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400"
                      >
                        + Add note
                      </button>
                    </div>
                  </div>
                  <button
                    v-if="currentProgress && currentProgress.completedSteps.length > 0"
                    @click="handleClearProgress"
                    class="mt-3 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    Clear progress
                  </button>
                </div>
              </div>
            </div>
            <div class="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-slate-50 p-5 text-sm dark:bg-slate-900">
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-white">Session details</h3>
                <p class="mt-2 text-slate-600 dark:text-slate-300">
                  <strong class="font-medium text-slate-900 dark:text-white">{{ activePersona.user.name }}</strong>
                  · {{ activePersona.user.email }}
                </p>
                <p class="mt-1 text-slate-500 dark:text-slate-400">
                  Preferred language: <span class="font-medium">{{ activePersona.user.preferredLanguage.toUpperCase() }}</span>
                </p>
                <p v-if="authStore.lockoutTime" class="mt-1 text-orange-600 dark:text-orange-300">
                  Lockout timer: about {{ authStore.lockoutMinutesRemaining }} minutes remaining
                </p>
              </div>

              <div class="space-y-2">
                <h3 class="font-semibold text-slate-900 dark:text-white">Quick links</h3>
                <ul class="space-y-2">
                  <li v-for="link in activePersona.quickLinks" :key="link.route">
                    <NuxtLink
                      :to="localePath(link.route)"
                      class="group flex items-start justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-400"
                    >
                      <div>
                        <span class="font-medium">{{ link.label }}</span>
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ link.description }}</p>
                      </div>
                      <Icon name="i-heroicons-arrow-right" class="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div class="mt-auto flex flex-col gap-2">
                <NuxtLink
                  :to="localePath('/account')"
                  class="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  <Icon name="i-heroicons-rocket-launch" class="h-4 w-4" />
                  Open account dashboard
                </NuxtLink>
                <div class="flex gap-2">
                  <button
                    class="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    type="button"
                    @click="handleExportSession"
                    title="Export current session state"
                  >
                    <Icon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
                    Export
                  </button>
                  <button
                    class="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    type="button"
                    @click="handleShowImport"
                    title="Import session state"
                  >
                    <Icon name="i-heroicons-arrow-up-tray" class="h-4 w-4" />
                    Import
                  </button>
                </div>
                <button
                  v-if="authStore.lockoutTime"
                  class="inline-flex items-center justify-center gap-2 rounded-md border border-orange-500 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-500/10"
                  type="button"
                  @click="handleClearLockout"
                >
                  <Icon name="i-heroicons-clock" class="h-4 w-4" />
                  Clear lockout timer
                </button>
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  type="button"
                  @click="handleEndSimulation"
                >
                  <Icon name="i-heroicons-power" class="h-4 w-4" />
                  End simulation
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Available personas</h2>
            <div class="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search personas..."
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <select
                v-model="filterFocusArea"
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">All Focus Areas</option>
                <option v-for="area in uniqueFocusAreas" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>
            </div>
          </div>
          <div v-if="filteredPersonas.length === 0" class="col-span-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <p class="text-slate-600 dark:text-slate-400">No personas match your search criteria</p>
            <button
              @click="searchQuery = ''; filterFocusArea = ''"
              class="mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear filters
            </button>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <article
              v-for="persona in filteredPersonas"
              :key="persona.key"
              class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div>
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white">{{ persona.title }}</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ persona.summary }}</p>
                  </div>
                  <span
                    v-if="activePersona?.key === persona.key"
                    class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
                  >
                    Active
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="focus in persona.focusAreas"
                    :key="focus"
                    class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <Icon name="i-heroicons-sparkles" class="h-4 w-4" />
                    {{ focus }}
                  </span>
                </div>

                <div class="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <h4 class="font-semibold text-slate-900 dark:text-white">Test steps</h4>
                  <ul class="list-disc space-y-1 pl-5">
                    <li v-for="task in persona.testScript" :key="task">{{ task }}</li>
                  </ul>
                </div>
              </div>

              <div class="mt-6 flex flex-col gap-2">
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  :disabled="activePersona?.key === persona.key"
                  @click="() => handleActivatePersona(persona.key)"
                >
                  <Icon name="i-heroicons-play" class="h-4 w-4" />
                  Activate persona
                </button>
                <NuxtLink
                  :to="localePath(persona.quickLinks[0]?.route || '/account')"
                  class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon name="i-heroicons-cursor-arrow-rays" class="h-4 w-4" />
                  Jump to first checkpoint
                </NuxtLink>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- Import Session Modal -->
      <div
        v-if="showImportModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showImportModal = false"
      >
        <div class="max-w-2xl w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Import Session State</h3>
            <button
              @click="showImportModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Icon name="i-heroicons-x-mark" class="h-6 w-6" />
            </button>
          </div>
          <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Paste the exported session JSON below to restore a previous test session.
          </p>
          <textarea
            v-model="importJson"
            placeholder="Paste exported session JSON here..."
            rows="10"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          />
          <div class="mt-4 flex gap-3 justify-end">
            <button
              @click="showImportModal = false"
              class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              @click="handleImportSession"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Import Session
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { testUserPersonas, type TestUserPersonaKey } from '~/lib/testing/testUserPersonas'

definePageMeta({
  layout: false,
  middleware: ['test-users-guard']
})

useHead({
  title: 'Test Users Simulator — Moldova Direct',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const authStore = useAuthStore()
const toast = useToast()
const runtimeConfig = useRuntimeConfig()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const showNoteInput = reactive<Record<number, boolean>>({})
const searchQuery = ref('')
const filterFocusArea = ref('')
const showImportModal = ref(false)
const importJson = ref('')

const isSimulationEnabled = computed(() => runtimeConfig.public.enableTestUsers)
const personaList = computed(() => Object.values(testUserPersonas))
const activePersona = computed(() => {
  const key = authStore.activeTestPersona
  return key ? testUserPersonas[key] : null
})

const uniqueFocusAreas = computed(() => {
  const areas = new Set<string>()
  personaList.value.forEach((persona) => {
    persona.focusAreas.forEach((area) => areas.add(area))
  })
  return Array.from(areas).sort()
})

const filteredPersonas = computed(() => {
  let filtered = personaList.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((persona) => {
      return (
        persona.title.toLowerCase().includes(query) ||
        persona.summary.toLowerCase().includes(query) ||
        persona.user.email.toLowerCase().includes(query) ||
        persona.focusAreas.some((area) => area.toLowerCase().includes(query))
      )
    })
  }

  // Apply focus area filter
  if (filterFocusArea.value) {
    filtered = filtered.filter((persona) =>
      persona.focusAreas.includes(filterFocusArea.value)
    )
  }

  return filtered
})

// Handle URL parameters for auto-activation
onMounted(() => {
  const { activate, autoStart } = route.query

  if (activate && typeof activate === 'string') {
    const personaKey = activate as TestUserPersonaKey

    if (testUserPersonas[personaKey]) {
      if (autoStart === 'true' || !authStore.activeTestPersona) {
        handleActivatePersona(personaKey)
      }
    } else {
      toast.error('Invalid persona', `Persona "${activate}" not found`)
    }

    // Clean up URL parameters
    router.replace({ query: {} })
  }
})

const currentProgress = computed(() => authStore.currentPersonaProgress)

const isStepCompleted = (stepIndex: number): boolean => {
  if (!currentProgress.value) return false
  return currentProgress.value.completedSteps.includes(stepIndex)
}

const getStepNote = (stepIndex: number): string => {
  if (!currentProgress.value) return ''
  return currentProgress.value.notes[stepIndex] || ''
}

const handleToggleStep = (stepIndex: number) => {
  if (!activePersona.value) return
  authStore.toggleTestScriptStep(
    activePersona.value.key,
    stepIndex,
    activePersona.value.testScript.length
  )
}

const handleUpdateNote = (stepIndex: number, note: string) => {
  if (!activePersona.value) return
  authStore.updateTestScriptNote(activePersona.value.key, stepIndex, note)
}

const handleClearProgress = () => {
  if (!activePersona.value) return
  authStore.clearPersonaProgress(activePersona.value.key)
  toast.info('Progress cleared', 'Test script progress has been reset.')
}

const handleActivatePersona = async (key: TestUserPersonaKey) => {
  try {
    await authStore.simulateLogin(key)
    const persona = testUserPersonas[key]
    toast.success(
      'Simulación activada',
      `Ahora navegas como ${persona.user.name}. Sigue la lista de comprobación para validar el flujo.`
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar la simulación.'
    toast.error('Error al activar la persona', message)
  }
}

const handleEndSimulation = () => {
  authStore.simulateLogout()
  toast.info('Simulación finalizada', 'El estado del usuario simulado se ha restablecido.')
}

const handleClearLockout = () => {
  authStore.clearLockout()
  toast.success('Temporizador limpiado', 'El bloqueo temporal se ha eliminado para continuar las pruebas.')
}

const handleExportSession = async () => {
  if (!activePersona.value || !currentProgress.value) {
    toast.error('Export failed', 'No active persona or progress to export')
    return
  }

  try {
    const { exportPersonaSession } = await import('~/lib/testing/simulationHelpers')

    const sessionJson = exportPersonaSession(
      activePersona.value.key,
      authStore.simulationMode,
      {
        completedSteps: currentProgress.value.completedSteps,
        notes: currentProgress.value.notes
      }
    )

    // Copy to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(sessionJson)
      toast.success('Session exported', 'Session data copied to clipboard')
    } else {
      // Fallback: show in alert
      alert('Copy this session data:\n\n' + sessionJson)
    }

    // Also download as file
    const blob = new Blob([sessionJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-session-${activePersona.value.key}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export session'
    toast.error('Export failed', message)
  }
}

const handleShowImport = () => {
  showImportModal.value = true
  importJson.value = ''
}

const handleImportSession = async () => {
  if (!importJson.value.trim()) {
    toast.error('Import failed', 'Please paste session JSON')
    return
  }

  try {
    const { importPersonaSession } = await import('~/lib/testing/simulationHelpers')
    const { validateSessionState } = await import('~/lib/testing/testUserValidation')

    // Parse and validate
    const sessionState = validateSessionState(JSON.parse(importJson.value))

    // Activate the persona
    authStore.simulateLogin(sessionState.personaKey)

    // Set simulation mode
    authStore.setSimulationMode(sessionState.simulationMode)

    // Restore progress
    const persona = testUserPersonas[sessionState.personaKey]
    if (persona) {
      // Clear existing progress
      authStore.clearPersonaProgress(sessionState.personaKey)

      // Restore each completed step
      sessionState.testScriptProgress.completedSteps.forEach((stepIndex) => {
        authStore.toggleTestScriptStep(sessionState.personaKey, stepIndex, persona.testScript.length)
      })

      // Restore notes
      Object.entries(sessionState.testScriptProgress.notes).forEach(([index, note]) => {
        authStore.updateTestScriptNote(sessionState.personaKey, parseInt(index), note)
      })
    }

    showImportModal.value = false
    toast.success('Session imported', `Restored session for ${persona?.title || sessionState.personaKey}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import session'
    toast.error('Import failed', message)
  }
}

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Shift + E: End simulation
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    event.preventDefault()
    if (activePersona.value) {
      handleEndSimulation()
    }
  }

  // Ctrl/Cmd + Shift + T: Toggle test users panel (navigate home if already here)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
    event.preventDefault()
    router.push('/')
  }

  // Number keys 1-8: Quick activate personas (when no input focused)
  if (!['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
    const num = parseInt(event.key)
    if (num >= 1 && num <= 8) {
      const personas = Object.values(testUserPersonas)
      if (personas[num - 1]) {
        event.preventDefault()
        handleActivatePersona(personas[num - 1].key)
      }
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>
