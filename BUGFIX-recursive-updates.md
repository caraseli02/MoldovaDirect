# Bug Fix: Maximum Recursive Updates in Checkout Components

## Issue
The checkout flow was throwing a "Maximum recursive updates exceeded" error when users interacted with forms in the shipping and payment steps.

## Root Cause
Two components had circular reactive dependencies caused by dual watchers creating infinite loops:

### 1. AddressForm.vue
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

### 2. PaymentForm.vue
```typescript
// Watcher 1: Props → Local state
watch(() => props.modelValue, (newMethod) => {
  creditCardData.value = { ...newMethod.creditCard }
  paypalData.value = { ...newMethod.paypal }
}, { immediate: true, deep: true })

// Watcher 2: Local state → Emit update
watch([creditCardData, paypalData], () => {
  updatePaymentMethod() // This emits update:modelValue
}, { deep: true })
```

**The Infinite Loop:**
1. Parent updates `modelValue` prop
2. Watcher 1 fires → updates local state
3. Watcher 2 fires → emits `update:modelValue`
4. Parent receives update → updates `modelValue` prop
5. Back to step 1 → infinite recursion 💥

## Solutions Applied

### Fix 1: AddressForm.vue - Computed Property Pattern
Replaced dual watchers with a computed property using getter/setter:

```typescript
const localAddress = computed({
  get: () => props.modelValue,
  set: (value: Address) => {
    emit('update:modelValue', value)
  }
})
```

**Additional Changes:**
- Updated all v-model bindings to use `:value` and `@input` with `updateField` helper
- Added `updateField` helper to properly emit updates
- Changed `@input` to `@focus` for clearing errors (better UX)
- Added i18n support to validation error messages

### Fix 2: PaymentForm.vue - Conditional Update Pattern
Removed the second watcher and added change detection to prevent unnecessary updates:

```typescript
// Only watch props, update local state conditionally
watch(() => props.modelValue, (newMethod) => {
  // Only update if values actually changed
  if (newMethod.type === 'credit_card' && newMethod.creditCard) {
    const currentNumber = creditCardData.value.number.replace(/\s/g, '')
    const newNumber = newMethod.creditCard.number.replace(/\s/g, '')
    
    if (currentNumber !== newNumber || /* other fields changed */) {
      creditCardData.value = { ...newMethod.creditCard }
    }
  }
}, { immediate: true })

// Removed the deep watcher on local state
// Updates now happen explicitly via user input handlers
```

**Key Changes:**
- Removed deep watcher on `creditCardData` and `paypalData`
- Added change detection to prevent unnecessary updates
- Moved initialization to `onMounted` hook
- Updates only happen through explicit user input handlers

## Files Modified
1. `components/checkout/AddressForm.vue` - Computed property pattern
2. `components/checkout/PaymentForm.vue` - Conditional update pattern

## Testing Checklist
The fixes eliminate circular dependencies while maintaining all functionality:

### AddressForm.vue
- ✅ Form fields update correctly
- ✅ Parent component receives updates
- ✅ Validation works as expected
- ✅ Saved addresses can be selected
- ✅ No recursive update errors

### PaymentForm.vue
- ✅ Cash payment selection works
- ✅ Credit card form updates correctly
- ✅ PayPal form updates correctly
- ✅ Bank transfer displays properly
- ✅ Card validation works
- ✅ No recursive update errors

## Best Practices Applied

### 1. Avoid Dual Watchers on v-model Props
❌ **Bad:**
```typescript
watch(() => props.modelValue, (v) => { local.value = v })
watch(local, (v) => { emit('update:modelValue', v) })
```

✅ **Good:**
```typescript
const local = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
```

### 2. Use Change Detection for Complex Objects
❌ **Bad:**
```typescript
watch(complexObject, () => emit('update'), { deep: true })
```

✅ **Good:**
```typescript
watch(() => props.modelValue, (newVal) => {
  if (hasActuallyChanged(newVal)) {
    updateLocalState(newVal)
  }
})
```

### 3. Explicit Event Handlers Over Watchers
❌ **Bad:**
```typescript
watch(formData, () => emit('update:modelValue', formData.value), { deep: true })
```

✅ **Good:**
```typescript
const updateField = (field, value) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
```

### 4. Single Source of Truth
- Props are the source of truth
- Don't duplicate state unnecessarily
- Emit complete updated objects, not partial updates

## Prevention Tips

1. **Search for dual watchers** before they cause issues:
   ```bash
   grep -r "watch.*modelValue" components/
   grep -r "watch.*deep.*true" components/
   ```

2. **Use Vue DevTools** to inspect reactive dependencies

3. **Test form interactions** thoroughly during development

4. **Consider using `v-model` modifiers** for simple cases:
   ```vue
   <input v-model.lazy="value" />
   ```

## Related Issues
- Vue 3 Reactivity: https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- v-model Best Practices: https://vuejs.org/guide/components/v-model.html
