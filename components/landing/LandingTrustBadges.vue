<template>
  <section class="trust-badges border-y border-cream-200 bg-cream-50 py-6 sm:py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
        <div
          v-for="badge in trustBadges"
          :key="badge.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :visible="{ opacity: 1, scale: 1 }"
          :delay="badge.delay"
          class="flex items-center gap-2 text-gray-700 sm:gap-3"
        >
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-10 sm:w-10">
            <commonIcon :name="badge.icon" class="h-5 w-5 sm:h-6 sm:w-6" :class="badge.iconColor" />
          </div>
          <div class="text-xs sm:text-sm">
            <div class="font-semibold">{{ t(badge.title) }}</div>
            <div class="text-[10px] text-gray-500 sm:text-xs">{{ t(badge.subtitle) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const trustBadges = [
  {
    id: 'ssl',
    icon: 'lucide:shield-check',
    iconColor: 'text-green-600',
    title: 'landing.trustBadges.ssl.title',
    subtitle: 'landing.trustBadges.ssl.subtitle',
    delay: 0
  },
  {
    id: 'shipping',
    icon: 'lucide:truck',
    iconColor: 'text-blue-600',
    title: 'landing.trustBadges.shipping.title',
    subtitle: 'landing.trustBadges.shipping.subtitle',
    delay: 100
  },
  {
    id: 'guarantee',
    icon: 'lucide:badge-check',
    iconColor: 'text-purple-600',
    title: 'landing.trustBadges.guarantee.title',
    subtitle: 'landing.trustBadges.guarantee.subtitle',
    delay: 200
  },
  {
    id: 'support',
    icon: 'lucide:headphones',
    iconColor: 'text-amber-600',
    title: 'landing.trustBadges.support.title',
    subtitle: 'landing.trustBadges.support.subtitle',
    delay: 300
  }
]
</script>

<style scoped>
.bg-cream-50 {
  background-color: #fafaf8;
}

.border-cream-200 {
  border-color: #e8e7e3;
}
</style>
