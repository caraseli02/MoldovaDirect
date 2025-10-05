# Bug Fix: Maximum Recursive Updates in ShippingStep

## Issue
The checkout flow was throwing a "Maximum recursive updates exceeded" error when users interacted with the shipping form.

## Root Cause
The `AddressForm.vue` component had a circular reactive dependency caused by two watchers:

```typescript
// Watcher 1: Props → Local state
watch(() => props.modelValue, (newValue) => {
  localAddress.value = { ...newValue }
}, { deep: true })

// Watcher 2: Local state → Emit update
watch(localAddress, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
```

This created an infinite loop:
1. Parent updates `modelValue` prop
2. Watcher 1 fires → updates `localAddress`
3. Watcher 2 fires → emits `update:modelValue`
4. Parent receives update → updates `modelValue` prop
5. Back to step 1 → infinite recursion

## Solution
Replaced the dual-watcher anti-pattern with a computed property using getter/setter:

```typescript
const localAddress = computed({
  get: () => props.modelValue,
  set: (value: Address) => {
    emit('update:modelValue', value)
  }
})
```

### Additional Changes
1. **Updated all v-model bindings** to use `:value` and `@input` with the `updateField` helper
2. **Added `updateField` helper** to properly emit updates without triggering recursion
3. **Changed `@input` to `@focus`** for clearing errors (better UX - errors clear when user starts typing)
4. **Added i18n support** to validation error messages

## Files Modified
- `components/checkout/AddressForm.vue`

## Testing
The fix eliminates the circular dependency while maintaining all functionality:
- ✅ Form fields update correctly
- ✅ Parent component receives updates
- ✅ Validation works as expected
- ✅ Saved addresses can be selected
- ✅ No recursive update errors

## Best Practices Applied
1. **Computed properties with getter/setter** for v-model patterns
2. **Explicit event handlers** instead of deep watchers on complex objects
3. **Single source of truth** - props are the source, not duplicated in local state
4. **Proper event emission** - emit complete updated objects, not partial updates
