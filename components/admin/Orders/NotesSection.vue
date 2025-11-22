<template>
  <Card class="rounded-2xl">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Order Notes</CardTitle>
          <CardDescription>
            Internal admin notes and customer communications
          </CardDescription>
        </div>
        <Button
          v-if="!showComposer"
          size="sm"
          @click="showComposer = true"
        >
          <commonIcon name="lucide:plus" class="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <!-- Note Composer -->
      <div v-if="showComposer" class="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <AdminOrdersNoteComposer
          :order-id="orderId"
          @note-added="handleNoteAdded"
          @cancel="showComposer = false"
        />
      </div>

      <!-- Notes List -->
      <div v-if="sortedNotes.length > 0" class="space-y-4">
        <!-- Filter Tabs -->
        <div class="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
          <Button
            @click="filterType = 'all'"
            variant="ghost"
            size="sm"
            :class="[
              'border-b-2 rounded-none',
              filterType === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent'
            ]"
          >
            All ({{ notes.length }})
          </Button>
          <Button
            @click="filterType = 'internal'"
            variant="ghost"
            size="sm"
            :class="[
              'border-b-2 rounded-none',
              filterType === 'internal'
                ? 'border-primary text-primary'
                : 'border-transparent'
            ]"
          >
            Internal ({{ internalNotesCount }})
          </Button>
          <Button
            @click="filterType = 'customer'"
            variant="ghost"
            size="sm"
            :class="[
              'border-b-2 rounded-none',
              filterType === 'customer'
                ? 'border-primary text-primary'
                : 'border-transparent'
            ]"
          >
            Customer ({{ customerNotesCount }})
          </Button>
        </div>

        <!-- Notes -->
        <div class="space-y-3">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="p-4 rounded-lg border transition-colors"
            :class="[
              note.noteType === 'internal'
                ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
            ]"
          >
            <!-- Note Header -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Badge
                  :variant="note.noteType === 'internal' ? 'secondary' : 'default'"
                  class="text-xs"
                >
                  <commonIcon
                    :name="note.noteType === 'internal' ? 'lucide:lock' : 'lucide:user'"
                    class="h-3 w-3 mr-1"
                  />
                  {{ note.noteType === 'internal' ? 'Internal' : 'Customer' }}
                </Badge>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTimestamp(note.createdAt) }}
                </span>
              </div>
              <span v-if="note.createdBy" class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <commonIcon name="lucide:user-circle" class="h-3 w-3 mr-1" />
                Admin
              </span>
            </div>

            <!-- Note Content -->
            <p class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {{ note.content }}
            </p>

            <!-- Note Footer (if updated) -->
            <div v-if="note.updatedAt !== note.createdAt" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Updated {{ formatTimestamp(note.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!showComposer" class="text-center py-8">
        <commonIcon name="lucide:message-square" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          No notes have been added to this order yet.
        </p>
        <Button
          size="sm"
          @click="showComposer = true"
        >
          <commonIcon name="lucide:plus" class="h-4 w-4 mr-1" />
          Add First Note
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { OrderNote } from '~/types/database'

interface Props {
  orderId: number
  notes: OrderNote[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updated: []
}>()

// State
const showComposer = ref(false)
const filterType = ref<'all' | 'internal' | 'customer'>('all')

// Computed
const sortedNotes = computed(() => {
  return [...props.notes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const filteredNotes = computed(() => {
  if (filterType.value === 'all') {
    return sortedNotes.value
  }
  return sortedNotes.value.filter(note => note.noteType === filterType.value)
})

const internalNotesCount = computed(() => {
  return props.notes.filter(note => note.noteType === 'internal').length
})

const customerNotesCount = computed(() => {
  return props.notes.filter(note => note.noteType === 'customer').length
})

// Methods
const handleNoteAdded = () => {
  showComposer.value = false
  emit('updated')
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Relative time for recent notes
  if (diffMins < 1) {
    return 'Just now'
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // Absolute time for older notes
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
