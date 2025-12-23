<template>
  <nav
    aria-label="Breadcrumb"
    class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ol
        role="list"
        class="flex items-center space-x-2 py-3 text-sm"
        itemscope
        itemtype="https://schema.org/BreadcrumbList"
      >
        <!-- Home -->
        <li
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/ListItem"
        >
          <NuxtLink
            to="/"
            class="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            itemprop="item"
          >
            <commonIcon
              name="lucide:home"
              class="h-4 w-4"
              aria-hidden="true"
            />
            <span
              class="sr-only"
              itemprop="name"
            >{{ t('common.home') }}</span>
            <meta
              itemprop="position"
              content="1"
            />
          </NuxtLink>
        </li>

        <!-- Separator -->
        <li aria-hidden="true">
          <commonIcon
            name="lucide:chevron-right"
            class="h-4 w-4 text-gray-400"
          />
        </li>

        <!-- Products (always visible) -->
        <li
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/ListItem"
        >
          <NuxtLink
            to="/products"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            :class="{ 'font-medium text-gray-900 dark:text-white': !currentCategory && !searchQuery }"
            itemprop="item"
          >
            <span itemprop="name">{{ t('products.breadcrumb') }}</span>
            <meta
              itemprop="position"
              content="2"
            />
          </NuxtLink>
        </li>

        <!-- Category Path (collapsible on mobile) -->
        <template v-if="breadcrumbItems.length > 0">
          <!-- Mobile: Show ellipsis if more than 1 category -->
          <template v-if="isMobile && breadcrumbItems.length > 1">
            <!-- Ellipsis button -->
            <li aria-hidden="true">
              <commonIcon
                name="lucide:chevron-right"
                class="h-4 w-4 text-gray-400"
              />
            </li>
            <li>
              <button
                type="button"
                class="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                :aria-label="t('products.breadcrumbNav.showAll')"
                @click="toggleExpanded"
              >
                <commonIcon
                  name="lucide:more-horizontal"
                  class="h-4 w-4"
                />
              </button>
            </li>

            <!-- Separator -->
            <li aria-hidden="true">
              <commonIcon
                name="lucide:chevron-right"
                class="h-4 w-4 text-gray-400"
              />
            </li>

            <!-- Last item -->
            <li
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span
                class="font-medium text-gray-900 dark:text-white"
                itemprop="name"
              >
                {{ breadcrumbItems[breadcrumbItems.length - 1]?.label }}
              </span>
              <meta
                itemprop="position"
                :content="String(breadcrumbItems.length + 2)"
              />
            </li>
          </template>

          <!-- Desktop or Expanded Mobile: Show all categories -->
          <template v-else>
            <template
              v-for="(item, index) in breadcrumbItems"
              :key="item.id"
            >
              <!-- Separator -->
              <li aria-hidden="true">
                <commonIcon
                  name="lucide:chevron-right"
                  class="h-4 w-4 text-gray-400"
                />
              </li>

              <!-- Breadcrumb item -->
              <li
                itemprop="itemListElement"
                itemscope
                itemtype="https://schema.org/ListItem"
              >
                <component
                  :is="index === breadcrumbItems.length - 1 && !searchQuery ? 'span' : 'NuxtLink'"
                  :to="index === breadcrumbItems.length - 1 && !searchQuery ? undefined : item.href"
                  class="transition-colors"
                  :class="
                    index === breadcrumbItems.length - 1 && !searchQuery
                      ? 'font-medium text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  "
                  :itemprop="item.href ? 'item' : undefined"
                >
                  <span itemprop="name">{{ item.label }}</span>
                  <meta
                    itemprop="position"
                    :content="String(index + 3)"
                  />
                </component>
              </li>
            </template>
          </template>
        </template>

        <!-- Search Query (if active) -->
        <template v-if="searchQuery">
          <li aria-hidden="true">
            <commonIcon
              name="lucide:chevron-right"
              class="h-4 w-4 text-gray-400"
            />
          </li>
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span
              class="font-medium text-gray-900 dark:text-white"
              itemprop="name"
            >
              {{ t('products.breadcrumbNav.searchResults', { query: searchQuery }) }}
            </span>
            <meta
              itemprop="position"
              :content="String(breadcrumbItems.length + 3)"
            />
          </li>
        </template>
      </ol>

      <!-- Expanded mobile view -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="isExpanded && isMobile && breadcrumbItems.length > 1"
          class="overflow-hidden"
        >
          <ol
            role="list"
            class="space-y-2 pb-3 pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            <li
              v-for="item in breadcrumbItems.slice(0, -1)"
              :key="item.id"
              class="pl-6"
            >
              <NuxtLink
                :to="item.href"
                class="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <commonIcon
                  name="lucide:corner-down-right"
                  class="mr-2 h-3 w-3"
                  aria-hidden="true"
                />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ol>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWindowSize } from '@vueuse/core'
import commonIcon from '~/components/common/Icon.vue'
import type { Category } from '~/types'

interface BreadcrumbItem {
  id: string
  label: string
  href: string
}

interface Props {
  currentCategory?: Category | null
  searchQuery?: string
  categoryPath?: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  currentCategory: null,
  searchQuery: '',
  categoryPath: () => [],
})

const { t } = useI18n()
const { width } = useWindowSize()

// Mobile detection
const isMobile = computed(() => width.value < 768)

// Expanded state for mobile
const isExpanded = ref(false)

// Build breadcrumb items from category path
const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []

  // Use provided category path or build from current category
  const categories = props.categoryPath.length > 0 ? props.categoryPath : buildCategoryPath(props.currentCategory)

  categories.forEach((category, _index) => {
    // Get localized name from translations
    const categoryName = (category as Record<string, any>).name
    const label = typeof categoryName === 'string'
      ? categoryName
      : typeof categoryName === 'object'
        ? categoryName?.en || 'Category'
        : 'Category'

    items.push({
      id: String(category.id),
      label,
      href: `/products?category=${category.id}`,
    })
  })

  return items
})

/**
 * Build category path from current category by traversing parent relationships
 */
function buildCategoryPath(category: Category | null | undefined): Category[] {
  if (!category) return []

  const path: Category[] = []
  let current: Category | null | undefined = category

  // Traverse up the parent chain
  while (current) {
    path.unshift(current)
    // Check for parent property, fallback to undefined
    current = (current as any).parent as Category || undefined
  }

  return path
}

/**
 * Toggle expanded state on mobile
 */
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

/**
 * Close expanded view when switching to desktop
 */
watch(isMobile, (newValue) => {
  if (!newValue) {
    isExpanded.value = false
  }
})

/**
 * Close expanded view when category changes
 */
watch(() => props.currentCategory, () => {
  isExpanded.value = false
})
</script>
