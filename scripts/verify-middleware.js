#!/usr/bin/env node

/**
 * Simple verification script for middleware functionality
 * This script tests the middleware logic without requiring a full test environment
 */

import fs from 'fs'
import path from 'path'

console.log('🔐 Verifying Authentication Middleware Implementation...\n')

const middlewareFiles = [
  'middleware/auth.ts',
  'middleware/guest.ts', 
  'middleware/verified.ts'
]

console.log('📁 Checking middleware files...')
middlewareFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`❌ ${file} missing`)
  }
})

// Test 2: Check middleware is applied to pages
console.log('\n📄 Checking middleware application to pages...')

const pagesToCheck = [
  { file: 'pages/account/index.vue', middleware: 'auth' },
  { file: 'pages/cart.vue', middleware: 'auth' },
  { file: 'pages/admin/index.vue', middleware: 'auth' },
  { file: 'pages/auth/login.vue', middleware: 'guest' },
  { file: 'pages/auth/register.vue', middleware: 'guest' },
  { file: 'pages/auth/forgot-password.vue', middleware: 'guest' }
]

pagesToCheck.forEach(({ file, middleware }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8')
    if (content.includes(`middleware: '${middleware}'`)) {
      console.log(`✅ ${file} has ${middleware} middleware`)
    } else {
      console.log(`❌ ${file} missing ${middleware} middleware`)
    }
  } else {
    console.log(`⚠️  ${file} not found`)
  }
})

// Test 3: Check middleware content for key requirements
console.log('\n🔍 Checking middleware implementation details...')

const authContent = fs.existsSync('middleware/auth.ts') ? fs.readFileSync('middleware/auth.ts', 'utf8') : ''
const guestContent = fs.existsSync('middleware/guest.ts') ? fs.readFileSync('middleware/guest.ts', 'utf8') : ''

const requirements = [
  {
    name: 'Auth middleware redirects to login',
    check: authContent.includes('navigateTo') && authContent.includes('/auth/login'),
    file: 'auth.ts'
  },
  {
    name: 'Auth middleware preserves redirect parameter',
    check: authContent.includes('redirect:') && authContent.includes('fullPath'),
    file: 'auth.ts'
  },
  {
    name: 'Auth middleware handles email verification',
    check: authContent.includes('email_confirmed_at'),
    file: 'auth.ts'
  },
  {
    name: 'Guest middleware redirects authenticated users',
    check: guestContent.includes('navigateTo') && guestContent.includes('/account'),
    file: 'guest.ts'
  },
  {
    name: 'Guest middleware honors redirect parameter',
    check: guestContent.includes('redirect') && guestContent.includes('startsWith'),
    file: 'guest.ts'
  }
]

requirements.forEach(({ name, check, file }) => {
  if (check) {
    console.log(`✅ ${name} (${file})`)
  } else {
    console.log(`❌ ${name} (${file})`)
  }
})

// Test 4: Check test files exist
console.log('\n🧪 Checking test files...')

const testFiles = [
  'tests/unit/middleware-auth.test.ts',
  'tests/e2e/middleware-integration.spec.ts'
]

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`❌ ${file} missing`)
  }
})

console.log('\n✨ Middleware verification complete!')
console.log('\n📚 Next steps:')
console.log('1. Test the middleware by navigating to protected pages while logged out')
console.log('2. Verify redirect preservation by accessing /account while unauthenticated')
console.log('3. Test guest middleware by accessing /auth/login while authenticated')
console.log('4. Run the full test suite: npm run test')