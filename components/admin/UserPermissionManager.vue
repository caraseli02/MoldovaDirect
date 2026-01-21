<!--
  Admin User Permission Manager Component

  Requirements addressed:
  - 4.5: Create user permission management interface

  Features:
  - Role assignment interface
  - Permission matrix display
  - Role-based access control management
  - Audit trail for permission changes
-->

<template>
  <div class="bg-white shadow-sm rounded-lg border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">
            User Permissions
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Manage roles and permissions for {{ userName }}
          </p>
        </div>

        <Button
          v-if="hasChanges"
          :disabled="saving"
          class="px-4 py-2"
          @click="saveChanges"
        >
          <commonIcon
            v-if="saving"
            name="lucide:refresh-ccw"
            class="w-4 h-4 animate-spin mr-2"
          />
          Save Changes
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="p-8 text-center"
    >
      <div class="inline-flex items-center gap-2 text-gray-600">
        <commonIcon
          name="lucide:refresh-ccw"
          class="w-5 h-5 animate-spin"
        />
        Loading permissions...
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-8 text-center"
    >
      <div class="text-red-600 mb-4">
        <commonIcon
          name="lucide:alert-triangle"
          class="w-8 h-8 mx-auto mb-2"
        />
        {{ error }}
      </div>
      <Button
        class="px-4 py-2"
        @click="fetchPermissions"
      >
        Retry
      </Button>
    </div>

    <!-- Permission Content -->
    <div
      v-else
      class="p-6 space-y-6"
    >
      <!-- Current Role -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-3">
          Current Role
        </h4>
        <div class="flex items-center gap-4">
          <UiSelect
            v-model="selectedRole"
            @update:model-value="onRoleChange"
          >
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.id"
              >
                {{ role.name }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <div class="text-sm text-gray-600">
            {{ getRoleDescription(selectedRole) }}
          </div>
        </div>
      </div>

      <!-- Permission Matrix -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-3">
          Permissions
        </h4>
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Granted
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="permission in permissions"
                :key="permission.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                  {{ permission.name }}
                </td>
                <td class="px-4 py-3 text-center">
                  <UiCheckbox
                    v-model="permission.granted"
                    :disabled="permission.inherited"
                    @update:model-value="onPermissionChange"
                  />
                  <div
                    v-if="permission.inherited"
                    class="text-xs text-gray-500 mt-1"
                  >
                    Inherited from role
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ permission.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Role History -->
      <div v-if="roleHistory.length > 0">
        <h4 class="text-md font-medium text-gray-900 mb-3">
          Role History
        </h4>
        <div class="space-y-3">
          <div
            v-for="change in roleHistory"
            :key="change.id"
            class="p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="text-sm font-medium text-gray-900">
                  Role changed from "{{ change.oldRole }}" to "{{ change.newRole }}"
                </div>
                <div class="text-sm text-gray-600 mt-1">
                  {{ change.reason || 'No reason provided' }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Changed by {{ change.changedBy }} on {{ formatDate(change.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permission Notes -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-3">
          Notes
        </h4>
        <UiTextarea
          v-model="permissionNotes"
          rows="3"
          placeholder="Add notes about permission changes..."
          @input="onNotesChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userId: string
  userName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  permissionChanged: [userId: string, changes: Record<string, any>]
}>()

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

interface Permission {
  id: string
  name: string
  description: string
  granted: boolean
  inherited: boolean
}

interface RoleChange {
  id: string
  oldRole: string
  newRole: string
  reason?: string
  changedBy: string
  createdAt: string
}

// State
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const selectedRole = ref('')
const originalRole = ref('')
const permissions = ref<Permission[]>([])
const originalPermissions = ref<Permission[]>([])
const roleHistory = ref<RoleChange[]>([])
const permissionNotes = ref('')
const originalNotes = ref('')

// Available roles (this could be fetched from an API)
const availableRoles: Role[] = [
  {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic permissions',
    permissions: ['view_products', 'create_orders', 'manage_profile'],
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Moderator with content management permissions',
    permissions: ['view_products', 'create_orders', 'manage_profile', 'moderate_content', 'view_reports'],
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full administrative access',
    permissions: ['*'], // All permissions
  },
]

// All available permissions
const allPermissions = [
  { id: 'view_products', name: 'View Products', description: 'Can view product catalog' },
  { id: 'create_orders', name: 'Create Orders', description: 'Can place orders' },
  { id: 'manage_profile', name: 'Manage Profile', description: 'Can edit own profile' },
  { id: 'moderate_content', name: 'Moderate Content', description: 'Can moderate user content' },
  { id: 'view_reports', name: 'View Reports', description: 'Can view system reports' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can manage other users' },
  { id: 'manage_products', name: 'Manage Products', description: 'Can manage product catalog' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Can view system analytics' },
  { id: 'system_admin', name: 'System Admin', description: 'Full system administration' },
]

// Computed
const hasChanges = computed(() => {
  return selectedRole.value !== originalRole.value
    || permissionNotes.value !== originalNotes.value
    || JSON.stringify(permissions.value) !== JSON.stringify(originalPermissions.value)
})

// Methods
const fetchPermissions = async () => {
  loading.value = true
  error.value = null

  try {
    // This would typically fetch from an API
    // For now, we'll simulate the data

    // Get current user role (from user metadata or separate API)
    const currentRole = 'user' // This would come from the user data
    selectedRole.value = currentRole
    originalRole.value = currentRole

    // Build permissions based on role
    updatePermissionsForRole(currentRole)

    // Simulate role history
    roleHistory.value = [
      {
        id: '1',
        oldRole: 'user',
        newRole: 'user',
        reason: 'Initial registration',
        changedBy: 'System',
        createdAt: new Date().toISOString(),
      },
    ]

    originalPermissions.value = JSON.parse(JSON.stringify(permissions.value))
    originalNotes.value = permissionNotes.value
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch permissions'
    console.error('Error fetching permissions:', err)
  }
  finally {
    loading.value = false
  }
}

const updatePermissionsForRole = (roleId: string) => {
  const role = availableRoles.find(r => r.id === roleId)
  if (!role) return

  permissions.value = allPermissions.map((perm) => {
    const isGranted = role.permissions.includes('*') || role.permissions.includes(perm.id)
    return {
      ...perm,
      granted: isGranted,
      inherited: isGranted, // Mark as inherited from role
    }
  })
}

const onRoleChange = () => {
  updatePermissionsForRole(selectedRole.value)
}

const onPermissionChange = () => {
  // Mark permissions as manually changed (not inherited)
  permissions.value.forEach((perm) => {
    if (perm.granted !== getInheritedPermission(perm.id)) {
      perm.inherited = false
    }
  })
}

const onNotesChange = () => {
  // Notes changed - will be detected by hasChanges computed
}

const getInheritedPermission = (permissionId: string): boolean => {
  const role = availableRoles.find(r => r.id === selectedRole.value)
  if (!role) return false
  return role.permissions.includes('*') || role.permissions.includes(permissionId)
}

const getRoleDescription = (roleId: string): string => {
  const role = availableRoles.find(r => r.id === roleId)
  return role?.description || ''
}

const saveChanges = async () => {
  saving.value = true

  try {
    const changes = {
      role: selectedRole.value !== originalRole.value ? selectedRole.value : undefined,
      permissions: permissions.value.filter(p => !p.inherited && p.granted !== getInheritedPermission(p.id)),
      notes: permissionNotes.value !== originalNotes.value ? permissionNotes.value : undefined,
    }

    // This would typically save to an API
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

    // Update original values
    originalRole.value = selectedRole.value
    originalPermissions.value = JSON.parse(JSON.stringify(permissions.value))
    originalNotes.value = permissionNotes.value

    // Add to role history if role changed
    if (changes.role) {
      roleHistory.value.unshift({
        id: Date.now().toString(),
        oldRole: originalRole.value,
        newRole: selectedRole.value,
        reason: permissionNotes.value || 'Role updated by admin',
        changedBy: 'Admin', // This would be the current admin user
        createdAt: new Date().toISOString(),
      })
    }

    emit('permissionChanged', props.userId, changes)

    const toast = useToast()
    toast.success('Permissions updated successfully')
  }
  catch (err: unknown) {
    const toast = useToast()
    toast.error('Failed to update permissions')
    console.error('Error saving permissions:', err)
  }
  finally {
    saving.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Watch for userId changes
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    fetchPermissions()
  }
}, { immediate: true })
</script>
