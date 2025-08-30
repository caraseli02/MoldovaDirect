<template>
  <nav class="category-navigation">
    <!-- Desktop Navigation -->
    <div v-if="!isMobile" class="hidden lg:block">
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Main Categories -->
            <div class="flex space-x-8">
              <NuxtLink
                to="/products"
                class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                :class="{ 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400': !currentCategory }"
              >
                {{ $t('products.categories.all') }}
                <span v-if="showProductCount && totalProductCount" class="ml-1 text-gray-500 dark:text-gray-400 text-xs">
                  ({{ totalProductCount }})
                </span>
              </NuxtLink>
              
              <div
                v-for="category in rootCategories"
                :key="category.id"
                class="relative group"
              >
                <button
                  class="flex items-center text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                  :class="{ 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400': isCurrentCategory(category) }"
                  @click="navigateToCategory(category)"
                  @mouseenter="showDropdown(category.id)"
                  @mouseleave="hideDropdown"
                >
                  <Icon v-if="category.icon" :name="category.icon" class="w-4 h-4 mr-2" />
                  {{ category.name }}
                  <span v-if="showProductCount" class="ml-1 text-gray-500 dark:text-gray-400 text-xs">
                    ({{ category.productCount }})
                  </span>
                  <Icon 
                    v-if="category.children && category.children.length > 0"
                    name="heroicons:chevron-down" 
                    class="w-4 h-4 ml-1" 
                  />
                </button>
                
                <!-- Dropdown Menu -->
                <div
                  v-if="category.children && category.children.length > 0 && activeDropdown === category.id"
                  class="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                  @mouseenter="showDropdown(category.id)"
                  @mouseleave="hideDropdown"
                >
                  <div class="py-2">
                    <NuxtLink
                      v-for="child in category.children"
                      :key="child.id"
                      :to="`/products?category=${child.slug || child.id}`"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': isCurrentCategory(child) }"
                    >
                      <Icon v-if="child.icon" :name="child.icon" class="w-4 h-4 mr-3" />
                      {{ child.name }}
                      <span v-if="showProductCount" class="ml-auto text-gray-500 dark:text-gray-400 text-xs">
                        {{ child.productCount }}
                      </span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="isMobile" class="lg:hidden">
      <!-- Mobile Category Button -->
      <button
        @click="showMobileNav = true"
        class="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-left"
      >
        <div class="flex items-center">
          <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
          <span class="font-medium text-gray-900 dark:text-white">
            {{ currentCategoryName || $t('products.categories.all') }}
          </span>
        </div>
        <Icon name="heroicons:chevron-down" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </button>

      <!-- Mobile Category Modal -->
      <Teleport to="body">
        <div
          v-if="showMobileNav"
          class="fixed inset-0 z-50 lg:hidden"
          @click="showMobileNav = false"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div
            class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl max-h-[80vh] overflow-hidden transform transition-transform"
            :class="showMobileNav ? 'translate-y-0' : 'translate-y-full'"
            @click.stop
          >
            <!-- Mobile Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ $t('products.filters.categories') }}
              </h2>
              <button
                @click="showMobileNav = false"
                class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>

            <!-- Mobile Category List -->
            <div class="overflow-y-auto max-h-[calc(80vh-80px)]">
              <div class="p-4 space-y-1">
                <!-- All Products -->
                <NuxtLink
                  to="/products"
                  class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': !currentCategory }"
                  @click="showMobileNav = false"
                >
                  <div class="flex items-center">
                    <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-3" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ $t('products.categories.all') }}</span>
                  </div>
                  <span v-if="showProductCount && totalProductCount" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ totalProductCount }}
                  </span>
                </NuxtLink>

                <!-- Category Tree -->
                <ProductMobileCategoryItem
                  v-for="category in categories"
                  :key="category.id"
                  :category="category"
                  :current-category="currentCategory"
                  :show-product-count="showProductCount"
                  :level="0"
                  @select="handleMobileCategorySelect"
                />
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Breadcrumb Navigation -->
    <div v-if="breadcrumbs.length > 0" class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex py-3" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <NuxtLink
                to="/products"
                class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
              >
                {{ $t('products.categories.all') }}
              </NuxtLink>
            </li>
            <li
              v-for="(breadcrumb, index) in breadcrumbs"
              :key="breadcrumb.id"
              class="flex items-center"
            >
              <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
              <NuxtLink
                v-if="index < breadcrumbs.length - 1"
                :to="`/products?category=${breadcrumb.slug || breadcrumb.id}`"
                class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
              >
                {{ breadcrumb.name }}
              </NuxtLink>
              <span
                v-else
                class="text-gray-900 dark:text-white text-sm font-medium"
              >
                {{ breadcrumb.name }}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { CategoryWithChildren } from '~/types'

interface Props {
  categories: CategoryWithChildren[]
  currentCategory?: string
  showProductCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showProductCount: true
})

// Composables
const { isMobile } = useDevice()
const { t } = useI18n()
const router = useRouter()

// Reactive state
const showMobileNav = ref(false)
const activeDropdown = ref<number | null>(null)
const dropdownTimeout = ref<NodeJS.Timeout | null>(null)

// Computed properties
const rootCategories = computed(() => {
  return props.categories.filter(cat => !cat.parentId)
})

const totalProductCount = computed(() => {
  return props.categories.reduce((total, cat) => total + cat.productCount, 0)
})

const currentCategoryName = computed(() => {
  if (!props.currentCategory) return null
  
  const findCategory = (categories: CategoryWithChildren[], id: string): CategoryWithChildren | null => {
    for (const category of categories) {
      if (category.id.toString() === id || category.slug === id) {
        return category
      }
      if (category.children) {
        const found = findCategory(category.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  const category = findCategory(props.categories, props.currentCategory)
  return category?.name || null
})

const breadcrumbs = computed(() => {
  if (!props.currentCategory) return []
  
  const buildBreadcrumbs = (categories: CategoryWithChildren[], targetId: string, path: CategoryWithChildren[] = []): CategoryWithChildren[] => {
    for (const category of categories) {
      const currentPath = [...path, category]
      
      if (category.id.toString() === targetId || category.slug === targetId) {
        return currentPath
      }
      
      if (category.children) {
        const result = buildBreadcrumbs(category.children, targetId, currentPath)
        if (result.length > 0) return result
      }
    }
    return []
  }
  
  return buildBreadcrumbs(props.categories, props.currentCategory)
})

// Methods
const isCurrentCategory = (category: CategoryWithChildren): boolean => {
  return category.id.toString() === props.currentCategory || category.slug === props.currentCategory
}

const navigateToCategory = (category: CategoryWithChildren) => {
  const path = `/products?category=${category.slug || category.id}`
  router.push(path)
}

const showDropdown = (categoryId: number) => {
  if (dropdownTimeout.value) {
    clearTimeout(dropdownTimeout.value)
    dropdownTimeout.value = null
  }
  activeDropdown.value = categoryId
}

const hideDropdown = () => {
  dropdownTimeout.value = setTimeout(() => {
    activeDropdown.value = null
  }, 150)
}

const handleMobileCategorySelect = (category: CategoryWithChildren) => {
  navigateToCategory(category)
  showMobileNav.value = false
}

// Close mobile nav on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showMobileNav.value) {
      showMobileNav.value = false
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    if (dropdownTimeout.value) {
      clearTimeout(dropdownTimeout.value)
    }
  })
})
</script>

<style scoped>
.category-navigation {
  position: sticky;
  top: 0;
  z-index: 40;
}

/* Smooth dropdown animations */
.group:hover .absolute {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>