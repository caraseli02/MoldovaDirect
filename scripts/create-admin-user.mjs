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
 *
 * Optional environment variables (for custom credentials):
 *   ADMIN_EMAIL - Email for admin user (default: admin@moldovadirect.com)
 *   ADMIN_PASSWORD - Password for admin user (default: auto-generated)
 *   MANAGER_EMAIL - Email for manager user (default: manager@moldovadirect.com)
 *   MANAGER_PASSWORD - Password for manager user (default: auto-generated)
 *   CUSTOMER_EMAIL - Email for test customer (default: customer@moldovadirect.com)
 *   CUSTOMER_PASSWORD - Password for test customer (default: auto-generated)
 */

import { createClient } from '@supabase/supabase-js'
import { generateSecurePassword } from './generateSecurePassword.mjs'

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
      console.error(`   UPDATE profiles SET role = $1 WHERE id = $2;`)
      console.error(`   -- Parameters: role='${role}', id='${user.user.id}'`)
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
      console.log(`   UPDATE profiles SET role = $1 WHERE id = (SELECT id FROM auth.users WHERE email = $2);`)
      console.log(`   -- Parameters: role='${role}', email='${email}'`)
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

  // Get credentials from environment or generate secure ones
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@moldovadirect.com'
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword(20)

  const managerEmail = process.env.MANAGER_EMAIL || 'manager@moldovadirect.com'
  const managerPassword = process.env.MANAGER_PASSWORD || generateSecurePassword(20)

  const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@moldovadirect.com'
  const customerPassword = process.env.CUSTOMER_PASSWORD || generateSecurePassword(20)

  console.log('\n⚠️  SECURITY NOTICE:')
  console.log('   Using auto-generated secure passwords.')
  console.log('   Save these credentials securely (e.g., in a password manager).\n')

  // Create admin user
  await createUser(adminEmail, adminPassword, 'Admin User', 'admin')

  // Create manager user
  await createUser(managerEmail, managerPassword, 'Manager User', 'manager')

  // Create a test customer user
  await createUser(customerEmail, customerPassword, 'Test Customer', 'customer')

  console.log('\n✨ Done! Remember to save these passwords securely.')
  console.log('\n📋 Summary of created users:')
  console.log(`   Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`   Manager:  ${managerEmail} / ${managerPassword}`)
  console.log(`   Customer: ${customerEmail} / ${customerPassword}`)
  console.log('\n🔐 IMPORTANT: Store these credentials in a secure password manager!')
  console.log('   These passwords will not be shown again.')
}

// Run the script
main().catch(console.error)
