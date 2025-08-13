<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <nuxt-link to="/admin" class="text-xl font-bold text-gray-900">
                Moldova Direct Admin
              </nuxt-link>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <nuxt-link
                to="/admin"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-blue-500 text-gray-900"
              >
                Dashboard
              </nuxt-link>
              <nuxt-link
                to="/admin/products"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-blue-500 text-gray-900"
              >
                Products
              </nuxt-link>
              <nuxt-link
                to="/admin/categories"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-blue-500 text-gray-900"
              >
                Categories
              </nuxt-link>
            </div>
          </div>
          
          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <nuxt-link
              to="/"
              class="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              View Site
            </nuxt-link>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
// Admin layout - basic structure for now
// TODO: Add authentication checks in Phase 3
</script>