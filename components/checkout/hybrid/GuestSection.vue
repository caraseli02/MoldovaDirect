<template>
  <div class="guest-section">
    <!-- Guest/Login Options (for non-authenticated users) -->
    <GuestCheckoutPrompt
      v-if="!user && !showGuestForm"
      :show="true"
      @continue-as-guest="emit('continue-as-guest')"
    />

    <!-- Guest Email Section -->
    <section
      v-if="!user && showGuestForm"
      class="checkout-section"
    >
      <div class="section-header">
        <div class="flex items-center">
          <span class="section-number">1</span>
          <h3 class="section-title">
            {{ $t('checkout.hybrid.contact') }}
          </h3>
        </div>
      </div>
      <div class="section-content">
        <GuestInfoForm
          :model-value="guestInfo"
          :errors="guestErrors"
          @update:model-value="emit('update:guestInfo', $event)"
          @validate="(field: string) => emit('validate-guest', field)"
          @clear-error="(field: string) => emit('clear-guest-error', field)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GuestInfo } from '~/composables/useGuestCheckout'
import type { User, JwtPayload } from '@supabase/supabase-js'
import GuestCheckoutPrompt from '~/components/checkout/GuestCheckoutPrompt.vue'
import GuestInfoForm from '~/components/checkout/GuestInfoForm.vue'

interface Props {
  user: User | JwtPayload | null
  showGuestForm: boolean
  guestInfo: GuestInfo
  guestErrors: Record<string, string>
}

interface Emits {
  (e: 'continue-as-guest'): void
  (e: 'update:guestInfo', value: GuestInfo): void
  (e: 'validate-guest', field: string): void
  (e: 'clear-guest-error', field: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.guest-section {
  width: 100%;
}

.checkout-section {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
}

:root.dark .checkout-section,
.dark .checkout-section {
  background-color: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(243 244 246);
}

:root.dark .section-header,
.dark .section-header {
  border-bottom-color: rgb(55 65 81);
}

.section-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: rgb(225 29 72);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

:root.dark .section-title,
.dark .section-title {
  color: white;
}

.section-content {
  padding: 1.5rem;
}
</style>
