<!--
  Email Template Management Page

  Requirements addressed:
  - 5.1: Edit email template HTML and styling
  - 5.2: Preview function to test email appearance
  - 5.4: Validate HTML structure and warn about rendering issues

  Admin page for managing email templates across all locales
-->

<template>
  <div class="space-y-6">
    <Head>
      <Title>Email Templates - Admin - Moldova Direct</Title>
    </Head>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Email Templates
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage and customize email templates for order notifications
        </p>
      </div>
    </div>

    <!-- Template Management Interface -->
    <AdminEmailTemplateManager />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Lazy load admin email template component to reduce main bundle size
const AdminEmailTemplateManager = useAsyncAdminComponent('Email/TemplateManager')

useHead({
  title: 'Email Templates - Admin - Moldova Direct',
  meta: [
    { name: 'description', content: 'Manage email templates for order notifications' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>
