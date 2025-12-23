#!/usr/bin/env node

/**
 * Test Admin Login
 *
 * Tests if admin credentials can log in successfully
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@moldovadirect.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase configuration')
  process.exit(1)
}

if (!ADMIN_PASSWORD) {
  console.error('❌ Error: TEST_ADMIN_PASSWORD not set')
  process.exit(1)
}

// Create Supabase client (using anon key like the app does)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testLogin() {
  console.log(`🔐 Testing admin login for ${ADMIN_EMAIL}`)
  console.log(`   Password length: ${ADMIN_PASSWORD.length} characters`)
  console.log(`   Password: ${ADMIN_PASSWORD}\n`)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (error) {
      console.error(`❌ Login failed: ${error.message}`)
      process.exit(1)
    }

    if (!data.user) {
      console.error('❌ Login returned no user data')
      process.exit(1)
    }

    console.log('✅ Login successful!')
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)
    console.log(`   Session: ${data.session ? 'Yes' : 'No'}`)

    // Check profile role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error(`⚠️  Could not fetch profile: ${profileError.message}`)
    } else {
      console.log(`\n✨ Profile data:`)
      console.log(`   Name: ${profile.name}`)
      console.log(`   Role: ${profile.role}`)
    }

  } catch (error) {
    console.error(`❌ Unexpected error:`, error.message)
    process.exit(1)
  }
}

// Run the test
testLogin().catch(console.error)
