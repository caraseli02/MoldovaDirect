<template>
  <section class="stats-counter landing-section bg-gradient-to-br from-rose-50 to-amber-50 py-16">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div
          v-for="stat in stats"
          :key="stat.id"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="stat.delay"
          class="text-center"
        >
          <div class="stat-number text-4xl md:text-5xl font-bold text-rose-600 mb-2">
            <CountUp
              :end-val="stat.value"
              :duration="2"
              :suffix="stat.suffix"
              :prefix="stat.prefix"
              :decimals="stat.decimals"
            />
          </div>
          <div class="stat-label text-sm md:text-base text-gray-600 font-medium">
            {{ t(stat.label) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CountUp from 'vue-countup-v3'

const { t } = useI18n()

const stats = [
  {
    id: 'customers',
    value: 12500,
    suffix: '+',
    prefix: '',
    decimals: 0,
    label: 'landing.stats.customers',
    delay: 0
  },
  {
    id: 'products',
    value: 250,
    suffix: '+',
    prefix: '',
    decimals: 0,
    label: 'landing.stats.products',
    delay: 100
  },
  {
    id: 'rating',
    value: 4.9,
    suffix: '',
    prefix: '',
    decimals: 1,
    label: 'landing.stats.rating',
    delay: 200
  },
  {
    id: 'countries',
    value: 45,
    suffix: '+',
    prefix: '',
    decimals: 0,
    label: 'landing.stats.countries',
    delay: 300
  }
]
</script>

<style scoped>
.landing-section {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

@media (max-width: 768px) {
  .landing-section {
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
  }
}
</style>
