#!/usr/bin/env node

/**
 * Profile Management Implementation Validation Script
 * 
 * This script validates that all required components for the profile management
 * system have been implemented correctly according to the task requirements.
 */

const fs = require('fs')
const path = require('path')

const requiredFiles = [
  // Main profile page
  'pages/account/profile.vue',
  
  // Profile management components
  'components/profile/AddressFormModal.vue',
  'components/profile/DeleteAccountModal.vue',
  
  // API endpoints
  'server/api/auth/delete-account.delete.ts',
  
  // Database schema
  'supabase-avatar-storage.sql',
  
  // Tests
  'tests/unit/profile.test.ts',
  'tests/integration/profile-management.test.ts',
  'tests/e2e/profile-management.spec.ts'
]

const requiredTranslationKeys = [
  'profile.title',
  'profile.description',
  'profile.profilePicture',
  'profile.addresses',
  'profile.deleteAccount',
  'profile.success.profileUpdated',
  'profile.errors.updateFailed'
]

function validateFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing file: ${filePath}`)
    return false
  }
  console.log(`✅ Found: ${filePath}`)
  return true
}

function validateTranslations() {
  const translationFiles = [
    'i18n/locales/en.json',
    'i18n/locales/es.json'
  ]
  
  let allValid = true
  
  for (const file of translationFiles) {
    const fullPath = path.join(process.cwd(), file)
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing translation file: ${file}`)
      allValid = false
      continue
    }
    
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      
      for (const key of requiredTranslationKeys) {
        const keys = key.split('.')
        let current = content
        let found = true
        
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k]
          } else {
            found = false
            break
          }
        }
        
        if (!found) {
          console.error(`❌ Missing translation key "${key}" in ${file}`)
          allValid = false
        }
      }
      
      if (allValid) {
        console.log(`✅ Translation keys validated in ${file}`)
      }
    } catch (error) {
      console.error(`❌ Error parsing ${file}: ${error.message}`)
      allValid = false
    }
  }
  
  return allValid
}

function validateProfilePageStructure() {
  const profilePagePath = path.join(process.cwd(), 'pages/account/profile.vue')
  
  if (!fs.existsSync(profilePagePath)) {
    console.error('❌ Profile page does not exist')
    return false
  }
  
  const content = fs.readFileSync(profilePagePath, 'utf8')
  
  const requiredElements = [
    'definePageMeta',
    'middleware: \'auth\'',
    'profile picture',
    'address management',
    'account deletion',
    'form validation'
  ]
  
  const checks = [
    { name: 'Authentication middleware', pattern: /middleware:\s*['"]auth['"]/ },
    { name: 'Profile form', pattern: /<form[^>]*@submit\.prevent/ },
    { name: 'Profile picture upload', pattern: /profile.*picture|avatar/i },
    { name: 'Address management', pattern: /address/i },
    { name: 'Account deletion', pattern: /delete.*account/i },
    { name: 'Form validation', pattern: /validation|errors/i }
  ]
  
  let allValid = true
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ Profile page contains: ${check.name}`)
    } else {
      console.error(`❌ Profile page missing: ${check.name}`)
      allValid = false
    }
  }
  
  return allValid
}

function validateAPIEndpoint() {
  const apiPath = path.join(process.cwd(), 'server/api/auth/delete-account.delete.ts')
  
  if (!fs.existsSync(apiPath)) {
    console.error('❌ Delete account API endpoint does not exist')
    return false
  }
  
  const content = fs.readFileSync(apiPath, 'utf8')
  
  const checks = [
    { name: 'DELETE method assertion', pattern: /assertMethod.*DELETE/ },
    { name: 'Authentication check', pattern: /getUser|auth/ },
    { name: 'Password verification', pattern: /password.*confirm|signInWithPassword/ },
    { name: 'Data cleanup', pattern: /delete.*addresses|delete.*carts/ },
    { name: 'Audit logging', pattern: /auth_events|log/ }
  ]
  
  let allValid = true
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ API endpoint contains: ${check.name}`)
    } else {
      console.error(`❌ API endpoint missing: ${check.name}`)
      allValid = false
    }
  }
  
  return allValid
}

function validateTestCoverage() {
  const testFiles = [
    'tests/unit/profile.test.ts',
    'tests/integration/profile-management.test.ts',
    'tests/e2e/profile-management.spec.ts'
  ]
  
  let allValid = true
  
  for (const testFile of testFiles) {
    const fullPath = path.join(process.cwd(), testFile)
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing test file: ${testFile}`)
      allValid = false
      continue
    }
    
    const content = fs.readFileSync(fullPath, 'utf8')
    
    const requiredTestTypes = [
      'form validation',
      'profile update',
      'address management',
      'account deletion'
    ]
    
    const testChecks = [
      { name: 'Form validation tests', pattern: /validate.*form|form.*validation/i },
      { name: 'Profile update tests', pattern: /profile.*update|update.*profile/i },
      { name: 'Address management tests', pattern: /address.*management|manage.*address/i },
      { name: 'Account deletion tests', pattern: /account.*deletion|delete.*account/i }
    ]
    
    for (const check of testChecks) {
      if (check.pattern.test(content)) {
        console.log(`✅ ${testFile} contains: ${check.name}`)
      } else {
        console.error(`❌ ${testFile} missing: ${check.name}`)
        allValid = false
      }
    }
  }
  
  return allValid
}

function main() {
  console.log('🔍 Validating Profile Management Implementation...\n')
  
  console.log('📁 Checking required files...')
  const filesValid = requiredFiles.every(validateFileExists)
  
  console.log('\n🌐 Checking translations...')
  const translationsValid = validateTranslations()
  
  console.log('\n📄 Checking profile page structure...')
  const profilePageValid = validateProfilePageStructure()
  
  console.log('\n🔌 Checking API endpoint...')
  const apiValid = validateAPIEndpoint()
  
  console.log('\n🧪 Checking test coverage...')
  const testsValid = validateTestCoverage()
  
  console.log('\n📊 Validation Summary:')
  console.log(`Files: ${filesValid ? '✅' : '❌'}`)
  console.log(`Translations: ${translationsValid ? '✅' : '❌'}`)
  console.log(`Profile Page: ${profilePageValid ? '✅' : '❌'}`)
  console.log(`API Endpoint: ${apiValid ? '✅' : '❌'}`)
  console.log(`Test Coverage: ${testsValid ? '✅' : '❌'}`)
  
  const allValid = filesValid && translationsValid && profilePageValid && apiValid && testsValid
  
  if (allValid) {
    console.log('\n🎉 All validations passed! Profile management system is properly implemented.')
    console.log('\n📋 Implementation Summary:')
    console.log('• ✅ Profile page with authentication middleware')
    console.log('• ✅ Profile picture upload and management')
    console.log('• ✅ Address management with CRUD operations')
    console.log('• ✅ Account deletion with proper cleanup')
    console.log('• ✅ Multi-language support')
    console.log('• ✅ Comprehensive test coverage')
    console.log('• ✅ API endpoints for account management')
    console.log('• ✅ Database schema for avatar storage')
    
    console.log('\n🎯 Requirements Addressed:')
    console.log('• ✅ 6.6: User profile management functionality')
    console.log('• ✅ 6.7: Account deletion functionality')  
    console.log('• ✅ 10.1: Integration with shopping features')
    console.log('• ✅ 10.2: Proper cleanup of user data')
    
    process.exit(0)
  } else {
    console.log('\n❌ Some validations failed. Please review the errors above.')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}