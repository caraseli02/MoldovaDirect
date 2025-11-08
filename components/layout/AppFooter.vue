<template>
  <footer class="bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400">
    <!-- Main Footer -->
    <div class="max-w-[980px] mx-auto px-4 sm:px-6 py-12 md:py-[60px]">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 md:gap-x-12">
        <!-- Shop -->
        <div>
          <h3 class="text-[12px] font-semibold text-gray-900 dark:text-white mb-3">
            {{ $t('common.shop') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/products')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                All Products
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/products?category=wines')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Wines
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/products?category=foods')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Foods
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h3 class="text-[12px] font-semibold text-gray-900 dark:text-white mb-3">
            Company
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/about')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.info.about') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/contact')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.help.contact') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-[12px] font-semibold text-gray-900 dark:text-white mb-3">
            {{ $t('footer.help.title') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/faq')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.help.faq') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/shipping')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.info.shipping') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/returns')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.help.returns') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h3 class="text-[12px] font-semibold text-gray-900 dark:text-white mb-3">
            Legal
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/terms')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.info.terms') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/privacy')"
                class="text-[12px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ $t('footer.info.privacy') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6 py-[17px]">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-gray-600 dark:text-gray-400">
          <div>
            {{ $t('footer.copyright') }}
          </div>
          <div class="flex items-center gap-2">
            <span>{{ $t('footer.payment.title') }}</span>
            <span>•</span>
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>
