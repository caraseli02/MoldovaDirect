#!/usr/bin/env node

/**
 * Admin Authentication Test Script
 *
 * Tests the complete admin authentication flow:
 * 1. Login with admin credentials
 * 2. Access admin dashboard
 * 3. Verify API endpoints return data (not 401)
 * 4. Check that Bearer token authentication works
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://khvzbjemydddnryreytu.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodnpiamVteWRkZG5yeXJleXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODY0NTQsImV4cCI6MjA3MTM2MjQ1NH0.5jdzsQZVS3uX-SNwifPpacoChG8F8NTQOrZk_NCj98g'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.TEST_USER_EMAIL || 'admin@moldovadirect.com'
const ADMIN_PASSWORD = process.env.TEST_USER_PASSWORD || 'Admin123!@#'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue')
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green')
}

function logError(message) {
  log(`  ❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'gray')
}

async function testAdminAuth() {
  log('\n═══════════════════════════════════════════════════════════', 'blue')
  log('          Admin Authentication Test Suite', 'blue')
  log('═══════════════════════════════════════════════════════════\n', 'blue')

  let testsPassed = 0
  let testsFailed = 0
  let session = null

  try {
    // Step 1: Initialize Supabase client
    logStep('1', 'Initializing Supabase client')
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    logSuccess('Supabase client initialized')
    logInfo(`URL: ${SUPABASE_URL}`)

    // Step 2: Login with admin credentials
    logStep('2', 'Logging in as admin user')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (authError) {
      logError(`Login failed: ${authError.message}`)
      logWarning('Make sure the admin user exists and password is correct')
      logInfo(`Email: ${ADMIN_EMAIL}`)
      testsFailed++
      return
    }

    if (!authData.session) {
      logError('Login succeeded but no session returned')
      testsFailed++
      return
    }

    session = authData.session
    logSuccess('Login successful')
    logInfo(`User: ${authData.user.email}`)
    logInfo(`Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
    testsPassed++

    // Step 3: Verify admin role in database
    logStep('3', 'Verifying admin role in database')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      logError(`Failed to fetch profile: ${profileError.message}`)
      logWarning('User may not have a profile in the profiles table')
      testsFailed++
    }
    else if (!profile) {
      logError('Profile not found')
      testsFailed++
    }
    else if (profile.role !== 'admin') {
      logError(`User has role '${profile.role}' but needs 'admin'`)
      logWarning('Run the SQL fix script to update the user role')
      testsFailed++
    }
    else {
      logSuccess('User has admin role')
      logInfo(`Name: ${profile.name || 'Not set'}`)
      logInfo(`Role: ${profile.role}`)
      testsPassed++
    }

    // Step 4: Test Bearer token authentication on API endpoints
    logStep('4', 'Testing Bearer token authentication on API endpoints')

    const endpoints = [
      { url: '/api/admin/dashboard/stats', name: 'Dashboard Stats' },
      { url: '/api/admin/dashboard/activity', name: 'Dashboard Activity' },
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            logError(`${endpoint.name}: 401 Unauthorized - Bearer token not accepted`)
            logInfo(`This means the server-side auth is not working correctly`)
            testsFailed++
          }
          else if (response.status === 403) {
            logError(`${endpoint.name}: 403 Forbidden - User doesn't have admin role`)
            testsFailed++
          }
          else {
            logError(`${endpoint.name}: ${response.status} ${response.statusText}`)
            testsFailed++
          }
        }
        else {
          const data = await response.json()
          if (data.success) {
            logSuccess(`${endpoint.name}: ✓ Request successful`)

            // Validate response structure
            if (endpoint.url.includes('stats')) {
              if (data.data && typeof data.data.totalUsers === 'number') {
                logInfo(`  Total Users: ${data.data.totalUsers}`)
                logInfo(`  Total Orders: ${data.data.totalOrders || 0}`)
                logInfo(`  Revenue: €${data.data.revenue || 0}`)
              }
            }
            else if (endpoint.url.includes('activity')) {
              if (Array.isArray(data.data)) {
                logInfo(`  Activities: ${data.data.length} items`)
              }
            }

            testsPassed++
          }
          else {
            logWarning(`${endpoint.name}: Response has success: false`)
            testsFailed++
          }
        }
      }
      catch (error) {
        logError(`${endpoint.name}: Network error - ${error.message}`)
        logInfo('Make sure the dev server is running on http://localhost:3000')
        testsFailed++
      }
    }

    // Step 5: Test session refresh
    logStep('5', 'Testing session refresh capability')
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      logError(`Session refresh failed: ${refreshError.message}`)
      testsFailed++
    }
    else if (!refreshData.session) {
      logError('Session refresh succeeded but no session returned')
      testsFailed++
    }
    else {
      logSuccess('Session refresh successful')
      logInfo(`New token expires: ${new Date(refreshData.session.expires_at * 1000).toLocaleString()}`)
      testsPassed++
    }

    // Step 6: Logout
    logStep('6', 'Testing logout')
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      logError(`Logout failed: ${signOutError.message}`)
      testsFailed++
    }
    else {
      logSuccess('Logout successful')
      testsPassed++
    }
  }
  catch (error) {
    logError(`Unexpected error: ${error.message}`)
    console.error(error)
    testsFailed++
  }

  // Print summary
  log('\n═══════════════════════════════════════════════════════════', 'blue')
  log('                     Test Summary', 'blue')
  log('═══════════════════════════════════════════════════════════', 'blue')

  const total = testsPassed + testsFailed
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0

  log(`\nTotal Tests: ${total}`, 'blue')
  log(`Passed: ${testsPassed}`, testsPassed > 0 ? 'green' : 'gray')
  log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'gray')
  log(`Pass Rate: ${passRate}%\n`, passRate >= 80 ? 'green' : 'red')

  if (testsFailed === 0) {
    log('🎉 All tests passed! Admin authentication is working correctly.\n', 'green')
  }
  else {
    log('⚠️  Some tests failed. Please review the errors above.\n', 'yellow')
  }

  log('═══════════════════════════════════════════════════════════\n', 'blue')

  process.exit(testsFailed > 0 ? 1 : 0)
}

// Run tests
testAdminAuth().catch((error) => {
  logError(`Fatal error: ${error.message}`)
  console.error(error)
  process.exit(1)
})
