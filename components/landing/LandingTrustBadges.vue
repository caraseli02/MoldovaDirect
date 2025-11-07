<template>
  <section class="trust-badges bg-cream-50 py-8 border-y border-cream-200">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        <div
          v-for="badge in trustBadges"
          :key="badge.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :visible="{ opacity: 1, scale: 1 }"
          :delay="badge.delay"
          class="flex items-center gap-3 text-gray-700"
        >
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Icon :name="badge.icon" class="w-6 h-6" :class="badge.iconColor" />
          </div>
          <div class="text-sm">
            <div class="font-semibold">{{ t(badge.title) }}</div>
            <div class="text-gray-500 text-xs">{{ t(badge.subtitle) }}</div>
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
