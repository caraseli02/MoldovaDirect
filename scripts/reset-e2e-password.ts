/**
 * Reset E2E Test User Password
 *
 * Updates the test user's password to match what's in .env
 * Uses credentials from .env: TEST_USER_EMAIL and TEST_USER_PASSWORD
 *
 * Usage: npx tsx scripts/reset-e2e-password.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'teste2e@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'N7jKAcu2FHbt7cj'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function resetE2EPassword() {
  console.log('🔐 Resetting E2E test user password...')
  console.log(`   Email: ${TEST_USER_EMAIL}`)

  try {
    // Find the user
    let allUsers: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      })

      if (listError) {
        console.warn('⚠️  Could not list users:', listError.message)
        break
      }

      if (existingUsers?.users) {
        allUsers = allUsers.concat(existingUsers.users)
      }

      hasMore = existingUsers?.users.length === 1000
      page++
    }

    const existingUser = allUsers.find(u => u.email === TEST_USER_EMAIL)

    if (!existingUser) {
      console.error('❌ Test user not found')
      console.error('   Please run: npx tsx scripts/setup-e2e-user.ts')
      process.exit(1)
    }

    console.log(`✓ Found user: ${existingUser.id}`)

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: TEST_USER_PASSWORD,
    })

    if (error) {
      console.error('❌ Failed to update password:', error.message)
      throw error
    }

    console.log('✅ Password updated successfully')
    console.log(`   User ID: ${existingUser.id}`)
    console.log(`   Email: ${TEST_USER_EMAIL}`)
    console.log(`   Password length: ${TEST_USER_PASSWORD.length} characters`)
  } catch (error: any) {
    console.error('❌ Failed to reset password:', error.message)
    process.exit(1)
  }
}

// Run the reset
resetE2EPassword()
  .then(() => {
    console.log('\n✅ Password reset completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Password reset failed:', error)
    process.exit(1)
  })
