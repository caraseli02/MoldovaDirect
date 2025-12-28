<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <div class="container py-6 md:py-12">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-6 md:mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            {{ $t('profile.title') }}
          </h1>
          <p class="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
            {{ $t('profile.autoSaveDescription') }}
          </p>

          <!-- Profile Completion Indicator -->
          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-zinc-900 dark:text-white">
                {{ $t('profile.completion') || 'Profile Completion' }}
              </span>
              <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {{ profileCompletionPercentage }}%
              </span>
            </div>
            <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${profileCompletionPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <!-- Profile Picture Section (Always Visible) -->
          <div class="border-b border-zinc-200 dark:border-zinc-700">
            <div class="p-6 text-center">
              <!-- Drag & Drop Avatar -->
              <div
                role="button"
                tabindex="0"
                :aria-label="$t('profile.uploadPicture') + '. ' + $t('profile.dragDropHint')"
                class="relative mx-auto mb-4 w-24 h-24 md:w-28 md:h-28 rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
                :class="{ 'ring-4 ring-blue-500 ring-opacity-50 scale-105': isDraggingAvatar }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleAvatarDrop"
                @click="triggerFileUpload"
                @keydown.enter="triggerFileUpload"
                @keydown.space.prevent="triggerFileUpload"
              >
                <div
                  class="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
                  :class="{ 'opacity-75': isDraggingAvatar }"
                >
                  <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    :alt="$t('profile.profilePicture')"
                    class="h-full w-full object-cover"
                  />
                  <span
                    v-else
                    class="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-300"
                  >
                    {{ getUserInitials() }}
                  </span>
                </div>

                <!-- Drop zone overlay -->
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  leave-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  leave-to-class="opacity-0"
                >
                  <div
                    v-if="isDraggingAvatar"
                    class="absolute inset-0 flex items-center justify-center bg-blue-600/90 rounded-full pointer-events-none"
                  >
                    <commonIcon
                      name="lucide:upload"
                      class="w-8 h-8 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>

                <button
                  type="button"
                  :aria-label="$t('profile.changePicture')"
                  class="absolute -bottom-1 -right-1 h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  @click.stop="triggerFileUpload"
                  @keydown.enter.stop="triggerFileUpload"
                  @keydown.space.prevent.stop="triggerFileUpload"
                >
                  <commonIcon
                    name="lucide:camera"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {{ $t('profile.dragDropHint') }}
              </p>
              <div
                v-if="profilePictureUrl"
                class="flex justify-center"
              >
                <button
                  type="button"
                  class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  @click="removePicture"
                >
                  {{ $t('profile.removePicture') }}
                </button>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload"
              />
            </div>
          </div>

          <!-- Personal Info Section (Expanded by Default) -->
          <ProfileAccordionSection
            ref="personalAccordion"
            :title="$t('profile.sections.personalInfo')"
            :subtitle="$t('profile.sections.personalInfoSubtitle')"
            icon="lucide:user"
            icon-bg="bg-blue-50 dark:bg-blue-900/30"
            icon-color="text-blue-600 dark:text-blue-400"
            :expanded="expandedSection === 'personal'"
            @toggle="toggleSection('personal')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('preferences')"
            @navigate-prev="focusAccordion('security')"
          >
            <div class="space-y-4">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {{ $t('auth.labels.fullName') }} *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.name }"
                  :placeholder="$t('auth.placeholders.fullName')"
                  @input="debouncedSave"
                />
                <p
                  v-if="errors.name"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ errors.name }}
                </p>
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {{ $t('auth.labels.email') }} *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  disabled
                  class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm bg-zinc-50 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  :placeholder="$t('auth.placeholders.email')"
                />
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {{ $t('profile.emailCannotBeChanged') }}
                </p>
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {{ $t('auth.labels.phone') }}
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="tel"
                  class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.phone }"
                  :placeholder="$t('auth.placeholders.phone')"
                  @input="debouncedSave"
                />
                <p
                  v-if="errors.phone"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ errors.phone }}
                </p>
              </div>
            </div>
          </ProfileAccordionSection>

          <!-- Preferences Section -->
          <ProfileAccordionSection
            ref="preferencesAccordion"
            :title="$t('profile.sections.preferences')"
            :subtitle="$t('profile.sections.preferencesSubtitle')"
            icon="lucide:settings"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'preferences'"
            @toggle="toggleSection('preferences')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('addresses')"
            @navigate-prev="focusAccordion('personal')"
          >
            <div class="space-y-4">
              <div>
                <label
                  for="language"
                  class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {{ $t('auth.labels.language') }}
                </label>
                <select
                  id="language"
                  v-model="form.preferredLanguage"
                  class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  @change="handleSave"
                >
                  <option value="es">
                    Español
                  </option>
                  <option value="en">
                    English
                  </option>
                  <option value="ro">
                    Română
                  </option>
                  <option value="ru">
                    Русский
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="currency"
                  class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  {{ $t('profile.sections.currency') }}
                </label>
                <select
                  id="currency"
                  v-model="form.preferredCurrency"
                  class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  @change="handleSave"
                >
                  <option value="EUR">
                    EUR (€)
                  </option>
                  <option value="USD">
                    USD ($)
                  </option>
                  <option value="MDL">
                    MDL (L)
                  </option>
                </select>
              </div>
            </div>
          </ProfileAccordionSection>

          <!-- Addresses Section -->
          <ProfileAccordionSection
            ref="addressesAccordion"
            :title="$t('profile.addresses')"
            :subtitle="addressCountText"
            icon="lucide:map-pin"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'addresses'"
            @toggle="toggleSection('addresses')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('security')"
            @navigate-prev="focusAccordion('preferences')"
          >
            <div class="space-y-4">
              <!-- Address List -->
              <div
                v-if="addresses.length > 0"
                class="space-y-3"
              >
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  class="p-4 rounded-lg border transition-all duration-200"
                  :class="address.isDefault
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                        {{ address.firstName }} {{ address.lastName }}
                      </span>
                      <span
                        v-if="address.isDefault"
                        class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                      >
                        {{ $t('profile.default') }}
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        :aria-label="`${$t('profile.editAddress')} ${address.firstName} ${address.lastName}`"
                        class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :disabled="savingAddressId === address.id || deletingAddressId === address.id"
                        @click="editAddress(address)"
                      >
                        <commonIcon
                          name="lucide:square-pen"
                          class="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        :aria-label="`${$t('profile.deleteAddress')} ${address.firstName} ${address.lastName}`"
                        class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        :disabled="savingAddressId === address.id || deletingAddressId === address.id"
                        @click="address.id && confirmDeleteAddress(address.id)"
                      >
                        <commonIcon
                          v-if="deletingAddressId === address.id"
                          name="lucide:loader-2"
                          class="h-5 w-5 animate-spin"
                          aria-hidden="true"
                        />
                        <commonIcon
                          v-else
                          name="lucide:trash-2"
                          class="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>{{ address.street }}</p>
                    <p>{{ address.city }}, {{ address.postalCode }}</p>
                    <p v-if="address.province">
                      {{ address.province }}
                    </p>
                    <p>{{ address.country }}</p>
                    <p
                      v-if="address.phone"
                      class="mt-1 text-zinc-500"
                    >
                      {{ address.phone }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Add Address Button -->
              <button
                type="button"
                class="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200"
                @click="showAddressForm = true"
              >
                + {{ addresses.length > 0 ? $t('profile.addAddress') : $t('profile.addFirstAddress') }}
              </button>
            </div>
          </ProfileAccordionSection>

          <!-- Security Section -->
          <ProfileAccordionSection
            ref="securityAccordion"
            :title="$t('profile.sections.security')"
            :subtitle="$t('profile.sections.securitySubtitle')"
            icon="lucide:lock"
            icon-bg="bg-zinc-100 dark:bg-zinc-700"
            icon-color="text-zinc-600 dark:text-zinc-400"
            :expanded="expandedSection === 'security'"
            :is-last="true"
            @toggle="toggleSection('security')"
            @navigate-first="focusAccordion('personal')"
            @navigate-last="focusAccordion('security')"
            @navigate-next="focusAccordion('personal')"
            @navigate-prev="focusAccordion('addresses')"
          >
            <div class="space-y-3">
              <!-- Password -->
              <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-white">
                    {{ $t('profile.sections.password') }}
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    ••••••••
                  </p>
                </div>
                <button
                  type="button"
                  class="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  @click="showPasswordModal = true"
                >
                  {{ $t('profile.sections.change') }}
                </button>
              </div>

              <!-- 2FA -->
              <div class="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-white">
                    {{ $t('profile.sections.twoFactor') }}
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    {{ $t('profile.sections.twoFactorDisabled') }}
                  </p>
                </div>
                <button
                  type="button"
                  class="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  @click="show2FAModal = true"
                >
                  {{ $t('profile.sections.enable') }}
                </button>
              </div>
            </div>
          </ProfileAccordionSection>

          <!-- Delete Account Section (Always Visible) -->
          <div class="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <button
              type="button"
              class="w-full py-3 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-white dark:hover:bg-zinc-700 rounded-lg border border-red-200 dark:border-red-900 transition-all duration-200"
              @click="showDeleteConfirmation = true"
            >
              {{ $t('profile.deleteAccount') }}
            </button>
          </div>
        </div>

        <!-- Auto-save Indicator -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 translate-y-2"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="saveStatus !== 'idle'"
            class="fixed bottom-6 right-6 z-50"
          >
            <div
              class="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors duration-200"
              :class="{
                'bg-zinc-800 text-white': saveStatus === 'saving',
                'bg-green-600 text-white': saveStatus === 'saved',
                'bg-red-600 text-white': saveStatus === 'error',
              }"
            >
              <commonIcon
                v-if="saveStatus === 'saving'"
                name="lucide:loader-2"
                class="h-4 w-4 animate-spin"
              />
              <commonIcon
                v-else-if="saveStatus === 'saved'"
                name="lucide:check"
                class="h-4 w-4"
              />
              <commonIcon
                v-else
                name="lucide:x"
                class="h-4 w-4"
              />
              <span class="text-sm font-medium">
                {{ saveStatusText }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Address Form Modal -->
    <AddressFormModal
      v-if="showAddressForm"
      :address="editingAddress"
      @save="handleAddressSave"
      @close="closeAddressForm"
    />

    <!-- Delete Account Confirmation Modal -->
    <DeleteAccountModal
      v-if="showDeleteConfirmation"
      @confirm="handleDeleteAccount"
      @close="showDeleteConfirmation = false"
    />

    <!-- Password Change Modal (Placeholder) -->
    <Teleport to="body">
      <div
        v-if="showPasswordModal"
        ref="passwordModalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showPasswordModal = false"
        @keydown.escape="showPasswordModal = false"
        @keydown.tab="trapFocus($event, passwordModalRef)"
      >
        <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3
            id="password-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
          >
            {{ $t('profile.sections.changePassword') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {{ $t('profile.sections.changePasswordDescription') }}
          </p>
          <Button
            ref="passwordModalCloseBtn"
            variant="outline"
            class="w-full"
            @click="showPasswordModal = false"
          >
            {{ $t('common.close') }}
          </Button>
        </div>
      </div>
    </Teleport>

    <!-- 2FA Modal (Placeholder) -->
    <Teleport to="body">
      <div
        v-if="show2FAModal"
        ref="twoFAModalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="2fa-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="show2FAModal = false"
        @keydown.escape="show2FAModal = false"
        @keydown.tab="trapFocus($event, twoFAModalRef)"
      >
        <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3
            id="2fa-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
          >
            {{ $t('profile.sections.enable2FA') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {{ $t('profile.sections.enable2FADescription') }}
          </p>
          <Button
            ref="twoFAModalCloseBtn"
            variant="outline"
            class="w-full"
            @click="show2FAModal = false"
          >
            {{ $t('common.close') }}
          </Button>
        </div>
      </div>
    </Teleport>

    <!-- Delete Address Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteAddressConfirm"
        ref="deleteAddressModalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-address-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDeleteAddressConfirm = false"
        @keydown.escape="showDeleteAddressConfirm = false"
        @keydown.tab="trapFocus($event, deleteAddressModalRef)"
      >
        <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3
            id="delete-address-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-2"
          >
            {{ $t('profile.deleteAddress') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {{ $t('profile.confirmDeleteAddress') }}
          </p>
          <div class="flex gap-3 justify-end">
            <Button
              variant="outline"
              @click="showDeleteAddressConfirm = false"
            >
              {{ $t('common.cancel') }}
            </Button>
            <Button
              variant="destructive"
              :disabled="deletingAddressId !== null"
              @click="executeDeleteAddress"
            >
              <commonIcon
                v-if="deletingAddressId !== null"
                name="lucide:loader-2"
                class="h-4 w-4 mr-2 animate-spin"
                aria-hidden="true"
              />
              {{ $t('common.delete') }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Component imports
import { Button } from '@/components/ui/button'
import AddressFormModal from '~/components/profile/AddressFormModal.vue'
import DeleteAccountModal from '~/components/profile/DeleteAccountModal.vue'
import ProfileAccordionSection from '~/components/profile/ProfileAccordionSection.vue'

// Type imports - use canonical types
import type { Address, AddressEntity } from '~/types/address'

// Database address type alias for internal use
type DatabaseAddress = AddressEntity

// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

interface ProfileForm {
  name: string
  email: string
  phone: string
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  preferredCurrency: 'EUR' | 'USD' | 'MDL'
}

interface ToastPlugin {
  success: (message: string) => void
  error: (message: string) => void
  warning?: (message: string) => void
  info?: (message: string) => void
}

// Composables and utilities
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as ToastPlugin

// Reactive state
const isLoading = ref(false)
const profilePictureUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement>()
const showAddressForm = ref(false)
const showDeleteConfirmation = ref(false)
const showPasswordModal = ref(false)
const show2FAModal = ref(false)
const showDeleteAddressConfirm = ref(false)
const addressToDelete = ref<number | null>(null)
const editingAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])
const isDraggingAvatar = ref(false)
const expandedSection = ref<string | null>('personal')
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const savingAddressId = ref<number | null>(null)
const deletingAddressId = ref<number | null>(null)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
let hideStatusTimeout: ReturnType<typeof setTimeout> | null = null

// Modal refs for focus trap
const passwordModalRef = ref<HTMLElement>()
const twoFAModalRef = ref<HTMLElement>()
const deleteAddressModalRef = ref<HTMLElement>()
const passwordModalCloseBtn = ref<InstanceType<typeof Button>>()
const twoFAModalCloseBtn = ref<InstanceType<typeof Button>>()

// Accordion refs for keyboard navigation using Vue 3.5+ useTemplateRef
type AccordionKey = 'personal' | 'preferences' | 'addresses' | 'security'
const personalAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('personalAccordion')
const preferencesAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('preferencesAccordion')
const addressesAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('addressesAccordion')
const securityAccordionRef = useTemplateRef<InstanceType<typeof ProfileAccordionSection>>('securityAccordion')

// Map for easy lookup
const accordionRefs: Record<AccordionKey, Ref<InstanceType<typeof ProfileAccordionSection> | null>> = {
  personal: personalAccordionRef,
  preferences: preferencesAccordionRef,
  addresses: addressesAccordionRef,
  security: securityAccordionRef,
}

// Focus a specific accordion section for keyboard navigation
const focusAccordion = (section: AccordionKey) => {
  const accordion = accordionRefs[section].value
  if (accordion?.focus) {
    accordion.focus()
  }
}

// Track if form has unsaved changes
const hasUnsavedChanges = computed(() => {
  return form.name !== originalForm.value.name
    || form.phone !== originalForm.value.phone
    || form.preferredLanguage !== originalForm.value.preferredLanguage
    || form.preferredCurrency !== originalForm.value.preferredCurrency
})

// Form data
const form = reactive<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
  preferredCurrency: 'EUR',
})

const originalForm = ref<ProfileForm>({
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'es',
  preferredCurrency: 'EUR',
})

// Form validation
const errors = reactive({
  name: '',
  phone: '',
})

// Computed properties
const addressCountText = computed(() => {
  const count = addresses.value.length
  if (count === 0) return t('profile.noAddresses')
  return `${count} ${count === 1 ? t('profile.addressSingular') : t('profile.addressPlural')}`
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving': return t('profile.saving')
    case 'saved': return t('profile.saved')
    case 'error': return t('profile.saveError')
    default: return ''
  }
})

// Profile completion percentage
const profileCompletionPercentage = computed(() => {
  let completed = 0
  const total = 5 // Total checkpoints

  if (form.name && form.name.length >= 2) completed++
  if (form.phone && /^[+]?[0-9\s\-()]{9,}$/.test(form.phone)) completed++
  if (profilePictureUrl.value) completed++
  if (addresses.value.length > 0) completed++
  // CRITICAL FIX: Only count preferences if user has explicitly saved them (not using defaults)
  // Check if preferences exist in user metadata (set via handleSave)
  const hasExplicitPreferences = user.value?.user_metadata?.preferred_language
    && user.value?.user_metadata?.preferred_currency
  if (hasExplicitPreferences) completed++

  return Math.round((completed / total) * 100)
})

// Focus trap utility for modals - accepts the element directly (Vue template auto-unwraps refs)
const trapFocus = (event: KeyboardEvent, modal: HTMLElement | undefined) => {
  if (!modal) return

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
  }
  else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

// Handle drag events for avatar
const handleDragOver = () => {
  isDraggingAvatar.value = true
}

const handleDragLeave = (event: DragEvent) => {
  // Only set to false if leaving the entire drop zone
  const target = event.currentTarget as HTMLElement
  if (!target.contains(event.relatedTarget as Node)) {
    isDraggingAvatar.value = false
  }
}

// Toggle accordion section
const toggleSection = (section: string) => {
  expandedSection.value = expandedSection.value === section ? null : section
}

// Initialize form with user data
const initializeForm = () => {
  if (user.value) {
    const userData = {
      name: user.value.user_metadata?.name || user.value.user_metadata?.full_name || '',
      email: user.value.email || '',
      phone: user.value.user_metadata?.phone || '',
      preferredLanguage: (user.value.user_metadata?.preferred_language || 'es') as 'es' | 'en' | 'ro' | 'ru',
      preferredCurrency: (user.value.user_metadata?.preferred_currency || 'EUR') as 'EUR' | 'USD' | 'MDL',
    }

    Object.assign(form, userData)
    originalForm.value = { ...userData }

    // Load profile picture if exists
    if (user.value.user_metadata?.avatar_url) {
      profilePictureUrl.value = user.value.user_metadata.avatar_url
    }
  }
}

// Load addresses
const loadAddresses = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.value.id)
      .order('is_default', { ascending: false })

    if (error) throw error

    // Map database fields to camelCase
    addresses.value = (data || []).map((addr: DatabaseAddress): Address => ({
      id: addr.id,
      type: addr.type,
      firstName: addr.first_name,
      lastName: addr.last_name,
      company: addr.company || undefined,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postal_code,
      province: addr.province || undefined,
      country: addr.country,
      phone: addr.phone || undefined,
      isDefault: addr.is_default,
    }))
  }
  catch (error: any) {
    console.error('Error loading addresses:', error)
    $toast.error(t('profile.errors.loadAddressesFailed'))
  }
}

// Form validation
const validateForm = (): boolean => {
  errors.name = ''
  errors.phone = ''

  if (!form.name.trim()) {
    errors.name = t('auth.validation.name.required')
    return false
  }

  if (form.name.trim().length < 2) {
    errors.name = t('auth.validation.name.minLength')
    return false
  }

  if (form.phone && !/^[+]?[0-9\s\-()]{9,}$/.test(form.phone)) {
    errors.phone = t('auth.validation.phone.invalid')
    return false
  }

  return true
}

// Get user initials for avatar
const getUserInitials = (): string => {
  if (!form.name) {
    const email = user.value?.email
    return email ? email.charAt(0).toUpperCase() : 'U'
  }

  return form.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Debounced auto-save
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    handleSave()
  }, 1000)
}

// Handle form save (auto-save)
const handleSave = async () => {
  if (!validateForm()) {
    // Scroll to first error field
    const firstErrorField = errors.name ? 'name' : errors.phone ? 'phone' : null
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  // Clear any existing hide timeout
  if (hideStatusTimeout) {
    clearTimeout(hideStatusTimeout)
  }

  saveStatus.value = 'saving'

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: form.name,
        full_name: form.name,
        phone: form.phone,
        preferred_language: form.preferredLanguage,
        preferred_currency: form.preferredCurrency,
      },
    })

    if (error) throw error

    // Update original form to reflect saved state
    originalForm.value = { ...form }

    saveStatus.value = 'saved'

    // Hide the indicator after 2 seconds
    hideStatusTimeout = setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: any) {
    console.error('Error updating profile:', error)
    saveStatus.value = 'error'

    // CRITICAL FIX: Show toast error so user knows save failed
    const errorMessage = error?.message || t('profile.saveError')
    $toast.error(errorMessage)

    // Keep error visible longer so user can see it
    hideStatusTimeout = setTimeout(() => {
      saveStatus.value = 'idle'
    }, 5000)
  }
}

// Profile picture handling
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleAvatarDrop = async (event: DragEvent) => {
  isDraggingAvatar.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await uploadAvatar(file)
  }
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    await uploadAvatar(file)
  }
}

const uploadAvatar = async (file: File) => {
  if (!user.value) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    $toast.error(t('profile.errors.invalidFileType'))
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    $toast.error(t('profile.errors.fileTooLarge'))
    return
  }

  try {
    isLoading.value = true
    saveStatus.value = 'saving'

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = data.publicUrl

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    })

    if (updateError) throw updateError

    profilePictureUrl.value = avatarUrl
    saveStatus.value = 'saved'
    $toast.success(t('profile.success.pictureUpdated'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: any) {
    console.error('Error uploading profile picture:', error)
    saveStatus.value = 'error'
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    $toast.error(t('profile.errors.uploadFailed') + ': ' + errorMessage)

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
  finally {
    isLoading.value = false
  }
}

const removePicture = async () => {
  if (!user.value) return

  try {
    isLoading.value = true
    saveStatus.value = 'saving'

    // Remove from storage - get filename from stored URL to handle any extension
    const avatarUrl = user.value.user_metadata?.avatar_url
    if (avatarUrl) {
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // FIX: Check storage deletion errors
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([`${user.value.id}/${fileName}`])

      if (storageError) {
        // Log but don't throw - proceed with metadata update
        console.warn('Storage deletion warning:', storageError)
      }
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    })

    if (error) throw error

    profilePictureUrl.value = null
    saveStatus.value = 'saved'
    $toast.success(t('profile.success.pictureRemoved'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 2000)
  }
  catch (error: any) {
    console.error('Error removing profile picture:', error)
    saveStatus.value = 'error'
    $toast.error(t('profile.errors.removeFailed'))

    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
  finally {
    isLoading.value = false
  }
}

// Address management
const closeAddressForm = () => {
  showAddressForm.value = false
  editingAddress.value = null
}

const editAddress = (address: Address) => {
  editingAddress.value = { ...address }
  showAddressForm.value = true
}

const handleAddressSave = async (addressData: Address) => {
  if (!user.value?.id) {
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  try {
    // Map camelCase to snake_case for database
    const dbAddress = {
      type: addressData.type,
      first_name: addressData.firstName,
      last_name: addressData.lastName,
      company: addressData.company || null,
      street: addressData.street,
      city: addressData.city,
      postal_code: addressData.postalCode,
      province: addressData.province || null,
      country: addressData.country,
      phone: addressData.phone || null,
      is_default: addressData.isDefault,
    }

    if (addressData.id) {
      // Update existing address - verify user owns it

      const { error } = await (supabase as any)
        .from('user_addresses')
        .update(dbAddress)
        .eq('id', addressData.id)
        .eq('user_id', user.value.id)

      if (error) throw error
    }
    else {
      // Create new address

      const { error } = await (supabase as any)
        .from('user_addresses')
        .insert({
          ...dbAddress,
          user_id: user.value.id,
        })

      if (error) throw error
    }

    await loadAddresses()
    closeAddressForm()
    $toast.success(t('profile.success.addressSaved'))
  }
  catch (error: any) {
    console.error('Error saving address:', error)
    $toast.error(t('profile.errors.addressSaveFailed'))
  }
}

// Show delete confirmation modal instead of using native confirm()
const confirmDeleteAddress = (addressId: number) => {
  addressToDelete.value = addressId
  showDeleteAddressConfirm.value = true
}

// Execute the address deletion after confirmation
const executeDeleteAddress = async () => {
  if (!addressToDelete.value) return
  if (!user.value?.id) {
    $toast.error(t('profile.errors.notAuthenticated'))
    return
  }

  const addressId = addressToDelete.value

  try {
    deletingAddressId.value = addressId

    // Verify user owns the address before deleting
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.value.id)

    if (error) throw error

    await loadAddresses()
    $toast.success(t('profile.success.addressDeleted'))
  }
  catch (error: any) {
    console.error('Error deleting address:', error)

    // Provide specific error feedback
    if (error?.code === '42501') {
      $toast.error(t('profile.errors.permissionDenied') || 'Permission denied')
    }
    else {
      $toast.error(t('profile.errors.addressDeleteFailed'))
    }
  }
  finally {
    deletingAddressId.value = null
    addressToDelete.value = null
    showDeleteAddressConfirm.value = false
  }
}

// Account deletion - receives password and reason from DeleteAccountModal
const handleDeleteAccount = async (data: { password: string, reason?: string }) => {
  try {
    isLoading.value = true

    // Call server endpoint with password for verification and reason for analytics
    const response = await $fetch<{ success?: boolean, error?: string }>('/api/auth/delete-account', {
      method: 'DELETE',
      body: {
        password: data.password,
        reason: data.reason,
      },
    })

    if (response.error) throw new Error(response.error)

    $toast.success(t('profile.success.accountDeleted'))
    await navigateTo('/')
  }
  catch (error: any) {
    console.error('Error deleting account:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    $toast.error(t('profile.errors.deleteFailed') + ': ' + errorMessage)
  }
  finally {
    isLoading.value = false
    showDeleteConfirmation.value = false
  }
}

// Beforeunload handler to warn about unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value || saveTimeout) {
    e.preventDefault()
    // Modern browsers ignore custom messages, but returnValue is required
    e.returnValue = t('profile.unsavedChangesWarning') || 'You have unsaved changes.'
  }
}

// Focus first element when modal opens
watch(showPasswordModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = passwordModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

watch(show2FAModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = twoFAModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

watch(showDeleteAddressConfirm, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const modal = deleteAddressModalRef.value
      const firstFocusable = modal?.querySelector('button, [href], input') as HTMLElement
      firstFocusable?.focus()
    })
  }
})

// Session expiration handler
watch(user, (newUser, oldUser) => {
  if (oldUser && !newUser) {
    $toast.error(t('profile.errors.sessionExpired') || 'Session expired. Please log in again.')
    navigateTo('/auth/login')
  }
})

// Initialize on mount
onMounted(() => {
  initializeForm()
  loadAddresses()

  // Add beforeunload listener for unsaved changes warning
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Watch for user changes
watch(user, () => {
  if (user.value) {
    initializeForm()
    loadAddresses()
  }
}, { immediate: true })

// Cleanup timeouts and event listeners on unmount
onUnmounted(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
  if (hideStatusTimeout) clearTimeout(hideStatusTimeout)

  // Remove beforeunload listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Page meta
useHead({
  title: t('profile.title'),
})
</script>
