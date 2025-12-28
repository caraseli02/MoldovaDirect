/**
 * Setup script for order linking
 * 1. Creates the database trigger to link guest orders on signup
 * 2. Creates/finds user account for caraseli02@gmail.com
 * 3. Links existing guest orders to the user account
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const TARGET_EMAIL = process.env.TARGET_EMAIL
const TARGET_PASSWORD = process.env.TARGET_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  if (!supabaseUrl) console.error('   - SUPABASE_URL')
  if (!supabaseServiceKey) console.error('   - SUPABASE_SERVICE_KEY')
  console.error('\nPlease set these environment variables before running the script.')
  console.error('Example: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx TARGET_EMAIL=user@example.com TARGET_PASSWORD=xxx npx tsx scripts/setup-order-linking.ts')
  process.exit(1)
}

if (!TARGET_EMAIL || !TARGET_PASSWORD) {
  console.error('❌ Missing target user credentials:')
  if (!TARGET_EMAIL) console.error('   - TARGET_EMAIL (email to link orders for)')
  if (!TARGET_PASSWORD) console.error('   - TARGET_PASSWORD (password for the account)')
  console.error('\nPlease set these environment variables before running the script.')
  process.exit(1)
}

// At this point, TypeScript knows these are defined
const targetEmail: string = TARGET_EMAIL
const targetPassword: string = TARGET_PASSWORD

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('🚀 Setting up order linking...\n')

  // Step 1: Apply the migration (create trigger)
  console.log('📦 Step 1: Creating database trigger...')
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251228_link_guest_orders_on_signup.sql')
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

  const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSql }).maybeSingle()

  if (migrationError) {
    console.log('⚠️  Could not apply migration automatically')
    console.log('   Error:', migrationError.message)
    console.log('')
    console.log('   This is expected - Supabase does not expose exec_sql via API.')
    console.log('   Please apply the migration manually:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Copy contents from: supabase/migrations/20251228_link_guest_orders_on_signup.sql')
    console.log('   3. Execute the SQL')
  } else {
    console.log('✅ Database trigger created successfully')
  }

  // Step 2: Find or create user account
  console.log(`\n👤 Step 2: Setting up user account for ${targetEmail}...`)

  // Search for existing user
  let userId: string | null = null
  let page = 1
  const perPage = 100

  while (!userId) {
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (userError) {
      console.error('❌ Error fetching users:', userError)
      break
    }

    const existingUser = userData?.users?.find(u => u.email === targetEmail)
    if (existingUser) {
      userId = existingUser.id
      console.log(`✅ Found existing user: ${targetEmail} (${userId})`)
      break
    }

    if (!userData?.users || userData.users.length < perPage) break
    page++
  }

  // Create user if not found
  if (!userId) {
    console.log(`   User not found, creating new account...`)

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Vladislav Caraseli',
        preferred_language: 'en',
      },
    })

    if (createError) {
      if (createError.message?.includes('already been registered')) {
        // User exists but wasn't in the list, try to sign in
        console.log('   User exists, attempting to find via sign-in...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: targetPassword,
        })

        if (signInError) {
          console.error('❌ Could not find or create user:', signInError.message)
          console.log('   Please create the user manually in Supabase dashboard')
        } else {
          userId = signInData.user?.id || null
          console.log(`✅ Found user via sign-in: ${userId}`)
        }
      } else {
        console.error('❌ Error creating user:', createError)
      }
    } else {
      userId = newUser.user?.id || null
      console.log(`✅ Created new user: ${targetEmail} (${userId})`)
      console.log(`   Password: ${targetPassword}`)
    }
  }

  if (!userId) {
    console.error('\n❌ Could not set up user account. Please create manually.')
    process.exit(1)
  }

  // Step 3: Count and link existing guest orders
  console.log(`\n📋 Step 3: Linking guest orders...`)

  // Count guest orders with this email
  const { count: guestOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('guest_email', targetEmail)
    .is('user_id', null)

  console.log(`   Found ${guestOrderCount || 0} guest orders to link`)

  if (guestOrderCount && guestOrderCount > 0) {
    // Link the orders
    const { data: linkedOrders, error: linkError } = await supabase
      .from('orders')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('guest_email', targetEmail)
      .is('user_id', null)
      .select('id, order_number')

    if (linkError) {
      console.error('❌ Error linking orders:', linkError)
      console.error('   Order linking failed. Please check database permissions and try again.')
    } else {
      console.log(`✅ Linked ${linkedOrders?.length || 0} orders to user account`)
      linkedOrders?.slice(0, 5).forEach(o => console.log(`   - ${o.order_number}`))
      if ((linkedOrders?.length || 0) > 5) {
        console.log(`   ... and ${(linkedOrders?.length || 0) - 5} more`)
      }
    }
  }

  // Step 4: Verify final state
  console.log(`\n📊 Step 4: Verifying setup...`)

  const { count: userOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: remainingGuestCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('guest_email', targetEmail)
    .is('user_id', null)

  console.log(`   Orders linked to ${targetEmail}: ${userOrderCount || 0}`)
  console.log(`   Remaining unlinked guest orders: ${remainingGuestCount || 0}`)

  console.log('\n✅ Setup complete!')
  console.log(`\n📝 Summary:`)
  console.log(`   User: ${targetEmail}`)
  console.log(`   User ID: ${userId}`)
  console.log(`   Orders: ${userOrderCount || 0}`)
  console.log(`\n🔐 Login credentials:`)
  console.log(`   Email: ${targetEmail}`)
  console.log(`   Password: ${targetPassword}`)
  console.log(`\n⚠️  Remember to change your password after first login!`)
}

main().catch((error) => {
  console.error('\n====================================')
  console.error('❌ SCRIPT FAILED')
  console.error('====================================')
  console.error('Error:', error.message || error)
  console.error('\nPossible causes:')
  console.error('- Invalid or missing Supabase credentials')
  console.error('- Network connectivity issues')
  console.error('- Target user credentials are incorrect')
  console.error('\nFor debugging, ensure all environment variables are set correctly.')
  process.exit(1)
})
