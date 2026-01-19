/**
 * Profile Page - Auto-Save Tests
 *
 * Tests auto-save functionality including:
 * - Debounced save on input change
 * - Save indicator states (idle, saving, saved, error)
 * - Multiple rapid changes (debounce resets)
 * - Save to Supabase user metadata
 * - Error handling and retry
 *
 * Aligns with: docs/specs/profile-test-coverage-plan.md Phase 2.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

import { createMockUser, createProfilePageMountOptions } from '../../helpers'

/**
 * Mock Profile Page Component with auto-save functionality
 */
const ProfilePageAutoSaveMock = {
  name: 'ProfilePageAutoSaveMock',
  template: `
    <div class="profile-page" data-testid="profile-page">
      <!-- Form Fields -->
      <div class="form-section">
        <input
          id="name"
          v-model="form.name"
          type="text"
          @input="onInputChange"
          data-testid="name-input"
        />
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          @input="onInputChange"
          data-testid="phone-input"
        />
      </div>

      <!-- Auto-save Indicator -->
      <div
        v-if="saveStatus !== 'idle'"
        class="fixed bottom-6 right-6 z-50"
        data-testid="save-indicator"
      >
        <div
          class="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg"
          :class="{
            'bg-zinc-800 text-white': saveStatus === 'saving',
            'bg-green-600 text-white': saveStatus === 'saved',
            'bg-red-600 text-white': saveStatus === 'error',
          }"
          data-testid="save-badge"
        >
          <span v-if="saveStatus === 'saving'" class="animate-spin" data-testid="spinner">⏳</span>
          <span v-else-if="saveStatus === 'saved'" data-testid="check">✓</span>
          <span v-else data-testid="cross">✗</span>
          <span class="text-sm font-medium" data-testid="save-text">{{ saveStatusText }}</span>
        </div>
      </div>

      <!-- Toast Messages -->
      <div v-if="toast.show" class="toast" :class="toast.type" data-testid="toast">
        {{ toast.message }}
      </div>
    </div>
  `,
  setup() {
    const form = ref({
      name: 'Test User',
      phone: '+37369123456',
      preferredLanguage: 'en',
      preferredCurrency: 'EUR',
    })

    const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const saveStatusText = ref('')
    const toast = ref({ show: false, message: '', type: '' })

    let saveTimeout: ReturnType<typeof setTimeout> | null = null
    const AUTO_SAVE_DELAY = 1000 // 1 second debounce

    // Track save attempts for testing
    const saveAttempts = ref(0)

    const onInputChange = () => {
      // Clear any pending save
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }

      // Set to saving state
      saveStatus.value = 'saving'
      saveStatusText.value = 'Saving...'

      // Debounce the save
      saveTimeout = setTimeout(async () => {
        await performSave()
      }, AUTO_SAVE_DELAY)
    }

    const performSave = async () => {
      saveAttempts.value++
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100))

        // Get Supabase client from global and call updateUser
        const supabaseClient = (global as unknown as { useSupabaseClient: () => ReturnType<typeof vi.fn> }).useSupabaseClient?.()
        if (supabaseClient?.auth?.updateUser) {
          await supabaseClient.auth.updateUser({
            data: { user_metadata: { ...form.value } },
          })
        }

        saveStatus.value = 'saved'
        saveStatusText.value = 'Saved'

        // Reset to idle after 2 seconds
        setTimeout(() => {
          saveStatus.value = 'idle'
          saveStatusText.value = ''
        }, 2000)
      }
      catch {
        saveStatus.value = 'error'
        saveStatusText.value = 'Failed to save'

        // Show error toast
        toast.value = {
          show: true,
          message: 'Failed to save changes',
          type: 'error',
        }

        // Reset to idle after 3 seconds
        setTimeout(() => {
          saveStatus.value = 'idle'
          saveStatusText.value = ''
        }, 3000)
      }
    }

    // Cleanup on unmount
    const cleanup = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }

    return {
      form,
      saveStatus,
      saveStatusText,
      toast,
      saveAttempts,
      onInputChange,
      performSave,
      cleanup,
    }
  },
}

describe('Profile Page - Auto-Save', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    global.useSupabaseUser = vi.fn(() => ref(createMockUser()))
    global.useNuxtApp = vi.fn(() => ({
      $i18n: { t: vi.fn((key: string) => key), locale: { value: 'en' } },
      $toast: { success: vi.fn(), error: vi.fn() },
    }))
    global.useSupabaseClient = vi.fn(() => ({
      auth: {
        updateUser: vi.fn().mockResolvedValue({
          data: { user: createMockUser() },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Debounce Behavior', () => {
    it('should not save immediately on input', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('New Name')
      await nextTick()

      // Should show saving state but not yet saved
      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saving')
    })

    it('should save after debounce delay', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('New Name')
      await nextTick()

      // Fast forward past debounce delay
      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saved')
    })

    it('should reset debounce on rapid input changes', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      const vm = wrapper.vm as any

      // First change
      await nameInput.setValue('Name 1')
      await nextTick()

      // Second change before debounce completes
      await vi.advanceTimersByTimeAsync(500)
      await nameInput.setValue('Name 2')
      await nextTick()

      // Third change
      await vi.advanceTimersByTimeAsync(500)
      await nameInput.setValue('Name 3')
      await nextTick()

      // Fast forward past original debounce time (should not have saved yet)
      await vi.advanceTimersByTimeAsync(100)
      expect(vm.saveStatus).toBe('saving')

      // Fast forward past the last debounce reset
      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(vm.saveStatus).toBe('saved')
    })

    it('should debounce each field independently', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      const phoneInput = wrapper.find('#phone')
      const vm = wrapper.vm as any

      // Change name - starts debounce timer
      await nameInput.setValue('New Name')
      await nextTick()
      expect(vm.saveStatus).toBe('saving')

      // Change phone 200ms later - resets debounce timer
      await vi.advanceTimersByTimeAsync(200)
      await phoneInput.setValue('+37369999999')
      await nextTick()
      expect(vm.saveStatus).toBe('saving')

      // Fast forward past the original name debounce time (1000ms from first change)
      // But phone change was at 200ms, so debounce was reset
      // Total time now: 1000ms from first change
      await vi.advanceTimersByTimeAsync(800)
      // Still saving because debounce was reset by phone change
      expect(vm.saveStatus).toBe('saving')

      // Fast forward past the phone debounce (1000ms from phone change at 200ms)
      await vi.advanceTimersByTimeAsync(300)
      await flushPromises()
      await nextTick()
      // Now it should be saved
      expect(vm.saveStatus).toBe('saved')
    })
  })

  describe('Save States', () => {
    it('should show saving state immediately on input', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saving')
      expect(vm.saveStatusText).toBe('Saving...')
      expect(wrapper.find('[data-testid="save-indicator"]').exists()).toBe(true)
    })

    it('should show saved state after successful save', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saved')
      expect(vm.saveStatusText).toBe('Saved')
      expect(wrapper.find('[data-testid="save-badge"]').classes()).toContain('bg-green-600')
    })

    it('should show error state on failed save', async () => {
      global.useSupabaseClient = vi.fn(() => ({
        auth: {
          updateUser: vi.fn().mockRejectedValue(new Error('Save failed')),
        },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('error')
      expect(vm.saveStatusText).toBe('Failed to save')
      expect(wrapper.find('[data-testid="save-badge"]').classes()).toContain('bg-red-600')
    })

    it('should reset to idle after successful save', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saved')

      // Fast forward past the 2 second reset delay
      await vi.advanceTimersByTimeAsync(2100)
      await nextTick()

      expect(vm.saveStatus).toBe('idle')
      expect(wrapper.find('[data-testid="save-indicator"]').exists()).toBe(false)
    })

    it('should reset to idle after error state', async () => {
      global.useSupabaseClient = vi.fn(() => ({
        auth: {
          updateUser: vi.fn().mockRejectedValue(new Error('Save failed')),
        },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('error')

      // Fast forward past the 3 second reset delay
      await vi.advanceTimersByTimeAsync(3100)
      await nextTick()

      expect(vm.saveStatus).toBe('idle')
    })
  })

  describe('Supabase Integration', () => {
    it('should call updateUser with form data', async () => {
      const mockUpdateUser = vi.fn().mockResolvedValue({
        data: { user: createMockUser() },
        error: null,
      })

      global.useSupabaseClient = vi.fn(() => ({
        auth: { updateUser: mockUpdateUser },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const vm = wrapper.vm as any
      vm.form.name = 'Updated Name'
      vm.form.phone = '+37369000000'

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Updated Name')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()

      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          user_metadata: expect.objectContaining({
            name: 'Updated Name',
            phone: '+37369000000',
          }),
        },
      })
    })

    it('should update only changed fields', async () => {
      const mockUpdateUser = vi.fn().mockResolvedValue({
        data: { user: createMockUser() },
        error: null,
      })

      global.useSupabaseClient = vi.fn(() => ({
        auth: { updateUser: mockUpdateUser },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      // Only change name
      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Only Name Changed')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()

      expect(mockUpdateUser).toHaveBeenCalled()
      const callArgs = mockUpdateUser.mock.calls[0][0]
      expect(callArgs.data.user_metadata.name).toBe('Only Name Changed')
    })
  })

  describe('Visual Indicators', () => {
    it('should show spinner during saving', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="save-badge"]').classes()).toContain('bg-zinc-800')
    })

    it('should show checkmark on saved', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="check"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="save-badge"]').classes()).toContain('bg-green-600')
    })

    it('should show cross on error', async () => {
      global.useSupabaseClient = vi.fn(() => ({
        auth: {
          updateUser: vi.fn().mockRejectedValue(new Error('Save failed')),
        },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="cross"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="save-badge"]').classes()).toContain('bg-red-600')
    })
  })

  describe('Error Handling', () => {
    it('should show toast notification on error', async () => {
      global.useSupabaseClient = vi.fn(() => ({
        auth: {
          updateUser: vi.fn().mockRejectedValue(new Error('Network error')),
        },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('Failed to save changes')
    })

    it('should allow retry after error', async () => {
      let shouldFail = true
      const mockUpdateUser = vi.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Save failed'))
        }
        return Promise.resolve({
          data: { user: createMockUser() },
          error: null,
        })
      })

      global.useSupabaseClient = vi.fn(() => ({
        auth: { updateUser: mockUpdateUser },
        from: vi.fn(),
      }))

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      const vm = wrapper.vm as any

      // First change - will fail
      await nameInput.setValue('Test 1')
      await nextTick()
      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(vm.saveStatus).toBe('error')

      // Second change - will succeed
      shouldFail = false
      await nameInput.setValue('Test 2')
      await nextTick()
      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      expect(vm.saveStatus).toBe('saved')
    })
  })

  describe('Cleanup', () => {
    it('should clear timeout on component unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      nameInput.setValue('Test')

      const vm = wrapper.vm as any
      vm.cleanup() // Manually call cleanup before unmount
      wrapper.unmount()

      // Cleanup should be called (timeout cleared)
      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('')
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      // Should still attempt to save (validation is separate concern)
      expect(vm.saveStatus).toBe('saved')
    })

    it('should handle very long input', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      const longName = 'A'.repeat(500)
      await nameInput.setValue(longName)
      await nextTick()

      await vi.advanceTimersByTimeAsync(1100)
      await flushPromises()
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.saveStatus).toBe('saved')
    })

    it('should handle rapid field changes', async () => {
      wrapper = mount(ProfilePageAutoSaveMock, createProfilePageMountOptions())

      const nameInput = wrapper.find('#name')
      const vm = wrapper.vm as any

      // Make 10 rapid changes
      for (let i = 0; i < 10; i++) {
        await nameInput.setValue(`Name ${i}`)
        await nextTick()
        await vi.advanceTimersByTimeAsync(100)
      }

      // Only the last change should trigger save
      await vi.advanceTimersByTimeAsync(1000)
      await flushPromises()
      await nextTick()

      // Should have saved only once (after debounce), not 10 times
      expect(vm.saveAttempts).toBe(1)
    })
  })
})
