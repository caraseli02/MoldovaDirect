/**
 * Tests for ImageUpload Component - Product Images Integration
 *
 * TDD: These tests are written FIRST, before fixing the component.
 * Tests cover:
 * - File selection and preview
 * - Upload to /api/upload endpoint
 * - Display existing images (on edit)
 * - Remove images
 * - Drag and drop
 * - Loading states
 * - Error handling
 *
 * Related: docs/product-image-user-journey.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestImageFile, createOversizedTestFile, createInvalidFileTypeTestFile } from '~/tests/mocks/supabaseStorage'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock $fetch (Nuxt's fetch wrapper)
const mock$Fetch = vi.fn()
vi.stubGlobal('$fetch', mock$Fetch)

describe('ImageUpload Component - Product Images', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default successful upload response
    mock$Fetch.mockResolvedValue({
      url: 'https://storage.example.com/product-images/products/test.jpg',
      path: 'products/test.jpg',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should render upload area with drag-drop zone', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      expect(wrapper.find('[data-testid="upload-dropzone"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('drag')
    })

    it('should show existing images when modelValue has URLs', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const existingImages = [
        'https://storage.example.com/product-images/products/existing1.jpg',
        'https://storage.example.com/product-images/products/existing2.jpg',
      ]

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: existingImages,
        },
      })

      const images = wrapper.findAll('[data-testid="uploaded-image"]')
      expect(images).toHaveLength(2)
    })

    it('should show image count indicator', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          maxImages: 5,
        },
      })

      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('5')
    })
  })

  describe('File Selection', () => {
    it('should accept file via input change', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          'modelValue': [],
          'onUpdate:modelValue': (e: string[]) => wrapper.setProps({ modelValue: e }),
        },
      })

      const file = createTestImageFile('new-product.jpg')
      const input = wrapper.find('input[type="file"]')

      // Simulate file selection
      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await flushPromises()

      // Should call upload API
      expect(mock$Fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST',
      }))
    })

    it('should show preview while uploading', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      // Delay the response to test loading state
      mock$Fetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ url: 'https://example.com/test.jpg', path: 'test.jpg' }), 100),
      ))

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('new-product.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await nextTick()

      // Should show loading indicator on the preview
      expect(wrapper.find('[data-testid="upload-progress"]').exists()).toBe(true)
    })

    it('should emit update:modelValue with new URL after successful upload', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const updateHandler = vi.fn()
      const wrapper = mount(ImageUpload, {
        props: {
          'modelValue': [],
          'onUpdate:modelValue': updateHandler,
        },
      })

      const file = createTestImageFile('new-product.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await flushPromises()

      expect(updateHandler).toHaveBeenCalledWith([
        'https://storage.example.com/product-images/products/test.jpg',
      ])
    })
  })

  describe('File Validation', () => {
    it('should reject non-image files with error message', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const invalidFile = createInvalidFileTypeTestFile()
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [invalidFile] })
      await input.trigger('change')
      await flushPromises()

      // Should show error, not call API
      expect(mock$Fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('image')
    })

    it('should reject files larger than 5MB', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const oversizedFile = createOversizedTestFile()
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [oversizedFile] })
      await input.trigger('change')
      await flushPromises()

      expect(mock$Fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('5MB')
    })

    it('should prevent exceeding max images limit', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const existingImages = [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
      ]

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: existingImages,
          maxImages: 5,
        },
      })

      const file = createTestImageFile('one-more.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await flushPromises()

      expect(mock$Fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('maximum')
    })
  })

  describe('Drag and Drop', () => {
    it('should show drag overlay when dragging file over', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const dropzone = wrapper.find('[data-testid="upload-dropzone"]')
      await dropzone.trigger('dragover')

      expect(wrapper.find('[data-testid="drag-overlay"]').exists()).toBe(true)
    })

    it('should upload file on drop', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('dropped.jpg')
      const dropzone = wrapper.find('[data-testid="upload-dropzone"]')

      await dropzone.trigger('drop', {
        dataTransfer: { files: [file] },
      })
      await flushPromises()

      expect(mock$Fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object))
    })
  })

  describe('Image Removal', () => {
    it('should show remove button on each image', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
        },
      })

      const removeButtons = wrapper.findAll('[data-testid="remove-image"]')
      expect(removeButtons).toHaveLength(2)
    })

    it('should emit update:modelValue without removed URL', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const updateHandler = vi.fn()
      const wrapper = mount(ImageUpload, {
        props: {
          'modelValue': ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          'onUpdate:modelValue': updateHandler,
        },
      })

      const removeButtons = wrapper.findAll('[data-testid="remove-image"]')
      await removeButtons[0].trigger('click')

      expect(updateHandler).toHaveBeenCalledWith(['https://example.com/2.jpg'])
    })

    it('should call delete API when removing uploaded image', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch.mockResolvedValue({ success: true })

      const wrapper = mount(ImageUpload, {
        props: {
          'modelValue': ['https://storage.example.com/product-images/products/to-delete.jpg'],
          'onUpdate:modelValue': vi.fn(),
        },
      })

      const removeButton = wrapper.find('[data-testid="remove-image"]')
      await removeButton.trigger('click')
      await flushPromises()

      expect(mock$Fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'DELETE',
        body: expect.objectContaining({
          path: expect.stringContaining('to-delete.jpg'),
        }),
      }))
    })
  })

  describe('Error Handling', () => {
    it('should show error message when upload fails', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch.mockRejectedValue(new Error('Network error'))

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('will-fail.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await flushPromises()

      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)
    })

    it('should allow retry after failed upload', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ url: 'https://example.com/retry.jpg', path: 'retry.jpg' })

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('retry.jpg')
      const input = wrapper.find('input[type="file"]')

      // First attempt fails
      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await flushPromises()

      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)

      // Retry button should be visible
      const retryButton = wrapper.find('[data-testid="retry-upload"]')
      expect(retryButton.exists()).toBe(true)

      // Click retry
      await retryButton.trigger('click')
      await flushPromises()

      // Should succeed now
      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(false)
    })
  })

  describe('Loading States', () => {
    it('should disable input during upload', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ url: 'https://example.com/test.jpg', path: 'test.jpg' }), 100),
      ))

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('uploading.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await nextTick()

      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should show spinner during upload', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ url: 'https://example.com/test.jpg', path: 'test.jpg' }), 100),
      ))

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const file = createTestImageFile('uploading.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      await nextTick()

      expect(wrapper.find('[data-testid="upload-spinner"]').exists()).toBe(true)
    })
  })

  describe('Multiple Files', () => {
    it('should support multiple file selection', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      mock$Fetch
        .mockResolvedValueOnce({ url: 'https://example.com/1.jpg', path: '1.jpg' })
        .mockResolvedValueOnce({ url: 'https://example.com/2.jpg', path: '2.jpg' })

      const updateHandler = vi.fn()
      const wrapper = mount(ImageUpload, {
        props: {
          'modelValue': [],
          'onUpdate:modelValue': updateHandler,
        },
      })

      const files = [
        createTestImageFile('photo1.jpg'),
        createTestImageFile('photo2.jpg'),
      ]
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', { value: files })
      await input.trigger('change')
      await flushPromises()

      // Should have called upload twice
      expect(mock$Fetch).toHaveBeenCalledTimes(2)

      // Should have both URLs
      expect(updateHandler).toHaveBeenLastCalledWith([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
      ])
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label on dropzone', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const dropzone = wrapper.find('[data-testid="upload-dropzone"]')
      expect(dropzone.attributes('aria-label')).toContain('upload')
    })

    it('should have role="button" on dropzone', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const dropzone = wrapper.find('[data-testid="upload-dropzone"]')
      expect(dropzone.attributes('role')).toBe('button')
    })

    it('should support keyboard navigation', async () => {
      const { default: ImageUpload } = await import('~/components/admin/Utils/ImageUpload.vue')

      const wrapper = mount(ImageUpload, {
        props: {
          modelValue: [],
        },
      })

      const dropzone = wrapper.find('[data-testid="upload-dropzone"]')
      expect(dropzone.attributes('tabindex')).toBe('0')
    })
  })
})
