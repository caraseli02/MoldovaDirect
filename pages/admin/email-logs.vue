<!--
  Email Delivery Monitoring Page
  
  Requirements addressed:
  - 4.4: View email delivery logs and statistics
  - 4.5: Search by order number, customer email, and date range
  - 4.6: Email delivery status reporting and bounce reason tracking
  
  Admin dashboard for monitoring email delivery
-->

<template>
  <div class="space-y-6">
    <Head>
      <Title>Email Logs - Admin - Moldova Direct</Title>
    </Head>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Email Delivery Logs
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor email delivery status and troubleshoot issues
        </p>
      </div>
    </div>

    <!-- Email Delivery Statistics -->
    <AdminEmailDeliveryStats />

    <!-- Email Logs Table with Search -->
    <AdminEmailLogsTable />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// Lazy load admin email components to reduce main bundle size
const AdminEmailDeliveryStats = useAsyncAdminComponent('Email/DeliveryStats')
const AdminEmailLogsTable = useAsyncAdminComponent('Email/LogsTable')

useHead({
  title: 'Email Logs - Admin - Moldova Direct',
  meta: [
    { name: 'description', content: 'Monitor email delivery logs and statistics' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
