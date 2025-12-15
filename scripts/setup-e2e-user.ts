/**
 * E2E Test User Setup Script
 *
 * Creates or verifies the test user for E2E tests exists in Supabase
 * Uses credentials from .env: TEST_USER_EMAIL and TEST_USER_PASSWORD
 *
 * Usage: npx tsx scripts/setup-e2e-user.ts
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

async function setupE2EUser() {
  console.log('🔧 Setting up E2E test user...')
  console.log(`   Email: ${TEST_USER_EMAIL}`)

  try {
    let userId: string | null = null
    let userExists = false

    // Try to list existing users - paginate through all pages
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

      // Check if there are more pages
      hasMore = existingUsers?.users.length === 1000
      page++
    }

    console.log(`   Found ${allUsers.length} total users`)
    const existingUser = allUsers.find(u => u.email === TEST_USER_EMAIL)

    if (existingUser) {
      console.log('✓ Test user already exists')
      userId = existingUser.id
      userExists = true
      console.log(`   User ID: ${existingUser.id}`)
      console.log(`   Email confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`)
    } else {
      // Create new user
      console.log('📝 Creating new test user...')
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: 'E2E Test User',
          preferred_language: 'es',
        },
      })

      if (authError || !authData.user) {
        console.error('❌ Failed to create user:', authError?.message || 'Unknown error')
        throw authError
      }

      userId = authData.user.id
      console.log('✓ Auth user created')
      console.log(`   User ID: ${authData.user.id}`)
    }

    if (!userId) {
      throw new Error('Failed to get user ID')
    }

    // Verify or create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.log('   Creating profile...')
      const { error: createProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: 'E2E Test User',
          role: 'customer',
          preferred_language: 'es',
        })

      if (createProfileError) {
        console.error('❌ Failed to create profile:', createProfileError.message)
        throw createProfileError
      }
      console.log('   ✓ Profile created')
    } else {
      console.log(`   ✓ Profile exists (role: ${profile.role})`)
    }

    console.log('✅ E2E test user is ready')
    return userId
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupE2EUser()
  .then(() => {
    console.log('\n✅ E2E user setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ E2E user setup failed:', error)
    process.exit(1)
  })
