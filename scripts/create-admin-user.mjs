#!/usr/bin/env node

/**
 * Create Admin/Manager Users via Supabase API
 *
 * This script creates users through Supabase's Auth API (the recommended way)
 * and then updates their profile role to admin or manager.
 *
 * Usage:
 *   node scripts/create-admin-user.mjs
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (from dashboard)
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nYou can find these in your Supabase dashboard:')
  console.error('1. Go to Settings > API')
  console.error('2. Copy your Project URL')
  console.error('3. Copy your service_role secret key (NOT the anon key!)')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Create a user and assign them a role
 */
async function createUser(email, password, name, role) {
  console.log(`\n📧 Creating user: ${email} with role: ${role}`)

  try {
    // Create the user via Supabase Auth Admin API
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name
      }
    })

    if (signUpError) {
      throw signUpError
    }

    if (!user || !user.user) {
      throw new Error('User creation returned no data')
    }

    console.log(`✅ User created with ID: ${user.user.id}`)

    // Wait a moment for the profile trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the user's profile role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.user.id)

    if (updateError) {
      console.error(`⚠️  Warning: User created but role update failed:`, updateError.message)
      console.error(`   You can manually update the role with this SQL:`)
      console.error(`   UPDATE profiles SET role = '${role}' WHERE id = '${user.user.id}';`)
      return
    }

    // Verify the role was set
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.user.id)
      .single()

    if (fetchError) {
      console.error(`⚠️  Warning: Could not verify role:`, fetchError.message)
      return
    }

    console.log(`✅ Successfully created ${role} user:`)
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${profile.name}`)
    console.log(`   Role: ${profile.role}`)
    console.log(`   Password: ${password}`)
    console.log(`   ⚠️  Change this password after first login!`)

  } catch (error) {
    if (error.message?.includes('already registered')) {
      console.error(`⚠️  User ${email} already exists`)
      console.log(`   To update their role, run this SQL:`)
      console.log(`   UPDATE profiles SET role = '${role}' WHERE id = (SELECT id FROM auth.users WHERE email = '${email}');`)
    } else {
      console.error(`❌ Error creating user:`, error.message)
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating admin and manager users...')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)

  // Create admin user
  await createUser(
    'admin@moldovadirect.com',
    'Admin123!@#',
    'Admin User',
    'admin'
  )

  // Create manager user
  await createUser(
    'manager@moldovadirect.com',
    'Manager123!@#',
    'Manager User',
    'manager'
  )

  // Create a test customer user
  await createUser(
    'customer@moldovadirect.com',
    'Customer123!@#',
    'Test Customer',
    'customer'
  )

  console.log('\n✨ Done! Remember to change the passwords after first login.')
  console.log('\n📋 Summary of created users:')
  console.log('   Admin:    admin@moldovadirect.com / Admin123!@#')
  console.log('   Manager:  manager@moldovadirect.com / Manager123!@#')
  console.log('   Customer: customer@moldovadirect.com / Customer123!@#')
}

// Run the script
main().catch(console.error)
