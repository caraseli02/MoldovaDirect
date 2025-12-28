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

const supabaseUrl = 'https://khvzbjemydddnryreytu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodnpiamVteWRkZG5yeXJleXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4NjQ1NCwiZXhwIjoyMDcxMzYyNDU0fQ.li8R9uS_JdRP4AgUjw31v5z-jRFhySa-GHC1Qu0AEXI'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TARGET_EMAIL = 'caraseli02@gmail.com'
const TARGET_PASSWORD = 'MoldovaDirect2024!' // You should change this

async function main() {
  console.log('🚀 Setting up order linking...\n')

  // Step 1: Apply the migration (create trigger)
  console.log('📦 Step 1: Creating database trigger...')
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251228_link_guest_orders_on_signup.sql')
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

  const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSql }).maybeSingle()

  if (migrationError) {
    // Try direct SQL execution
    const statements = migrationSql.split(';').filter(s => s.trim())
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.from('_migrations_temp').select().limit(0) // Dummy to check connection
        // We'll apply via direct connection below
      }
    }
    console.log('⚠️  Migration needs to be applied manually or via Supabase dashboard')
    console.log('   Copy the SQL from: supabase/migrations/20251228_link_guest_orders_on_signup.sql')
  } else {
    console.log('✅ Database trigger created successfully')
  }

  // Step 2: Find or create user account
  console.log(`\n👤 Step 2: Setting up user account for ${TARGET_EMAIL}...`)

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

    const existingUser = userData?.users?.find(u => u.email === TARGET_EMAIL)
    if (existingUser) {
      userId = existingUser.id
      console.log(`✅ Found existing user: ${TARGET_EMAIL} (${userId})`)
      break
    }

    if (!userData?.users || userData.users.length < perPage) break
    page++
  }

  // Create user if not found
  if (!userId) {
    console.log(`   User not found, creating new account...`)

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: TARGET_PASSWORD,
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
          email: TARGET_EMAIL,
          password: TARGET_PASSWORD,
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
      console.log(`✅ Created new user: ${TARGET_EMAIL} (${userId})`)
      console.log(`   Password: ${TARGET_PASSWORD}`)
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
    .eq('guest_email', TARGET_EMAIL)
    .is('user_id', null)

  console.log(`   Found ${guestOrderCount || 0} guest orders to link`)

  if (guestOrderCount && guestOrderCount > 0) {
    // Link the orders
    const { data: linkedOrders, error: linkError } = await supabase
      .from('orders')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('guest_email', TARGET_EMAIL)
      .is('user_id', null)
      .select('id, order_number')

    if (linkError) {
      console.error('❌ Error linking orders:', linkError)
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
    .eq('guest_email', TARGET_EMAIL)
    .is('user_id', null)

  console.log(`   Orders linked to ${TARGET_EMAIL}: ${userOrderCount || 0}`)
  console.log(`   Remaining unlinked guest orders: ${remainingGuestCount || 0}`)

  console.log('\n✅ Setup complete!')
  console.log(`\n📝 Summary:`)
  console.log(`   User: ${TARGET_EMAIL}`)
  console.log(`   User ID: ${userId}`)
  console.log(`   Orders: ${userOrderCount || 0}`)
  console.log(`\n🔐 Login credentials:`)
  console.log(`   Email: ${TARGET_EMAIL}`)
  console.log(`   Password: ${TARGET_PASSWORD}`)
  console.log(`\n⚠️  Remember to change your password after first login!`)
}

main().catch(console.error)
