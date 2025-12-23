#!/usr/bin/env node

/**
 * Fix Admin Role for Test User
 *
 * Ensures admin@moldovadirect.com has admin role for E2E tests
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@moldovadirect.com'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixAdminRole() {
  console.log(`🔧 Fixing admin role for ${ADMIN_EMAIL}\n`)

  try {
    // Get all users with pagination
    let allUsers = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      })

      if (listError) {
        throw listError
      }

      allUsers = allUsers.concat(users)
      hasMore = users.length === 1000
      page++
    }

    console.log(`📋 Found ${allUsers.length} total users`)

    const user = allUsers.find(u => u.email === ADMIN_EMAIL)

    if (!user) {
      console.error(`❌ User ${ADMIN_EMAIL} not found in database`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email}`)
    console.log(`   ID: ${user.id}\n`)

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!existingProfile) {
      // Create profile with admin role
      console.log('📝 Creating profile with admin role...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || 'Admin User',
          role: 'admin',
        })

      if (insertError) {
        throw insertError
      }

      console.log('✅ Profile created with admin role!')
    } else {
      // Update existing profile
      console.log(`📝 Current role: ${existingProfile.role}`)

      if (existingProfile.role === 'admin') {
        console.log('✅ User already has admin role!')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Profile updated to admin role!')
    }

    // Verify the final state
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single()

    if (verifyError) {
      throw verifyError
    }

    console.log('\n✨ Admin role successfully set!')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   ID: ${profile.id}`)
    console.log(`   Name: ${profile.name}`)
    console.log(`   Role: ${profile.role}`)

  } catch (error) {
    console.error(`❌ Error:`, error.message)
    if (error.details) console.error(`   Details:`, error.details)
    if (error.hint) console.error(`   Hint:`, error.hint)
    process.exit(1)
  }
}

// Run the script
fixAdminRole().catch(console.error)
