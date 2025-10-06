<template>
  <footer class="bg-gray-900 text-white">
    <div class="container py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Moldova Direct</h3>
          <p class="text-gray-400 text-sm">
            {{ $t('footer.info.about') }}
          </p>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Information -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.info.title') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="localePath('/about')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.about') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/terms')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.terms') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/privacy')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.privacy') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/shipping')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.shipping') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Help -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.help.title') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="localePath('/contact')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.contact') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/faq')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.faq') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/returns')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.returns') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/track-order')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.track') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Newsletter -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.newsletter.title') }}</h3>
          <p class="text-gray-400 text-sm mb-4">
            {{ $t('footer.newsletter.description') }}
          </p>
          <form @submit.prevent="subscribeNewsletter" class="flex flex-col space-y-2">
            <input
              v-model="email"
              type="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              class="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
            <Button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {{ $t('footer.newsletter.button') }}
            </Button>
          </form>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
        {{ $t('footer.copyright') }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const localePath = useLocalePath()
const email = ref('')

const subscribeNewsletter = () => {
  // TODO: Implement newsletter subscription
  console.log('Subscribe:', email.value)
  email.value = ''
}
</script>