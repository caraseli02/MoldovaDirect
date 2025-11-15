#!/usr/bin/env node

/**
 * Create E2E Test User
 *
 * This script creates a test user for E2E tests using credentials from .env
 *
 * Usage:
 *   node scripts/create-e2e-test-user.mjs
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY - Your Supabase service role key
 *   TEST_USER_EMAIL - Email for test user
 *   TEST_USER_PASSWORD - Password for test user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file')
  process.exit(1)
}

if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
  console.error('❌ Error: Missing test user credentials')
  console.error('Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Create test user
 */
async function createTestUser() {
  console.log(`\n📧 Creating E2E test user: ${TEST_USER_EMAIL}`)

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === TEST_USER_EMAIL)

    if (existingUser) {
      console.log('ℹ️  User already exists, deleting and recreating...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)
      if (deleteError) {
        console.error('⚠️  Warning: Could not delete existing user:', deleteError.message)
      }
    }

    // Create the user via Supabase Auth Admin API
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true, // Auto-confirm email for E2E tests
      user_metadata: {
        full_name: 'E2E Test User',
        preferred_language: 'es'
      }
    })

    if (signUpError) {
      throw signUpError
    }

    if (!user || !user.user) {
      throw new Error('User creation succeeded but no user data returned')
    }

    console.log('✅ E2E test user created successfully!')
    console.log(`   User ID: ${user.user.id}`)
    console.log(`   Email: ${user.user.email}`)
    console.log(`   Email Confirmed: ${user.user.email_confirmed_at ? 'Yes' : 'No'}`)

    // Optionally create user profile if you have a profiles table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.user.id,
          email: TEST_USER_EMAIL,
          full_name: 'E2E Test User',
          role: 'user'
        })

      if (profileError && !profileError.message.includes('does not exist')) {
        console.log('ℹ️  Profile table update:', profileError.message)
      } else if (!profileError) {
        console.log('✅ User profile created')
      }
    } catch (profileErr) {
      // Profile table might not exist, that's okay
      console.log('ℹ️  Skipped profile creation (table may not exist)')
    }

    console.log('\n🎉 E2E test user is ready!')
    console.log('\nYou can now run E2E tests with:')
    console.log('  pnpm exec playwright test')

  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
    process.exit(1)
  }
}

// Run the script
createTestUser()
