/**
 * Address Management Composable
 *
 * Manages user addresses for authenticated users including:
 * - Loading saved addresses from database
 * - Creating new addresses
 * - Updating existing addresses
 * - Setting default address
 * - Deleting addresses
 *
 * Features:
 * - Automatic loading on mount for authenticated users
 * - Optimistic UI updates
 * - Error handling with user-friendly messages
 * - Type-safe with TypeScript
 */

import { ref, computed } from 'vue'
import type { Address } from '~/types/checkout'

export const useUserAddresses = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { t } = useI18n()

  // State
  const addresses = ref<Address[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const defaultAddress = computed(() =>
    addresses.value.find(addr => addr.is_default) || null
  )

  const hasAddresses = computed(() => addresses.value.length > 0)

  /**
   * Load all addresses for the current user
   */
  const loadAddresses = async () => {
    if (!user.value) {
      addresses.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.value.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      addresses.value = data || []
    } catch (err) {
      console.error('Failed to load addresses:', err)
      error.value = t('checkout.errors.failedToLoadAddresses')
      addresses.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Save a new address for the current user
   */
  const saveAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to save address')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('user_addresses')
        .insert({
          ...address,
          user_id: user.value.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Optimistically update local state
      addresses.value.push(data)

      return data
    } catch (err) {
      console.error('Failed to save address:', err)
      error.value = t('checkout.errors.failedToSaveAddress')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing address
   */
  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to update address')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Optimistically update local state
      const index = addresses.value.findIndex(addr => addr.id === addressId)
      if (index !== -1) {
        addresses.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Failed to update address:', err)
      error.value = t('checkout.errors.failedToUpdateAddress')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Set an address as the default
   * This will automatically unset other default addresses via database trigger
   */
  const setDefaultAddress = async (addressId: string) => {
    if (!user.value) {
      throw new Error('User must be authenticated to set default address')
    }

    try {
      loading.value = true
      error.value = null

      // Update the address to set is_default = true
      // The database trigger will automatically clear other defaults
      await updateAddress(addressId, { is_default: true })

      // Reload to get updated state from database
      await loadAddresses()
    } catch (err) {
      console.error('Failed to set default address:', err)
      error.value = t('checkout.errors.failedToSetDefaultAddress')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an address
   */
  const deleteAddress = async (addressId: string) => {
    if (!user.value) {
      throw new Error('User must be authenticated to delete address')
    }

    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      // Optimistically update local state
      addresses.value = addresses.value.filter(addr => addr.id !== addressId)
    } catch (err) {
      console.error('Failed to delete address:', err)
      error.value = t('checkout.errors.failedToDeleteAddress')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get address by ID
   */
  const getAddressById = (addressId: string) => {
    return addresses.value.find(addr => addr.id === addressId) || null
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    addresses,
    loading,
    error,

    // Computed
    defaultAddress,
    hasAddresses,

    // Methods
    loadAddresses,
    saveAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    getAddressById,
    clearError
  }
}
