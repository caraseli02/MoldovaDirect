# Error Handling Fixes - Code Examples

This document provides specific code fixes for all error handling issues found in the filter components.

---

## Fix 1: Implement Proper Error Logging

### Problem
Uses `console.warn` instead of project logging utilities.

### Before
```typescript
const updatePriceRange = (range: number[]) => {
  if (!Array.isArray(range) || range.length !== 2) {
    console.warn('[Filter/Content] updatePriceRange received invalid range:', range)
    return
  }
  // ...
}
```

### After
```typescript
import { logError } from '~/utils/logging'
import { FILTER_ERROR_IDS } from '~/constants/errorIds'

const updatePriceRange = (range: unknown) => {
  if (!Array.isArray(range)) {
    logError({
      errorId: FILTER_ERROR_IDS.INVALID_RANGE,
      message: 'Price range slider provided non-array value',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        received: typeof range,
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  if (range.length !== 2) {
    logError({
      errorId: FILTER_ERROR_IDS.INVALID_RANGE,
      message: 'Price range slider provided wrong array length',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        expected: 2,
        received: range.length,
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  const [min, max] = range
  // ... rest of logic
}
```

---

## Fix 2: Add Error IDs to Constants

### Create: `constants/errorIds.ts`

```typescript
export const FILTER_ERROR_IDS = {
  // Range validation errors
  INVALID_RANGE: 'FILTER_INVALID_RANGE',
  RANGE_NOT_ARRAY: 'FILTER_RANGE_NOT_ARRAY',
  RANGE_WRONG_LENGTH: 'FILTER_RANGE_WRONG_LENGTH',
  RANGE_NOT_NUMERIC: 'FILTER_RANGE_NOT_NUMERIC',
  RANGE_NAN_VALUES: 'FILTER_RANGE_NaN_VALUES',
  RANGE_INVERTED: 'FILTER_RANGE_INVERTED',
  RANGE_OUT_OF_BOUNDS: 'FILTER_RANGE_OUT_OF_BOUNDS',

  // Individual price input errors
  INVALID_MIN_PRICE: 'FILTER_INVALID_MIN_PRICE',
  INVALID_MAX_PRICE: 'FILTER_INVALID_MAX_PRICE',
  MIN_PRICE_OUT_OF_BOUNDS: 'FILTER_MIN_PRICE_OUT_OF_BOUNDS',
  MAX_PRICE_OUT_OF_BOUNDS: 'FILTER_MAX_PRICE_OUT_OF_BOUNDS',

  // Constraint errors
  MISSING_CONSTRAINTS: 'FILTER_MISSING_CONSTRAINTS',
  INVALID_CONSTRAINTS: 'FILTER_INVALID_CONSTRAINTS',
  CONSTRAINT_LOGIC_ERROR: 'FILTER_CONSTRAINT_LOGIC_ERROR',

  // Category/attribute errors
  INVALID_CATEGORY: 'FILTER_INVALID_CATEGORY',
  INVALID_ATTRIBUTE: 'FILTER_INVALID_ATTRIBUTE',

  // Slider component errors
  SLIDER_INVALID_EMIT: 'FILTER_SLIDER_INVALID_EMIT',
} as const

export type FilterErrorId = typeof FILTER_ERROR_IDS[keyof typeof FILTER_ERROR_IDS]
```

---

## Fix 3: Implement Proper Error Handlers with User Feedback

### In Component Script

```typescript
import { logError } from '~/utils/logging'
import { FILTER_ERROR_IDS } from '~/constants/errorIds'
import { useToast } from '~/composables/useToast'

// Get toast composable
const { showToast } = useToast()

interface FilterValidationError {
  errorId: string
  field: 'minPrice' | 'maxPrice' | 'priceRange' | 'category' | 'attribute'
  originalValue: unknown
  reason: string
}

interface Emits {
  (e: 'update:filters', filters: ProductFilters): void
  (e: 'validation-error', error: FilterValidationError): void
}

const emit = defineEmits<Emits>()

const updateMinPrice = (value: string | number) => {
  // Step 1: Validate input type
  if (value === null || value === undefined) {
    // Clear filter, this is valid
    updateFilters({ priceMin: undefined })
    return
  }

  // Step 2: Parse and validate numeric value
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value

  if (Number.isNaN(numValue)) {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.INVALID_MIN_PRICE,
      field: 'minPrice',
      originalValue: value,
      reason: 'Value is not a valid number'
    }

    // Log to system
    logError({
      errorId: error.errorId,
      message: `Invalid minimum price input: ${error.reason}`,
      context: {
        component: 'FilterContent',
        method: 'updateMinPrice',
        originalValue: value,
        valueType: typeof value,
        parsedValue: numValue,
        timestamp: new Date().toISOString()
      }
    })

    // Emit for parent tracking
    emit('validation-error', error)

    // Show user feedback
    showToast({
      type: 'error',
      title: 'Invalid Price',
      description: 'Please enter a valid number (e.g., 100 or 100.50)',
      duration: 4000
    })

    return
  }

  // Step 3: Validate against constraints
  const { min: availableMin } = props.availableFilters.priceRange

  if (typeof availableMin !== 'number') {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.MISSING_CONSTRAINTS,
      field: 'minPrice',
      originalValue: value,
      reason: 'Available minimum constraint is not defined'
    }

    logError({
      errorId: error.errorId,
      message: 'Cannot validate price: available minimum is missing',
      context: {
        component: 'FilterContent',
        method: 'updateMinPrice',
        availableMin,
        providedValue: numValue,
        severity: 'high'
      }
    })

    emit('validation-error', error)
    return
  }

  if (numValue < availableMin) {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.MIN_PRICE_OUT_OF_BOUNDS,
      field: 'minPrice',
      originalValue: value,
      reason: `Value ${numValue} is below minimum of ${availableMin}`
    }

    logError({
      errorId: error.errorId,
      message: 'Price below minimum constraint',
      context: {
        component: 'FilterContent',
        method: 'updateMinPrice',
        providedValue: numValue,
        availableMin,
        timestamp: new Date().toISOString()
      }
    })

    emit('validation-error', error)

    showToast({
      type: 'warning',
      title: 'Price Below Minimum',
      description: `Minimum price is €${availableMin}`,
      duration: 3000
    })

    return
  }

  // Step 4: Apply filter
  updateFilters({
    priceMin: numValue > availableMin ? numValue : undefined,
  })
}

const updateMaxPrice = (value: string | number) => {
  // Step 1: Validate input type
  if (value === null || value === undefined) {
    updateFilters({ priceMax: undefined })
    return
  }

  // Step 2: Parse and validate numeric value
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value

  if (Number.isNaN(numValue)) {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.INVALID_MAX_PRICE,
      field: 'maxPrice',
      originalValue: value,
      reason: 'Value is not a valid number'
    }

    logError({
      errorId: error.errorId,
      message: `Invalid maximum price input: ${error.reason}`,
      context: {
        component: 'FilterContent',
        method: 'updateMaxPrice',
        originalValue: value,
        valueType: typeof value,
        parsedValue: numValue,
        timestamp: new Date().toISOString()
      }
    })

    emit('validation-error', error)

    showToast({
      type: 'error',
      title: 'Invalid Price',
      description: 'Please enter a valid number (e.g., 500 or 500.50)',
      duration: 4000
    })

    return
  }

  // Step 3: Validate against constraints
  const { max: availableMax } = props.availableFilters.priceRange

  if (typeof availableMax !== 'number') {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.MISSING_CONSTRAINTS,
      field: 'maxPrice',
      originalValue: value,
      reason: 'Available maximum constraint is not defined'
    }

    logError({
      errorId: error.errorId,
      message: 'Cannot validate price: available maximum is missing',
      context: {
        component: 'FilterContent',
        method: 'updateMaxPrice',
        availableMax,
        providedValue: numValue,
        severity: 'high'
      }
    })

    emit('validation-error', error)
    return
  }

  if (numValue > availableMax) {
    const error: FilterValidationError = {
      errorId: FILTER_ERROR_IDS.MAX_PRICE_OUT_OF_BOUNDS,
      field: 'maxPrice',
      originalValue: value,
      reason: `Value ${numValue} exceeds maximum of ${availableMax}`
    }

    logError({
      errorId: error.errorId,
      message: 'Price above maximum constraint',
      context: {
        component: 'FilterContent',
        method: 'updateMaxPrice',
        providedValue: numValue,
        availableMax,
        timestamp: new Date().toISOString()
      }
    })

    emit('validation-error', error)

    showToast({
      type: 'warning',
      title: 'Price Above Maximum',
      description: `Maximum price is €${availableMax}`,
      duration: 3000
    })

    return
  }

  // Step 4: Apply filter
  updateFilters({
    priceMax: numValue < availableMax ? numValue : undefined,
  })
}

const updatePriceRange = (range: unknown) => {
  // Step 1: Type validation
  if (!Array.isArray(range)) {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_NOT_ARRAY,
      message: 'Price range slider emitted non-array value',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        received: typeof range,
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  // Step 2: Array length validation
  if (range.length !== 2) {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_WRONG_LENGTH,
      message: 'Price range slider provided wrong array length',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        expected: 2,
        received: range.length,
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  const [min, max] = range

  // Step 3: Element type validation
  if (typeof min !== 'number' || typeof max !== 'number') {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_NOT_NUMERIC,
      message: 'Price range slider provided non-numeric values',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        minType: typeof min,
        maxType: typeof max,
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  // Step 4: NaN validation
  if (Number.isNaN(min) || Number.isNaN(max)) {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_NAN_VALUES,
      message: 'Price range slider provided NaN values',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        minIsNaN: Number.isNaN(min),
        maxIsNaN: Number.isNaN(max),
        value: range,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  // Step 5: Constraint validation
  const { min: availableMin, max: availableMax } = props.availableFilters.priceRange

  if (typeof availableMin !== 'number' || typeof availableMax !== 'number') {
    logError({
      errorId: FILTER_ERROR_IDS.INVALID_CONSTRAINTS,
      message: 'Price constraints are not numeric',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        availableMin,
        availableMax,
        priceRange: props.availableFilters.priceRange,
        severity: 'high'
      }
    })
    return
  }

  // Step 6: Range logic validation
  if (min > max) {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_INVERTED,
      message: 'Price range has inverted values',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        min,
        max,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  if (availableMin >= availableMax) {
    logError({
      errorId: FILTER_ERROR_IDS.CONSTRAINT_LOGIC_ERROR,
      message: 'Price constraints are logically invalid',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        availableMin,
        availableMax,
        severity: 'high'
      }
    })
    return
  }

  // Step 7: Bounds validation
  if (min < availableMin || max > availableMax) {
    logError({
      errorId: FILTER_ERROR_IDS.RANGE_OUT_OF_BOUNDS,
      message: 'Price range exceeds available bounds',
      context: {
        component: 'FilterContent',
        method: 'updatePriceRange',
        min,
        max,
        availableMin,
        availableMax,
        timestamp: new Date().toISOString()
      }
    })
    return
  }

  // Step 8: Apply filter
  updateFilters({
    priceMin: min > availableMin ? min : undefined,
    priceMax: max < availableMax ? max : undefined,
  })
}
```

---

## Fix 4: Add Error Handler in Parent Component

### In: `pages/products/index.vue`

```typescript
const handleFilterValidationError = (error: FilterValidationError) => {
  // Log for analytics
  if (typeof window !== 'undefined' && window.__ANALYTICS__) {
    window.__ANALYTICS__.trackEvent('filter_validation_error', {
      errorId: error.errorId,
      field: error.field,
      timestamp: new Date().toISOString()
    })
  }

  // Show user feedback (toast already shown in component)
  // Parent can add additional handling if needed
}
```

### Update Template

```vue
<productFilterMain
  :filters="filters"
  :available-filters="availableFilters"
  @update:filters="handleFiltersUpdate"
  @validation-error="handleFilterValidationError"
/>
```

---

## Fix 5: Create Logging Utility (if not exists)

### Create: `utils/logging.ts`

```typescript
import type { FilterErrorId } from '~/constants/errorIds'

interface LogErrorParams {
  errorId: string
  message: string
  context?: Record<string, unknown>
}

/**
 * Log error for monitoring/debugging
 * Sends to Sentry in production
 */
export const logError = (params: LogErrorParams) => {
  const { errorId, message, context = {} } = params

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[${errorId}] ${message}`,
      context
    )
  }

  // Sentry integration (pseudo-code, adjust based on your Sentry setup)
  if (typeof window !== 'undefined' && window.__SENTRY__) {
    window.__SENTRY__.captureException(new Error(message), {
      level: 'error',
      tags: { errorId },
      contexts: { custom: context }
    })
  }

  // Analytics tracking
  if (typeof window !== 'undefined' && window.__ANALYTICS__) {
    window.__ANALYTICS__.trackEvent('error', {
      errorId,
      message,
      ...context
    })
  }
}

/**
 * Log debug information (user-facing)
 */
export const logForDebugging = (message: string, context?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, context)
  }
}

/**
 * Log event for analytics
 */
export const logEvent = (eventName: string, context?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.__ANALYTICS__) {
    window.__ANALYTICS__.trackEvent(eventName, context)
  }
}
```

---

## Summary of Changes

### What Gets Fixed

1. **Error Logging**
   - Uses project logging utilities instead of `console.warn`
   - Includes error IDs for Sentry tracking
   - Provides comprehensive context

2. **User Feedback**
   - Toast notifications on validation failures
   - Clear explanations of what went wrong
   - Guidance on how to fix (e.g., "enter a number only")

3. **Error Observability**
   - Error IDs for aggregation and tracking
   - Error events emitted to parent
   - Analytics integration ready

4. **Error Handling**
   - Specific validation for each error type
   - Proper logging at failure point
   - Recovery paths for common errors

### Files Modified

1. `components/product/Filter/Content.vue` - Error handling logic
2. `pages/products/index.vue` - Error handler integration
3. `constants/errorIds.ts` - Error ID definitions
4. `utils/logging.ts` - Logging utility (if needed)

### Testing Checklist

- [ ] Enter "€100" in price field → Shows "Invalid price format" toast
- [ ] Enter "abc" in price field → Shows "Please enter a valid number" toast
- [ ] Enter value below minimum → Shows "Below minimum" warning
- [ ] Enter value above maximum → Shows "Above maximum" warning
- [ ] Check browser console → Errors logged with error IDs
- [ ] Check Sentry → Errors appear with proper categorization
- [ ] Check analytics → Validation errors tracked

