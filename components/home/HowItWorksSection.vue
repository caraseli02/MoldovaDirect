<template>
  <section class="bg-gray-50 py-20 dark:bg-gray-900 md:py-28">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">
          {{ t('home.howItWorks.title') }}
        </h2>
        <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {{ t('home.howItWorks.subtitle') }}
        </p>
      </div>
      <ol class="mt-12 grid gap-8 md:grid-cols-3 relative list-none">
        <li
          v-for="(step, index) in steps"
          :key="step.key"
          class="step-card relative overflow-hidden rounded-3xl bg-white p-8 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-950"
          :class="{ 'has-connector': index < steps.length - 1 }"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <commonIcon
              :name="step.icon"
              class="h-6 w-6"
            />
          </div>
          <div class="mt-6">
            <p class="text-sm font-semibold text-slate-600">
              {{ formatStep(index + 1) }}
            </p>
            <h3 class="mt-2 text-xl font-semibold">
              {{ step.title }}
            </h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {{ step.description }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  steps: Array<{
    key: string
    title: string
    description: string
    icon: string
  }>
}>()

const { t } = useI18n()

const formatStep = (value: number) => value.toString().padStart(2, '0')
</script>

<style scoped>
/* Connector lines between steps (desktop only) */
@media (min-width: 768px) {
  .step-card.has-connector::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -2rem;
    width: 2rem;
    height: 2px;
    background: linear-gradient(to right, var(--color-primary-200), transparent);
    transform: translateY(-50%);
    pointer-events: none;
  }

  .dark .step-card.has-connector::after {
    background: linear-gradient(to right, var(--color-primary-800), transparent);
  }

  /* Arrow tip */
  .step-card.has-connector::before {
    content: '';
    position: absolute;
    top: 50%;
    right: -2.15rem;
    width: 0;
    height: 0;
    border-left: 6px solid var(--color-primary-200);
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .dark .step-card.has-connector::before {
    border-left-color: var(--color-primary-800);
  }
}
</style>
