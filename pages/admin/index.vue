<!--
  Admin Dashboard Main Page
  
  Requirements addressed:
  - 3.1: Dashboard statistics and overview display
  - 6.4: Real-time data refresh functionality
  - 5.1, 5.2: Admin authentication and authorization
  
  Main admin dashboard page that displays:
  - Dashboard overview with statistics
  - Recent activity
  - Quick actions
  - System status
-->

<template>
  <div>
    <!-- Page Title -->
    <Head>
      <Title>Admin Dashboard - Moldova Direct</Title>
      <Meta name="description" content="Admin dashboard for Moldova Direct e-commerce platform" />
    </Head>

    <!-- Dashboard Content - Lazy Loaded -->
    <AdminDashboardOverview />
  </div>
</template>

<script setup lang="ts">
import AdminDashboardOverview from '~/components/admin/Dashboard/Overview.vue'

// Define page meta for admin layout and authentication
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'] // Auth middleware runs and validates before page loads
})

// SEO and meta
useHead({
  title: 'Admin Dashboard - Moldova Direct',
  meta: [
    { name: 'description', content: 'Admin dashboard for Moldova Direct e-commerce platform' },
    { name: 'robots', content: 'noindex, nofollow' } // Don't index admin pages
  ]
})
</script>