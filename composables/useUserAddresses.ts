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
import type { SupabaseClient } from '@supabase/supabase-js'
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
    addresses.value.find(addr => addr.isDefault) || null,
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
    }
    catch (err: any) {
      console.error('Failed to load addresses:', err)
      error.value = t('checkout.errors.failedToLoadAddresses')
      addresses.value = []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Save a new address for the current user
   */
  const saveAddress = async (address: Omit<Address, 'id'>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to save address')
    }

    try {
      loading.value = true
      error.value = null

      // Convert camelCase to snake_case for database
      const dbAddress = {
        user_id: user.value.id,
        type: address.type,
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company || null,
        street: address.street,
        city: address.city,
        postal_code: address.postalCode,
        province: address.province || null,
        country: address.country,
        phone: address.phone || null,
        is_default: address.isDefault,
      }

      const { data, error: insertError } = await supabase
        .from('user_addresses')
        .insert(dbAddress as any)
        .select()
        .single<Record<string, any>>()

      if (insertError) throw insertError
      if (!data) throw new Error('No data returned from insert')

      // Convert snake_case response back to camelCase
      const dbData = data
      const newAddress: Address = {
        id: dbData.id,
        type: dbData.type,
        firstName: dbData.first_name,
        lastName: dbData.last_name,
        company: dbData.company || undefined,
        street: dbData.street,
        city: dbData.city,
        postalCode: dbData.postal_code,
        province: dbData.province || undefined,
        country: dbData.country,
        phone: dbData.phone || undefined,
        isDefault: dbData.is_default,
      }

      // Optimistically update local state
      addresses.value.push(newAddress)

      return newAddress
    }
    catch (err: any) {
      console.error('Failed to save address:', err)
      error.value = t('checkout.errors.failedToSaveAddress')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Update an existing address
   */
  const updateAddress = async (addressId: number, updates: Partial<Address>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to update address')
    }

    try {
      loading.value = true
      error.value = null

      // Convert camelCase updates to snake_case for database
      const dbUpdates: any = {}
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
      if (updates.company !== undefined) dbUpdates.company = updates.company || null
      if (updates.street !== undefined) dbUpdates.street = updates.street
      if (updates.city !== undefined) dbUpdates.city = updates.city
      if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode
      if (updates.province !== undefined) dbUpdates.province = updates.province || null
      if (updates.country !== undefined) dbUpdates.country = updates.country
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null
      if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault
      if (updates.type !== undefined) dbUpdates.type = updates.type

      const { data, error: updateError } = await supabase
        .from('user_addresses')
        // @ts-expect-error - Supabase type inference issue with dynamic updates
        .update(dbUpdates)
        .eq('id', addressId)
        .eq('user_id', user.value.id)
        .select()
        .single<Record<string, any>>()

      if (updateError) throw updateError
      if (!data) throw new Error('No data returned from update')

      // Convert snake_case response back to camelCase
      const dbData = data
      const updatedAddress: Address = {
        id: dbData.id,
        type: dbData.type,
        firstName: dbData.first_name,
        lastName: dbData.last_name,
        company: dbData.company || undefined,
        street: dbData.street,
        city: dbData.city,
        postalCode: dbData.postal_code,
        province: dbData.province || undefined,
        country: dbData.country,
        phone: dbData.phone || undefined,
        isDefault: dbData.is_default,
      }

      // Optimistically update local state
      const index = addresses.value.findIndex(addr => addr.id === addressId)
      if (index !== -1) {
        addresses.value[index] = updatedAddress
      }

      return updatedAddress
    }
    catch (err: any) {
      console.error('Failed to update address:', err)
      error.value = t('checkout.errors.failedToUpdateAddress')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Set an address as the default
   * This will automatically unset other default addresses via database trigger
   */
  const setDefaultAddress = async (addressId: number) => {
    if (!user.value) {
      throw new Error('User must be authenticated to set default address')
    }

    try {
      loading.value = true
      error.value = null

      // Update the address to set isDefault = true
      // The database trigger will automatically clear other defaults
      await updateAddress(addressId, { isDefault: true })

      // Reload to get updated state from database
      await loadAddresses()
    }
    catch (err: any) {
      console.error('Failed to set default address:', err)
      error.value = t('checkout.errors.failedToSetDefaultAddress')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Delete an address
   */
  const deleteAddress = async (addressId: number) => {
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
    }
    catch (err: any) {
      console.error('Failed to delete address:', err)
      error.value = t('checkout.errors.failedToDeleteAddress')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Get address by ID
   */
  const getAddressById = (addressId: number) => {
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
    clearError,
  }
}
