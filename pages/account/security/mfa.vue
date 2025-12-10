<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow rounded-lg">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ $t('auth.mfa.settings.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ $t('auth.mfa.settings.description') }}
        </p>
      </div>

      <!-- MFA Status -->
      <div class="px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
              :class="authStore.hasMFAEnabled ? 'bg-green-100' : 'bg-gray-100'"
            >
              <svg
                v-if="authStore.hasMFAEnabled"
                class="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <svg
                v-else
                class="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ authStore.hasMFAEnabled ? $t('auth.mfa.settings.statusEnabled') : $t('auth.mfa.settings.statusDisabled') }}
              </p>
              <p class="text-sm text-gray-500">
                {{
                  authStore.hasMFAEnabled
                    ? $t('auth.mfa.settings.statusEnabledDescription')
                    : $t('auth.mfa.settings.statusDisabledDescription')
                }}
              </p>
            </div>
          </div>

          <button
            v-if="!authStore.hasMFAEnabled && !showEnrollment"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="startEnrollment"
          >
            {{ $t('auth.mfa.settings.enableButton') }}
          </button>
        </div>

        <!-- MFA Enrollment Flow -->
        <div
          v-if="showEnrollment"
          class="mt-6 border-t border-gray-200 pt-6"
        >
          <div class="space-y-6">
            <!-- Step 1: Scan QR Code -->
            <div v-if="!enrollmentComplete">
              <h4 class="text-sm font-medium text-gray-900 mb-4">
                {{ $t('auth.mfa.settings.enrollmentStep1') }}
              </h4>

              <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex flex-col items-center space-y-4">
                  <!-- QR Code -->
                  <div
                    v-if="authStore.mfaEnrollment?.qrCode"
                    class="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <img
                      :src="authStore.mfaEnrollment.qrCode"
                      alt="QR Code"
                      class="w-48 h-48"
                    />
                  </div>

                  <!-- Manual entry option -->
                  <div class="text-center">
                    <button
                      type="button"
                      class="text-sm text-indigo-600 hover:text-indigo-500"
                      @click="showManualEntry = !showManualEntry"
                    >
                      {{ showManualEntry ? $t('auth.mfa.settings.hideManualEntry') : $t('auth.mfa.settings.showManualEntry') }}
                    </button>
                  </div>

                  <div
                    v-if="showManualEntry"
                    class="w-full max-w-md"
                  >
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ $t('auth.mfa.settings.secretKey') }}
                    </label>
                    <div class="flex items-center space-x-2">
                      <input
                        :value="authStore.mfaEnrollment?.secret"
                        readonly
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                      />
                      <button
                        type="button"
                        class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        @click="copySecret"
                      >
                        {{ $t('auth.mfa.settings.copy') }}
                      </button>
                    </div>
                  </div>

                  <!-- Instructions -->
                  <div class="text-sm text-gray-600 max-w-md">
                    <p class="font-medium mb-2">
                      {{ $t('auth.mfa.settings.instructions') }}
                    </p>
                    <ol class="list-decimal list-inside space-y-1 text-xs">
                      <li>{{ $t('auth.mfa.settings.instruction1') }}</li>
                      <li>{{ $t('auth.mfa.settings.instruction2') }}</li>
                      <li>{{ $t('auth.mfa.settings.instruction3') }}</li>
                    </ol>
                  </div>
                </div>
              </div>

              <!-- Step 2: Verify Code -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-4">
                  {{ $t('auth.mfa.settings.enrollmentStep2') }}
                </h4>

                <form
                  class="max-w-md"
                  @submit.prevent="completeEnrollment"
                >
                  <div class="space-y-4">
                    <div>
                      <label
                        for="verification-code"
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {{ $t('auth.mfa.settings.verificationCodeLabel') }}
                      </label>
                      <input
                        id="verification-code"
                        v-model="verificationCode"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        maxlength="6"
                        autocomplete="off"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-widest"
                        :class="{
                          'border-red-500': enrollmentError,
                          'border-gray-300': !enrollmentError,
                        }"
                        placeholder="000000"
                        :disabled="authStore.mfaLoading"
                      />
                    </div>

                    <div
                      v-if="enrollmentError"
                      class="rounded-md bg-red-50 p-3"
                    >
                      <p class="text-sm text-red-800">
                        {{ enrollmentError }}
                      </p>
                    </div>

                    <div class="flex space-x-3">
                      <button
                        type="submit"
                        :disabled="authStore.mfaLoading || verificationCode.length !== 6"
                        class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="!authStore.mfaLoading">{{ $t('auth.mfa.settings.verifyButton') }}</span>
                        <span
                          v-else
                          class="flex items-center"
                        >
                          <svg
                            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            />
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {{ $t('auth.mfa.settings.verifying') }}
                        </span>
                      </button>

                      <button
                        type="button"
                        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                        @click="cancelEnrollment"
                      >
                        {{ $t('auth.mfa.settings.cancelButton') }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Active MFA Factors -->
        <div
          v-if="authStore.hasMFAEnabled"
          class="mt-6 border-t border-gray-200 pt-6"
        >
          <h4 class="text-sm font-medium text-gray-900 mb-4">
            {{ $t('auth.mfa.settings.activeFactors') }}
          </h4>

          <div class="space-y-3">
            <div
              v-for="factor in authStore.mfaFactors"
              :key="factor.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ factor.friendlyName || 'Authenticator App' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ factor.type.toUpperCase() }} - {{ factor.status === 'verified' ? $t('auth.mfa.settings.verified') : $t('auth.mfa.settings.unverified') }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="text-sm text-red-600 hover:text-red-500"
                @click="confirmDisable(factor.id)"
              >
                {{ $t('auth.mfa.settings.removeButton') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                {{ $t('auth.mfa.settings.securityNoticeTitle') }}
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>{{ $t('auth.mfa.settings.securityNoticeDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Disable MFA Confirmation Modal -->
    <div
      v-if="showDisableConfirm"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showDisableConfirm = false"
        ></div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                id="modal-title"
                class="text-lg leading-6 font-medium text-gray-900"
              >
                {{ $t('auth.mfa.settings.disableConfirmTitle') }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ $t('auth.mfa.settings.disableConfirmDescription') }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="disableMFA"
            >
              {{ $t('auth.mfa.settings.disableConfirmButton') }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              @click="showDisableConfirm = false"
            >
              {{ $t('auth.mfa.settings.disableCancelButton') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()

const showEnrollment = ref(false)
const showManualEntry = ref(false)
const enrollmentComplete = ref(false)
const verificationCode = ref('')
const enrollmentError = ref('')
const showDisableConfirm = ref(false)
const factorToDisable = ref<string | null>(null)

const startEnrollment = async () => {
  try {
    await authStore.enrollMFA()
    showEnrollment.value = true
    enrollmentError.value = ''
  }
  catch (error) {
    console.error('Failed to start enrollment:', error)
  }
}

const completeEnrollment = async () => {
  try {
    enrollmentError.value = ''
    await authStore.verifyMFAEnrollment(verificationCode.value)
    enrollmentComplete.value = true
    showEnrollment.value = false
    verificationCode.value = ''
  }
  catch (error) {
    enrollmentError.value = error instanceof Error ? error.message : 'Verification failed'
  }
}

const cancelEnrollment = () => {
  authStore.cancelMFAEnrollment()
  showEnrollment.value = false
  showManualEntry.value = false
  verificationCode.value = ''
  enrollmentError.value = ''
}

const copySecret = async () => {
  if (authStore.mfaEnrollment?.secret) {
    try {
      await navigator.clipboard.writeText(authStore.mfaEnrollment.secret)
      // Could show a toast notification here
    }
    catch (error) {
      console.error('Failed to copy secret:', error)
    }
  }
}

const confirmDisable = (factorId: string) => {
  factorToDisable.value = factorId
  showDisableConfirm.value = true
}

const disableMFA = async () => {
  if (factorToDisable.value) {
    try {
      await authStore.unenrollMFA(factorToDisable.value)
      showDisableConfirm.value = false
      factorToDisable.value = null
    }
    catch (error) {
      console.error('Failed to disable MFA:', error)
    }
  }
}
</script>
