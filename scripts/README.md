# Utility Scripts

This directory contains utility scripts for testing, validation, and maintenance tasks.

## Available Scripts

### Email Testing

#### `test-email-integration.js`
Tests the email notification system integration with Resend.

**Usage:**
```bash
node scripts/test-email-integration.js
```

**Requirements:**
- `RESEND_API_KEY` environment variable
- `FROM_EMAIL` environment variable
- Valid Resend account

**What it tests:**
- Email delivery through Resend API
- Template rendering
- Error handling
- Retry logic

---

### Order Testing

#### `test-order-creation.sh`
Shell script for testing order creation API endpoints.

**Usage:**
```bash
chmod +x scripts/test-order-creation.sh
./scripts/test-order-creation.sh
```

**Requirements:**
- Running development server (`npm run dev`)
- Valid Supabase credentials
- Test user account

**What it tests:**
- Order creation endpoint
- Order validation
- Database insertion
- Response formatting

---

### Translation Validation

#### `check-translations.js`
Validates translation files for completeness and consistency across all supported locales.

**Usage:**
```bash
node scripts/check-translations.js
```

**What it checks:**
- Missing translation keys
- Inconsistent key structures
- Empty translation values
- Locale file formatting

**Supported locales:**
- Spanish (es)
- English (en)
- Romanian (ro)
- Russian (ru)

---

## Adding New Scripts

When adding new utility scripts:

1. **Place in this directory** - Keep all utility scripts organized in `scripts/`
2. **Add documentation** - Update this README with usage instructions
3. **Use descriptive names** - Name scripts clearly (e.g., `test-feature-name.js`)
4. **Include comments** - Add inline comments explaining complex logic
5. **Handle errors** - Implement proper error handling and exit codes
6. **Check dependencies** - Document any required environment variables or packages

### Script Template

```javascript
#!/usr/bin/env node

/**
 * Script Name: test-feature.js
 * Purpose: Brief description of what this script does
 * Usage: node scripts/test-feature.js
 * Requirements: List any environment variables or dependencies
 */

// Import dependencies
import { config } from 'dotenv'

// Load environment variables
config()

// Main function
async function main() {
  try {
    console.log('Starting test...')
    
    // Your script logic here
    
    console.log('Test completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Test failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
```

---

## Best Practices

1. **Use environment variables** for sensitive data (API keys, credentials)
2. **Exit with proper codes** - 0 for success, non-zero for errors
3. **Log meaningful messages** - Help users understand what's happening
4. **Handle edge cases** - Consider what could go wrong
5. **Keep scripts focused** - One script, one purpose
6. **Test before committing** - Ensure scripts work as expected

---

## Related Documentation

- [Testing Guide](../tests/AUTH_TESTING_GUIDE.md) - E2E and unit testing
- [Deployment Guide](../.kiro/docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [Database Setup](../.kiro/docs/DATABASE_SETUP.md) - Database configuration

---

**Last Updated:** October 12, 2025
