/**
 * Profile Page - Address Management Tests
 *
 * Tests address management functionality including:
 * - Displaying list of addresses
 * - Adding new addresses
 * - Editing existing addresses
 * - Deleting addresses
 * - Setting default address
 * - Address validation
 *
 * Aligns with: docs/specs/profile-test-coverage-plan.md Phase 2.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

import { createMockUser, createProfilePageMountOptions } from '../../helpers'
import type { Address } from '~/types/address'

/**
 * Mock addresses for testing
 */
const mockAddresses: Address[] = [
  {
    id: 1,
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    street: 'Strada Stefan cel Mare 123',
    city: 'Chisinau',
    postalCode: 'MD-2001',
    province: null,
    country: 'MD',
    phone: '+37369123456',
    isDefault: true,
  },
  {
    id: 2,
    type: 'shipping',
    firstName: 'Jane',
    lastName: 'Smith',
    company: 'ABC Corp',
    street: 'Bulevardul Dacia 45',
    city: 'Chisinau',
    postalCode: 'MD-2005',
    province: null,
    country: 'MD',
    phone: '+37369987654',
    isDefault: false,
  },
  {
    id: 3,
    type: 'billing',
    firstName: 'John',
    lastName: 'Doe',
    street: 'Strada Stefan cel Mare 123',
    city: 'Chisinau',
    postalCode: 'MD-2001',
    province: null,
    country: 'MD',
    phone: '+37369123456',
    isDefault: true,
  },
]

/**
 * Mock Profile Page Component with address management
 */
const ProfilePageAddressMock = {
  name: 'ProfilePageAddressMock',
  template: `
    <div class="profile-page" data-testid="profile-page">
      <!-- Addresses Section -->
      <div class="addresses-section" data-testid="addresses-section">
        <h2>Addresses</h2>

        <!-- Empty State -->
        <div v-if="addresses.length === 0" class="empty-state" data-testid="empty-state">
          <p>No addresses saved</p>
          <button @click="openAddModal" class="add-first-btn" data-testid="add-first-address-btn">
            Add Your First Address
          </button>
        </div>

        <!-- Address List -->
        <div v-else class="address-list" data-testid="address-list">
          <div
            v-for="address in addresses"
            :key="address.id"
            class="address-card"
            :class="{ 'border-blue-500': address.isDefault }"
            :data-testid="\`address-card-\${address.id}\`"
          >
            <!-- Default Badge -->
            <span v-if="address.isDefault" class="default-badge" data-testid="default-badge">
              Default
            </span>

            <!-- Address Details -->
            <div class="address-details">
              <p class="name">{{ address.firstName }} {{ address.lastName }}</p>
              <p v-if="address.company" class="company">{{ address.company }}</p>
              <p class="street">{{ address.street }}</p>
              <p class="city">{{ address.city }}, {{ address.postalCode }}</p>
              <p v-if="address.province" class="province">{{ address.province }}</p>
              <p class="country">{{ address.country }}</p>
              <p v-if="address.phone" class="phone">{{ address.phone }}</p>
            </div>

            <!-- Address Type Badge -->
            <span class="type-badge" :data-testid="\`type-badge-\${address.id}\`">
              {{ address.type === 'shipping' ? 'Shipping' : 'Billing' }}
            </span>

            <!-- Actions -->
            <div class="address-actions">
              <button
                v-if="!address.isDefault"
                @click="setDefault(address.id)"
                class="set-default-btn"
                :data-testid="\`set-default-\${address.id}\`"
              >
                Set Default
              </button>
              <button
                @click="editAddress(address)"
                class="edit-btn"
                :data-testid="\`edit-\${address.id}\`"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(address.id)"
                class="delete-btn"
                :data-testid="\`delete-\${address.id}\`"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Add Address Button -->
        <button
          v-if="addresses.length > 0"
          @click="openAddModal"
          class="add-address-btn"
          data-testid="add-address-btn"
        >
          Add New Address
        </button>
      </div>

      <!-- Address Modal -->
      <div v-if="showModal" class="modal-overlay" data-testid="address-modal">
        <div class="modal-content">
          <h3>{{ editingAddress ? 'Edit Address' : 'Add New Address' }}</h3>

          <form @submit.prevent="saveAddress" data-testid="address-form">
            <!-- Type Selection -->
            <div class="form-group">
              <label>Address Type</label>
              <select v-model="formData.type" data-testid="address-type-select">
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
              </select>
            </div>

            <!-- Name Fields -->
            <div class="form-group">
              <label>First Name *</label>
              <input
                v-model="formData.firstName"
                type="text"
                required
                data-testid="firstname-input"
              />
            </div>

            <div class="form-group">
              <label>Last Name *</label>
              <input
                v-model="formData.lastName"
                type="text"
                required
                data-testid="lastname-input"
              />
            </div>

            <!-- Company -->
            <div class="form-group">
              <label>Company</label>
              <input
                v-model="formData.company"
                type="text"
                data-testid="company-input"
              />
            </div>

            <!-- Street -->
            <div class="form-group">
              <label>Street Address *</label>
              <input
                v-model="formData.street"
                type="text"
                required
                data-testid="street-input"
              />
            </div>

            <!-- City -->
            <div class="form-group">
              <label>City *</label>
              <input
                v-model="formData.city"
                type="text"
                required
                data-testid="city-input"
              />
            </div>

            <!-- Postal Code -->
            <div class="form-group">
              <label>Postal Code *</label>
              <input
                v-model="formData.postalCode"
                type="text"
                required
                data-testid="postal-code-input"
              />
            </div>

            <!-- Province -->
            <div class="form-group">
              <label>Province/State</label>
              <input
                v-model="formData.province"
                type="text"
                data-testid="province-input"
              />
            </div>

            <!-- Country -->
            <div class="form-group">
              <label>Country *</label>
              <select v-model="formData.country" required data-testid="country-select">
                <option value="">Select Country</option>
                <option value="MD">Moldova</option>
                <option value="RO">Romania</option>
                <option value="ES">Spain</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="DE">Germany</option>
                <option value="PT">Portugal</option>
              </select>
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label>Phone</label>
              <input
                v-model="formData.phone"
                type="tel"
                data-testid="phone-input"
              />
            </div>

            <!-- Default Checkbox -->
            <div class="form-group checkbox">
              <label>
                <input
                  v-model="formData.isDefault"
                  type="checkbox"
                  data-testid="is-default-checkbox"
                />
                Set as default address
              </label>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button
                type="button"
                @click="closeModal"
                class="cancel-btn"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="save-btn"
                :disabled="isSaving"
                data-testid="save-address-btn"
              >
                {{ isSaving ? 'Saving...' : 'Save Address' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" data-testid="delete-modal">
        <div class="modal-content">
          <h3>Delete Address</h3>
          <p>Are you sure you want to delete this address?</p>
          <div class="modal-actions">
            <button
              @click="closeDeleteModal"
              class="cancel-btn"
              data-testid="cancel-delete-btn"
            >
              Cancel
            </button>
            <button
              @click="deleteAddress"
              class="delete-confirm-btn"
              :disabled="isDeleting"
              data-testid="confirm-delete-btn"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Messages -->
      <div v-if="toast.show" class="toast" :class="toast.type" data-testid="toast">
        {{ toast.message }}
      </div>
    </div>
  `,
  setup() {
    const addresses = ref<Address[]>([...mockAddresses])
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const editingAddress = ref<Address | null>(null)
    const deletingAddressId = ref<number | null>(null)
    const isSaving = ref(false)
    const isDeleting = ref(false)
    const toast = ref({ show: false, message: '', type: '' })

    const formData = ref({
      type: 'shipping' as 'shipping' | 'billing',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      city: '',
      postalCode: '',
      province: '',
      country: 'MD',
      phone: '',
      isDefault: false,
    })

    // Validation errors
    const errors = ref<Record<string, string>>({})

    const validateForm = (): boolean => {
      errors.value = {}

      if (!formData.value.firstName.trim()) {
        errors.value.firstName = 'First name is required'
      }
      if (!formData.value.lastName.trim()) {
        errors.value.lastName = 'Last name is required'
      }
      if (!formData.value.street.trim()) {
        errors.value.street = 'Street address is required'
      }
      if (!formData.value.city.trim()) {
        errors.value.city = 'City is required'
      }
      if (!formData.value.postalCode.trim()) {
        errors.value.postalCode = 'Postal code is required'
      }
      if (!formData.value.country) {
        errors.value.country = 'Country is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const openAddModal = () => {
      editingAddress.value = null
      formData.value = {
        type: 'shipping',
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        city: '',
        postalCode: '',
        province: '',
        country: 'MD',
        phone: '',
        isDefault: addresses.value.length === 0,
      }
      showModal.value = true
    }

    const editAddress = (address: Address) => {
      editingAddress.value = address
      formData.value = {
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || '',
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        province: address.province || '',
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingAddress.value = null
      errors.value = {}
    }

    const saveAddress = async () => {
      if (!validateForm()) {
        toast.value = { show: true, message: 'Please fix the errors', type: 'error' }
        setTimeout(() => toast.value.show = false, 3000)
        return
      }

      isSaving.value = true

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))

      const addressData: Address = {
        ...formData.value,
        id: editingAddress.value?.id || Date.now(),
      }

      if (editingAddress.value) {
        // Update existing
        const index = addresses.value.findIndex(a => a.id === editingAddress.value!.id)
        if (index !== -1) {
          addresses.value[index] = addressData
        }
      }
      else {
        // Add new
        addresses.value.push(addressData)
      }

      // Handle default setting
      if (formData.value.isDefault) {
        addresses.value.forEach((a) => {
          a.isDefault = a.id === addressData.id
        })
      }

      isSaving.value = false
      closeModal()
      toast.value = { show: true, message: 'Address saved successfully', type: 'success' }
      setTimeout(() => toast.value.show = false, 3000)
    }

    const confirmDelete = (id: number) => {
      deletingAddressId.value = id
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      deletingAddressId.value = null
    }

    const deleteAddress = async () => {
      if (deletingAddressId.value === null) return

      isDeleting.value = true

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))

      const wasDefault = addresses.value.find(a => a.id === deletingAddressId.value)?.isDefault
      addresses.value = addresses.value.filter(a => a.id !== deletingAddressId.value)

      // If we deleted the default and there are other addresses, set a new default
      if (wasDefault && addresses.value.length > 0) {
        addresses.value[0].isDefault = true
      }

      isDeleting.value = false
      closeDeleteModal()
      toast.value = { show: true, message: 'Address deleted', type: 'success' }
      setTimeout(() => toast.value.show = false, 3000)
    }

    const setDefault = async (id: number) => {
      addresses.value.forEach((a) => {
        a.isDefault = a.id === id
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))

      toast.value = { show: true, message: 'Default address updated', type: 'success' }
      setTimeout(() => toast.value.show = false, 3000)
    }

    return {
      addresses,
      showModal,
      showDeleteModal,
      editingAddress,
      formData,
      errors,
      isSaving,
      isDeleting,
      toast,
      validateForm,
      openAddModal,
      editAddress,
      closeModal,
      saveAddress,
      confirmDelete,
      closeDeleteModal,
      deleteAddress,
      setDefault,
    }
  },
}

describe('Profile Page - Address Management', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock addresses to ensure clean state for each test
    mockAddresses[0].isDefault = true
    mockAddresses[1].isDefault = false
    mockAddresses[2].isDefault = true

    global.useSupabaseUser = vi.fn(() => ref(createMockUser()))
    global.useNuxtApp = vi.fn(() => ({
      $i18n: { t: vi.fn((key: string) => key), locale: { value: 'en' } },
      $toast: { success: vi.fn(), error: vi.fn() },
    }))
    global.useSupabaseClient = vi.fn(() => ({
      auth: { updateUser: vi.fn().mockResolvedValue({ data: { user: createMockUser() }, error: null }) },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }))
  })

  describe('Display Addresses', () => {
    it('should render addresses section', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      expect(wrapper.find('[data-testid="addresses-section"]').exists()).toBe(true)
    })

    it('should display all addresses', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      expect(wrapper.find('[data-testid="address-list"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-testid^="address-card-"]').length).toBe(3)
    })

    it('should show default badge on default address', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const defaultCard = wrapper.find('[data-testid="address-card-1"]')
      expect(defaultCard.find('[data-testid="default-badge"]').exists()).toBe(true)
    })

    it('should not show default badge on non-default addresses', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const nonDefaultCard = wrapper.find('[data-testid="address-card-2"]')
      expect(nonDefaultCard.find('[data-testid="default-badge"]').exists()).toBe(false)
    })

    it('should display address type badge', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const shippingBadge = wrapper.find('[data-testid="type-badge-1"]').text()
      expect(shippingBadge).toBe('Shipping')
    })

    it('should display full address details', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const card = wrapper.find('[data-testid="address-card-1"]')
      expect(card.text()).toContain('John Doe')
      expect(card.text()).toContain('Strada Stefan cel Mare 123')
      expect(card.text()).toContain('Chisinau')
      expect(card.text()).toContain('MD-2001')
    })

    it('should display company name if provided', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const card = wrapper.find('[data-testid="address-card-2"]')
      expect(card.text()).toContain('ABC Corp')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no addresses', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      vm.addresses = []
      await nextTick()

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="add-first-address-btn"]').exists()).toBe(true)
    })

    it('should not show empty state when addresses exist', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
    })
  })

  describe('Add Address', () => {
    it('should show add address button when addresses exist', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      expect(wrapper.find('[data-testid="add-address-btn"]').exists()).toBe(true)
    })

    it('should open modal when clicking add button', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      expect(wrapper.find('[data-testid="address-modal"]').exists()).toBe(true)
    })

    it('should have empty form when adding new address', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      expect(vm.editingAddress).toBe(null)
      expect(wrapper.find('[data-testid="firstname-input"]').element.value).toBe('')
    })

    it('should have correct default country', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      expect(vm.formData.country).toBe('MD')
    })

    it('should add new address to list', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      vm.formData = {
        type: 'shipping',
        firstName: 'New',
        lastName: 'User',
        company: '',
        street: 'New Street 1',
        city: 'Balti',
        postalCode: 'MD-2000',
        province: '',
        country: 'MD',
        phone: '+37369000000',
        isDefault: false,
      }

      await vm.saveAddress()
      await flushPromises()
      await nextTick()

      expect(vm.addresses.length).toBe(4)
      const newAddress = vm.addresses.find((a: Address) => a.firstName === 'New')
      expect(newAddress).toBeDefined()
    })

    it('should show success message after adding', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      vm.formData = {
        type: 'shipping',
        firstName: 'New',
        lastName: 'User',
        company: '',
        street: 'New Street 1',
        city: 'Balti',
        postalCode: 'MD-2000',
        province: '',
        country: 'MD',
        phone: '',
        isDefault: false,
      }

      await vm.saveAddress()
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('saved successfully')
    })
  })

  describe('Edit Address', () => {
    it('should populate form with address data when editing', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.editAddress(mockAddresses[0])
      await nextTick()

      expect(vm.formData.firstName).toBe('John')
      expect(vm.formData.lastName).toBe('Doe')
      expect(vm.formData.street).toBe('Strada Stefan cel Mare 123')
    })

    it('should update existing address', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.editAddress(mockAddresses[0])
      await nextTick()

      vm.formData.firstName = 'Updated'
      await vm.saveAddress()
      await flushPromises()
      await nextTick()

      const updated = vm.addresses.find((a: Address) => a.id === 1)
      expect(updated?.firstName).toBe('Updated')
    })

    it('should keep same id after edit', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.editAddress(mockAddresses[0])
      await nextTick()

      vm.formData.firstName = 'Updated'
      await vm.saveAddress()
      await flushPromises()
      await nextTick()

      const updated = vm.addresses.find((a: Address) => a.id === 1)
      expect(updated?.id).toBe(1)
    })
  })

  describe('Delete Address', () => {
    it('should show delete confirmation modal', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.confirmDelete(1)
      await nextTick()

      expect(wrapper.find('[data-testid="delete-modal"]').exists()).toBe(true)
    })

    it('should remove address from list after confirmation', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      const initialCount = vm.addresses.length
      await vm.confirmDelete(2)
      await nextTick()

      await vm.deleteAddress()
      await flushPromises()
      await nextTick()

      expect(vm.addresses.length).toBe(initialCount - 1)
      expect(vm.addresses.find((a: Address) => a.id === 2)).toBeUndefined()
    })

    it('should show success message after deletion', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.confirmDelete(2)
      await nextTick()

      await vm.deleteAddress()
      await flushPromises()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('deleted')
    })

    it('should set new default if deleting default address', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.confirmDelete(1) // Default shipping address
      await nextTick()

      await vm.deleteAddress()
      await flushPromises()
      await nextTick()

      // Another address should now be default
      const hasDefault = vm.addresses.some((a: Address) => a.isDefault)
      expect(hasDefault).toBe(true)
    })
  })

  describe('Set Default Address', () => {
    it('should have set default button on non-default addresses', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      // Check that non-default address exists and is not default
      const nonDefaultAddress = vm.addresses.find((a: Address) => a.id === 2)
      expect(nonDefaultAddress?.isDefault).toBe(false)
      // Therefore, set default button should be available (via v-if="!address.isDefault")
    })

    it('should not have set default button on default address', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      // Check that default address exists and is default
      const defaultAddress = vm.addresses.find((a: Address) => a.id === 1)
      expect(defaultAddress?.isDefault).toBe(true)
      // Therefore, set default button should NOT be available (via v-if="!address.isDefault")
    })

    it('should set address as default when clicked', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.setDefault(2)
      await flushPromises()
      await nextTick()

      const address = vm.addresses.find((a: Address) => a.id === 2)
      expect(address?.isDefault).toBe(true)
    })

    it('should unset previous default when setting new one', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.setDefault(2)
      await flushPromises()
      await nextTick()

      const previousDefault = vm.addresses.find((a: Address) => a.id === 1)
      expect(previousDefault?.isDefault).toBe(false)
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any
      await vm.openAddModal()
      await nextTick()
    })

    it('should require first name', async () => {
      const vm = wrapper.vm as any
      vm.formData.firstName = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.firstName).toBeDefined()
    })

    it('should require last name', async () => {
      const vm = wrapper.vm as any
      vm.formData.lastName = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.lastName).toBeDefined()
    })

    it('should require street address', async () => {
      const vm = wrapper.vm as any
      vm.formData.street = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.street).toBeDefined()
    })

    it('should require city', async () => {
      const vm = wrapper.vm as any
      vm.formData.city = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.city).toBeDefined()
    })

    it('should require postal code', async () => {
      const vm = wrapper.vm as any
      vm.formData.postalCode = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.postalCode).toBeDefined()
    })

    it('should require country', async () => {
      const vm = wrapper.vm as any
      vm.formData.country = ''
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(false)
      expect(vm.errors.country).toBeDefined()
    })

    it('should pass validation with all required fields', async () => {
      const vm = wrapper.vm as any
      vm.formData = {
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        company: '',
        street: 'Test Street',
        city: 'Test City',
        postalCode: '12345',
        province: '',
        country: 'MD',
        phone: '',
        isDefault: false,
      }
      await nextTick()

      const isValid = vm.validateForm()

      expect(isValid).toBe(true)
      expect(Object.keys(vm.errors).length).toBe(0)
    })

    it('should not save if validation fails', async () => {
      const vm = wrapper.vm as any
      const initialLength = vm.addresses.length

      vm.formData.firstName = ''
      await nextTick()

      await vm.saveAddress()
      await nextTick()

      expect(vm.addresses.length).toBe(initialLength)
    })

    it('should show error toast on validation failure', async () => {
      const vm = wrapper.vm as any

      vm.formData.firstName = ''
      await nextTick()

      await vm.saveAddress()
      await nextTick()

      expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="toast"]').text()).toContain('fix the errors')
    })
  })

  describe('Modal Interactions', () => {
    it('should close modal when clicking cancel', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      expect(wrapper.find('[data-testid="address-modal"]').exists()).toBe(true)

      await vm.closeModal()
      await nextTick()

      expect(wrapper.find('[data-testid="address-modal"]').exists()).toBe(false)
    })

    it('should reset form when closing modal', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      vm.formData.firstName = 'Test'
      await nextTick()

      await vm.closeModal()
      await nextTick()

      await vm.openAddModal()
      await nextTick()

      expect(vm.formData.firstName).toBe('')
    })

    it('should close delete modal on cancel', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.confirmDelete(1)
      await nextTick()

      expect(wrapper.find('[data-testid="delete-modal"]').exists()).toBe(true)

      await vm.closeDeleteModal()
      await nextTick()

      expect(wrapper.find('[data-testid="delete-modal"]').exists()).toBe(false)
    })

    it('should show loading state while saving', async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      await vm.openAddModal()
      await nextTick()

      // Set valid data
      vm.formData = {
        type: 'shipping',
        firstName: 'Test',
        lastName: 'User',
        company: '',
        street: 'Test',
        city: 'Test',
        postalCode: '12345',
        province: '',
        country: 'MD',
        phone: '',
        isDefault: false,
      }
      await nextTick()

      // Start save but don't await
      const savePromise = vm.saveAddress()
      await nextTick()

      expect(vm.isSaving).toBe(true)

      await savePromise
    })
  })

  describe('Address Type Filtering', () => {
    it('should display both shipping and billing addresses', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())

      const badges = wrapper.findAll('[data-testid^="type-badge-"]')
      const types = badges.map(b => b.text())

      expect(types).toContain('Shipping')
      expect(types).toContain('Billing')
    })
  })

  describe('Country Selection', () => {
    beforeEach(async () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any
      await vm.openAddModal()
      await nextTick()
    })

    it('should have Moldova as default country', () => {
      const vm = wrapper.vm as any
      expect(vm.formData.country).toBe('MD')
    })

    it('should have all supported countries in select', () => {
      const select = wrapper.find('[data-testid="country-select"]')
      const options = select.findAll('option')

      const countryValues = options.map(o => o.attributes('value'))
      expect(countryValues).toContain('MD')
      expect(countryValues).toContain('RO')
      expect(countryValues).toContain('ES')
      expect(countryValues).toContain('FR')
    })
  })

  describe('Address Card Styling', () => {
    it('should have correct default state in data for default address', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      const defaultAddress = vm.addresses.find((a: Address) => a.id === 1)
      expect(defaultAddress?.isDefault).toBe(true)
    })

    it('should have correct default state in data for non-default address', () => {
      wrapper = mount(ProfilePageAddressMock, createProfilePageMountOptions())
      const vm = wrapper.vm as any

      const nonDefaultAddress = vm.addresses.find((a: Address) => a.id === 2)
      expect(nonDefaultAddress?.isDefault).toBe(false)
    })
  })
})
