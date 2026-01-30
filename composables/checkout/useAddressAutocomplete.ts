/**
 * Address Autocomplete Composable
 *
 * Handles address autocomplete using OpenStreetMap Nominatim API.
 * Extracted from AddressForm.vue for better testability and reusability.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import { ref, type Ref } from 'vue'

// Address suggestion from autocomplete
export interface AddressSuggestion {
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
}

// Nominatim API response type
interface NominatimResult {
  display_name: string
  address: {
    house_number?: string
    road?: string
    street?: string
    pedestrian?: string
    footway?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    region?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}

export interface UseAddressAutocompleteOptions {
  countryCode?: Ref<string | undefined>
  onError?: (error: Error) => void
}

export function useAddressAutocomplete(options: UseAddressAutocompleteOptions = {}) {
  const { countryCode } = options

  // State
  const addressSuggestions = ref<AddressSuggestion[]>([])
  const showSuggestions = ref(false)
  const isLoadingAutocomplete = ref(false)
  const debounceTimer = ref<NodeJS.Timeout | null>(null)
  const hasShownAutocompleteError = ref(false)

  /**
   * Address autocomplete search using OpenStreetMap Nominatim API
   *
   * Uses the free Nominatim geocoding service which doesn't require API keys.
   * Rate-limited to 1 request per second by Nominatim's usage policy.
   *
   * @param query - The address search query
   */
  const searchAddresses = async (query: string): Promise<void> => {
    // Clear previous suggestions if query is too short
    if (query.length < 3) {
      addressSuggestions.value = []
      showSuggestions.value = false
      return
    }

    isLoadingAutocomplete.value = true

    try {
      // Build country code filter if country is selected
      const countryCodeValue = countryCode?.value?.toLowerCase() || ''

      // Use Nominatim API for geocoding (free, no API key needed)
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        ...(countryCodeValue && { countrycodes: countryCodeValue }),
      })

      const response = await $fetch<NominatimResult[]>(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'Accept-Language': 'en',
            // Nominatim requires a valid User-Agent for API usage policy
            'User-Agent': 'MoldovaDirectCheckout/1.0',
          },
        },
      )

      // Transform Nominatim results to our format
      const suggestions: AddressSuggestion[] = (response || [])
        .filter(result => result?.address)
        .map((result) => {
          const addr = result.address
          // Build street address from available components
          const streetParts = [
            addr.house_number,
            addr.road || addr.street || addr.pedestrian || addr.footway,
          ].filter(Boolean)

          const street = streetParts.join(' ') || result.display_name.split(',')[0]

          return {
            street: street || '',
            city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
            postalCode: addr.postcode || '',
            province: addr.state || addr.region || '',
            country: addr.country_code?.toUpperCase() || '',
          }
        })
        .filter(s => s.street && s.city) // Filter out incomplete addresses

      addressSuggestions.value = suggestions
      showSuggestions.value = suggestions.length > 0
      hasShownAutocompleteError.value = false
    }
    catch (error) {
      if (!hasShownAutocompleteError.value && options.onError) {
        options.onError(error as Error)
        hasShownAutocompleteError.value = true
      }
      // Log error for debugging - autocomplete failure is non-blocking
      console.error('Address autocomplete error:', error)
      addressSuggestions.value = []
      showSuggestions.value = false
    }
    finally {
      isLoadingAutocomplete.value = false
    }
  }

  /**
   * Trigger search after debounce delay
   */
  const triggerSearch = (query: string): void => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }

    if (query.length >= 3) {
      debounceTimer.value = setTimeout(() => {
        searchAddresses(query)
      }, 300)
    }
    else {
      addressSuggestions.value = []
      showSuggestions.value = false
    }
  }

  /**
   * Hide suggestions dropdown
   */
  const hideSuggestions = (): void => {
    showSuggestions.value = false
  }

  /**
   * Clear all suggestions
   */
  const clearSuggestions = (): void => {
    addressSuggestions.value = []
    showSuggestions.value = false
  }

  /**
   * Select a suggestion and return its data
   */
  const selectSuggestion = (suggestion: AddressSuggestion): AddressSuggestion => {
    clearSuggestions()
    return suggestion
  }

  // Cleanup on unmount
  const cleanup = (): void => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
  }

  return {
    // State
    addressSuggestions,
    showSuggestions,
    isLoadingAutocomplete,
    // Methods
    searchAddresses,
    triggerSearch,
    hideSuggestions,
    clearSuggestions,
    selectSuggestion,
    cleanup,
  }
}
