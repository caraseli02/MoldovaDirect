<template>
  <nav
    aria-label="Breadcrumb"
    class="breadcrumb-nav"
  >
    <div class="breadcrumb-container">
      <ol
        role="list"
        class="breadcrumb-list"
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
            class="breadcrumb-link"
            itemprop="item"
          >
            <commonIcon
              name="lucide:home"
              class="breadcrumb-icon"
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
            class="breadcrumb-separator"
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
            class="breadcrumb-link"
            :class="{ 'breadcrumb-current': !currentCategory && !searchQuery }"
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
                class="breadcrumb-separator"
              />
            </li>
            <li>
              <button
                type="button"
                class="breadcrumb-ellipsis"
                :aria-label="t('products.breadcrumbNav.showAll')"
                @click="toggleExpanded"
              >
                <commonIcon
                  name="lucide:more-horizontal"
                  class="breadcrumb-icon"
                />
              </button>
            </li>

            <!-- Separator -->
            <li aria-hidden="true">
              <commonIcon
                name="lucide:chevron-right"
                class="breadcrumb-separator"
              />
            </li>

            <!-- Last item -->
            <li
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span
                class="breadcrumb-current"
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
                  class="breadcrumb-separator"
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
                  :class="
                    index === breadcrumbItems.length - 1 && !searchQuery
                      ? 'breadcrumb-current'
                      : 'breadcrumb-link'
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
              class="breadcrumb-separator"
            />
          </li>
          <li
            itemprop="itemListElement"
            itemscope
            itemtype="https://schema.org/ListItem"
          >
            <span
              class="breadcrumb-current"
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
          class="breadcrumb-expanded"
        >
          <ol
            role="list"
            class="breadcrumb-expanded-list"
          >
            <li
              v-for="item in breadcrumbItems.slice(0, -1)"
              :key="item.id"
              class="breadcrumb-expanded-item"
            >
              <NuxtLink
                :to="item.href"
                class="breadcrumb-expanded-link"
              >
                <commonIcon
                  name="lucide:corner-down-right"
                  class="breadcrumb-expanded-icon"
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

<style scoped>
/* Breadcrumb Navigation */
.breadcrumb-nav {
  background: #fff;
  border-bottom: 1px solid rgba(10, 10, 10, 0.1);
}

.dark .breadcrumb-nav {
  background: var(--md-charcoal);
  border-bottom-color: rgba(248, 245, 238, 0.1);
}

.breadcrumb-container {
  max-width: 88rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .breadcrumb-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .breadcrumb-container {
    padding: 0 2rem;
  }
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

/* Links */
.breadcrumb-link {
  display: flex;
  align-items: center;
  color: rgba(10, 10, 10, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--md-gold);
}

.dark .breadcrumb-link {
  color: rgba(248, 245, 238, 0.6);
}

.dark .breadcrumb-link:hover {
  color: var(--md-gold);
}

/* Current/Active Item */
.breadcrumb-current {
  font-weight: 500;
  color: var(--md-charcoal);
}

.dark .breadcrumb-current {
  color: var(--md-cream);
}

/* Icons */
.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.breadcrumb-separator {
  width: 1rem;
  height: 1rem;
  color: rgba(10, 10, 10, 0.4);
}

.dark .breadcrumb-separator {
  color: rgba(248, 245, 238, 0.4);
}

/* Ellipsis Button */
.breadcrumb-ellipsis {
  display: flex;
  align-items: center;
  color: rgba(10, 10, 10, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.breadcrumb-ellipsis:hover {
  color: var(--md-gold);
}

.dark .breadcrumb-ellipsis {
  color: rgba(248, 245, 238, 0.6);
}

.dark .breadcrumb-ellipsis:hover {
  color: var(--md-gold);
}

/* Expanded Mobile View */
.breadcrumb-expanded {
  overflow: hidden;
}

.breadcrumb-expanded-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0 0.75rem;
  border-top: 1px solid rgba(10, 10, 10, 0.1);
}

.dark .breadcrumb-expanded-list {
  border-top-color: rgba(248, 245, 238, 0.1);
}

.breadcrumb-expanded-item {
  padding-left: 1.5rem;
}

.breadcrumb-expanded-link {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(10, 10, 10, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-expanded-link:hover {
  color: var(--md-gold);
}

.dark .breadcrumb-expanded-link {
  color: rgba(248, 245, 238, 0.6);
}

.dark .breadcrumb-expanded-link:hover {
  color: var(--md-gold);
}

.breadcrumb-expanded-icon {
  width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.5rem;
}
</style>
