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
                  <h3 class="font-semibold text-slate-900 dark:text-white">Suggested checks</h3>
                  <ol class="mt-2 list-decimal space-y-1 pl-5">
                    <li v-for="step in activePersona.testScript" :key="step">{{ step }}</li>
                  </ol>
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
          <h2 class="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Available personas</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <article
              v-for="persona in personaList"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { testUserPersonas, type TestUserPersonaKey } from '~/lib/testing/testUserPersonas'

definePageMeta({
  layout: false
})

useHead({
  title: 'Test Users Simulator — Moldova Direct',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const authStore = useAuthStore()
const toastStore = useToastStore()
const runtimeConfig = useRuntimeConfig()
const localePath = useLocalePath()

const isSimulationEnabled = computed(() => runtimeConfig.public.enableTestUsers)
const personaList = computed(() => Object.values(testUserPersonas))
const activePersona = computed(() => {
  const key = authStore.activeTestPersona
  return key ? testUserPersonas[key] : null
})

const handleActivatePersona = (key: TestUserPersonaKey) => {
  try {
    authStore.simulateLogin(key)
    const persona = testUserPersonas[key]
    toastStore.success(
      'Simulación activada',
      `Ahora navegas como ${persona.user.name}. Sigue la lista de comprobación para validar el flujo.`
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar la simulación.'
    toastStore.error('Error al activar la persona', message)
  }
}

const handleEndSimulation = () => {
  authStore.simulateLogout()
  toastStore.info('Simulación finalizada', 'El estado del usuario simulado se ha restablecido.')
}

const handleClearLockout = () => {
  authStore.clearLockout()
  toastStore.success('Temporizador limpiado', 'El bloqueo temporal se ha eliminado para continuar las pruebas.')
}
</script>
