<template>
  <section class="border-t border-b border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
    <div class="container">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="flex flex-wrap items-center justify-center gap-8 md:gap-12"
      >
        <!-- Certification Badge -->
        <div
          v-for="(cert, index) in certifications"
          :key="cert.key"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :visible-once="{
            opacity: 1,
            scale: 1,
            transition: { duration: 400, delay: index * 100 },
          }"
          class="group flex items-center gap-3 text-center"
        >
          <!-- Icon -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300"
            :class="cert.iconBg"
          >
            <commonIcon
              :name="cert.icon"
              class="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
              :class="cert.iconColor"
            />
          </div>

          <!-- Text -->
          <div class="text-left">
            <div class="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {{ t(cert.title) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ t(cert.subtitle) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Certification {
  key: string
  icon: string
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  description?: string
}

const { t } = useI18n()

const certifications: Certification[] = [
  {
    key: 'authentic',
    icon: 'lucide:shield-check',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
    iconColor: 'text-primary-600 dark:text-primary-400',
    title: 'home.certifications.authentic.title',
    subtitle: 'home.certifications.authentic.subtitle',
    description: 'home.certifications.authentic.description'
  },
  {
    key: 'quality',
    icon: 'lucide:award',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: 'home.certifications.quality.title',
    subtitle: 'home.certifications.quality.subtitle',
    description: 'home.certifications.quality.description'
  },
  {
    key: 'sustainable',
    icon: 'lucide:leaf',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    title: 'home.certifications.sustainable.title',
    subtitle: 'home.certifications.sustainable.subtitle',
    description: 'home.certifications.sustainable.description'
  },
  {
    key: 'secure',
    icon: 'lucide:lock',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'home.certifications.secure.title',
    subtitle: 'home.certifications.secure.subtitle',
    description: 'home.certifications.secure.description'
  }
]
</script>
