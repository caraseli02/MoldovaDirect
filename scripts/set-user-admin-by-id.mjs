#!/usr/bin/env node

/**
 * Set User Admin Role by ID
 *
 * Grants admin role to a specific user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const USER_ID = 'b69ce217-8267-43fb-8583-97268be0d920' // teste2e@example.com
const USER_EMAIL = 'teste2e@example.com'

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

async function setAdminRole() {
  console.log(`🔧 Setting admin role for user ${USER_EMAIL}`)
  console.log(`   User ID: ${USER_ID}\n`)

  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', USER_ID)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!existingProfile) {
      // Create profile with admin role
      console.log('   Profile does not exist. Creating new profile...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: USER_ID,
          name: 'Test E2E User',
          role: 'admin',
        })

      if (insertError) {
        throw insertError
      }

      console.log('✅ Profile created with admin role!')
    } else {
      // Update existing profile
      console.log(`   Profile exists. Current role: ${existingProfile.role}`)

      if (existingProfile.role === 'admin') {
        console.log('✅ User already has admin role!')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', USER_ID)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Profile updated to admin role!')
    }

    // Verify the final state
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', USER_ID)
      .single()

    if (verifyError) {
      throw verifyError
    }

    console.log('\n✨ Admin role successfully set!')
    console.log(`   User: ${USER_EMAIL}`)
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
setAdminRole().catch(console.error)
