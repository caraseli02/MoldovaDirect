<template>
  <div class="press-mentions-bar">
    <div class="luxury-container">
      <div class="flex flex-col items-center">
        <p class="text-xs uppercase tracking-widest text-luxury-brown/60 mb-6 font-semibold">
          {{ $t('luxury.press.title') || 'As Featured In' }}
        </p>

        <div class="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          <div
            v-for="mention in pressMentions"
            :key="mention.id"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 0.6, y: 0 }"
            class="press-logo"
          >
            <div class="text-luxury-brown/70 font-serif text-xl font-semibold">
              {{ mention.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pressMentions = [
  {
    id: 1,
    name: 'El País',
    logo: '/images/press/el-pais.svg',
  },
  {
    id: 2,
    name: 'La Vanguardia',
    logo: '/images/press/la-vanguardia.svg',
  },
  {
    id: 3,
    name: 'Wine Spectator',
    logo: '/images/press/wine-spectator.svg',
  },
  {
    id: 4,
    name: 'Food & Wine',
    logo: '/images/press/food-wine.svg',
  },
  {
    id: 5,
    name: 'Decanter',
    logo: '/images/press/decanter.svg',
  },
]
</script>

<style scoped>
.press-mentions-bar {
  background: linear-gradient(to right, rgba(26, 26, 26, 0.03), rgba(26, 26, 26, 0.06), rgba(26, 26, 26, 0.03));
  border-top: 1px solid rgba(26, 26, 26, 0.1);
  border-bottom: 1px solid rgba(26, 26, 26, 0.1);
  padding: 2rem 2rem;
}

.press-logo {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.press-logo:hover {
  opacity: 1 !important;
  transform: translateY(-3px);
}
</style>
