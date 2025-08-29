# Authentication Testing Guide

This guide provides comprehensive information about the authentication test suite for Moldova Direct.

## Overview

The authentication test suite covers all aspects of the user authentication system, ensuring reliability, security, and user experience across all supported languages and devices.

## Test Structure

### Unit Tests (`tests/unit/`)

#### Core Authentication Tests
- **`auth-store.test.ts`** - Tests the Pinia authentication store
  - State management and reactivity
  - Authentication actions (login, register, logout)
  - Session management and token handling
  - Error handling and loading states
  - Profile management functionality

- **`auth-composables.test.ts`** - Tests authentication composables
  - `useAuthMessages` - Error and success message handling
  - `useAuthValidation` - Form validation logic
  - Multi-language message translation
  - Real-time validation feedback

- **`auth-components.test.ts`** - Tests Vue authentication components
  - `AuthErrorMessage` - Error display component
  - `AuthSuccessMessage` - Success message component
  - `AuthProgressIndicator` - Multi-step progress tracking
  - `PasswordStrengthMeter` - Password strength validation

- **`use-auth.test.ts`** - Tests the main authentication composable
  - Reactive state management
  - Route access control
  - User display functions
  - Session validation

#### Middleware Tests
- **`middleware-auth.test.ts`** - Tests authentication middleware logic
  - Route protection for authenticated users
  - Guest middleware for auth pages
  - Email verification requirements
  - Redirect preservation

#### Accessibility and Mobile Tests
- **`auth-mobile-accessibility.test.ts`** - Tests mobile experience
  - Touch target sizes (44px minimum)
  - Input attributes for mobile keyboards
  - Responsive design validation
  - Accessibility compliance

#### Translation Tests
- **`auth-translations.test.ts`** - Tests multi-language support
  - Translation key consistency across languages
  - Error message translations
  - Success message translations
  - Validation message translations
  - Button and label translations

### Integration Tests (`tests/integration/`)

#### Authentication Flows
- **`auth-flows.test.ts`** - Tests complete authentication workflows
  - Registration → Email verification → Login flow
  - Password reset workflow
  - Session management across browser tabs
  - Profile management integration
  - Error recovery scenarios

#### Shopping Platform Integration
- **`auth-shopping-integration.test.ts`** - Tests auth-shopping integration
  - Protected route access control
  - Cart persistence across authentication states
  - User-specific data loading
  - Multi-language preference handling
  - Session expiry during shopping

### E2E Tests (`tests/e2e/`)

#### Core Authentication E2E
- **`auth.spec.ts`** - Basic authentication flows
  - User registration and login
  - Form validation
  - Multi-language functionality
  - Session persistence

#### Mobile Responsive Tests
- **`auth-mobile-responsive.spec.ts`** - Mobile experience validation
  - Responsive layouts across viewports
  - Touch target accessibility
  - Mobile keyboard optimization
  - Form usability on mobile devices

#### Email Workflow Tests
- **`auth-email-workflows.spec.ts`** - Email-based workflows
  - Email verification process
  - Password reset workflow
  - Token validation and expiry
  - Security measures (token reuse prevention)

#### Accessibility Tests
- **`auth-accessibility.spec.ts`** - Comprehensive accessibility testing
  - WCAG 2.1 AA compliance
  - Screen reader compatibility
  - Keyboard navigation
  - Focus management
  - High contrast mode support

## Requirements Coverage

### User Registration (Requirements 1.1-1.10)
- ✅ Valid registration with email verification
- ✅ Password strength validation
- ✅ Terms acceptance requirement
- ✅ Email existence validation
- ✅ Form validation and error handling

### Email Verification (Requirements 2.1-2.10)
- ✅ Token validation and expiry
- ✅ Resend verification functionality
- ✅ Already verified account handling
- ✅ Invalid/expired token handling

### User Login (Requirements 3.1-3.11)
- ✅ Valid credential authentication
- ✅ Invalid credential handling
- ✅ Unverified email handling
- ✅ Account lockout after failed attempts
- ✅ Session token management

### Password Reset (Requirements 4.1-4.13)
- ✅ Reset request with email validation
- ✅ Token-based password reset
- ✅ Password strength validation
- ✅ Session invalidation after reset

### Session Management (Requirements 5.1-5.12)
- ✅ JWT token handling
- ✅ Automatic token refresh
- ✅ Cross-tab synchronization
- ✅ Secure logout with cleanup

### Multi-Language Support (Requirements 6.1-6.7)
- ✅ Translation consistency across languages
- ✅ Language preference storage
- ✅ Email notifications in user language

### Security (Requirements 7.1-7.12)
- ✅ Password encryption and validation
- ✅ Rate limiting and account protection
- ✅ Token security and validation
- ✅ Attack prevention measures

### Mobile Responsiveness (Requirements 8.1-8.8)
- ✅ Responsive layouts without horizontal scrolling
- ✅ Touch target size compliance (44px minimum)
- ✅ Mobile keyboard optimization
- ✅ Accessibility on mobile devices

### Error Handling (Requirements 9.1-9.2)
- ✅ User-friendly error messages
- ✅ Loading states and feedback
- ✅ Error recovery mechanisms

### Shopping Integration (Requirements 10.1-10.3)
- ✅ Protected route access control
- ✅ Redirect preservation
- ✅ Cart persistence across auth states

## Running Tests

### Individual Test Suites

```bash
# Unit tests only
npm run test:auth:unit

# Integration tests only
npm run test:auth:integration

# E2E tests only
npm run test:auth:e2e

# Specific test categories
npm run test:unit:auth
npm run test:e2e:auth-mobile
npm run test:e2e:auth-accessibility
npm run test:e2e:auth-workflows
```

### Comprehensive Test Suite

```bash
# Run all authentication tests with detailed reporting
npm run test:auth:comprehensive
```

This command runs:
1. All unit tests with coverage reporting
2. All integration tests
3. All E2E tests across multiple browsers
4. Generates comprehensive test report

### Coverage Reports

```bash
# Generate coverage report for authentication code
npm run test:unit:auth -- --coverage
```

Coverage thresholds:
- **Global**: 80% (branches, functions, lines, statements)
- **Critical components**: 90% (auth store, core composables)

## Test Configuration

### Vitest Configuration
- **Environment**: jsdom for DOM testing
- **Setup**: Global test utilities and mocks
- **Coverage**: v8 provider with HTML reports

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit
- **Viewports**: Mobile, tablet, desktop
- **Languages**: Spanish, English, Romanian, Russian

## Best Practices

### Writing Tests
1. **Follow AAA pattern**: Arrange, Act, Assert
2. **Use descriptive test names** that explain the scenario
3. **Mock external dependencies** (Supabase, navigation)
4. **Test error scenarios** as thoroughly as success cases
5. **Include accessibility checks** in component tests

### Test Data
- Use **deterministic test data** for consistent results
- **Clean up after tests** to prevent interference
- **Use factories** for creating test objects
- **Avoid hardcoded values** that might change

### Debugging Tests
1. **Use `test.only`** to focus on specific tests
2. **Add `console.log`** statements for debugging
3. **Use browser dev tools** for E2E test debugging
4. **Check test artifacts** (screenshots, videos) for failures

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests to main branch
- Pushes to main branch
- Nightly scheduled runs

### Test Reports
- **Unit test coverage** uploaded to Codecov
- **E2E test results** with screenshots/videos
- **Accessibility audit results**
- **Performance metrics** for auth flows

## Troubleshooting

### Common Issues

#### Test Timeouts
- Increase timeout for slow operations
- Check for infinite loops in reactive code
- Verify mock implementations

#### Flaky E2E Tests
- Add proper wait conditions
- Use data-testid attributes consistently
- Avoid timing-dependent assertions

#### Coverage Issues
- Ensure all code paths are tested
- Check for unreachable code
- Verify mock implementations don't skip coverage

### Getting Help
1. Check test logs for specific error messages
2. Review test artifacts (screenshots, videos)
3. Run tests locally to reproduce issues
4. Check for recent changes that might affect tests

## Maintenance

### Regular Tasks
- **Update test data** when requirements change
- **Review and update mocks** when APIs change
- **Add tests for new features** as they're developed
- **Refactor tests** to reduce duplication

### Performance Monitoring
- Monitor test execution times
- Optimize slow tests
- Balance test coverage with execution speed
- Regular cleanup of test artifacts

## Security Testing

### Authentication Security
- **Token validation** and expiry testing
- **Rate limiting** verification
- **Input sanitization** testing
- **Session security** validation

### Privacy Testing
- **PII handling** in error messages
- **User enumeration** prevention
- **Data persistence** across sessions
- **GDPR compliance** for user data

This comprehensive test suite ensures that the Moldova Direct authentication system is reliable, secure, and provides an excellent user experience across all supported languages and devices.