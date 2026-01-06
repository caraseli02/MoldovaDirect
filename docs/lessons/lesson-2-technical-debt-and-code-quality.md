# Lesson 2: Technical Debt and Code Quality

## Introduction

Welcome to lesson two of the Moldova Direct codebase review. In this lesson, we'll cover technical debt and code quality. We'll discuss large files that need refactoring, scattered concerns, and architecture improvements.

---

## Part 1: Understanding Technical Debt

Technical debt is like financial debt. When you take shortcuts in code, you're borrowing time now but paying interest later through harder maintenance, more bugs, and slower development.

Your codebase has moderate technical debt. It's not critical, but addressing it will make your team more productive.

---

## Part 2: Large Files Overview

The analysis found twenty-five files exceeding five hundred lines. Ten of these exceed eight hundred lines, which is critical.

Why does file size matter? Large files are harder to understand. They're harder to test. They often violate the single responsibility principle. And they create merge conflicts when multiple developers work on them.

---

## Part 3: Critical Files to Refactor

Let's discuss the most critical files, starting with the largest.

### Profile Page

The file pages slash account slash profile dot vue has one thousand three hundred fifty-nine lines. This single page handles profile information, avatar upload, address management, security settings, and account deletion.

To refactor this, extract each section into its own component. Create a ProfileInfo component, an AvatarUpload component, an AddressList component, a SecuritySettings component, and a DeleteAccount component. The main profile page should just orchestrate these components.

### Auth Store

The file stores slash auth slash index dot ts has one thousand two hundred forty-five lines. It handles authentication, sessions, multi-factor auth, account lockout, and test users.

This store is already partially modularized, but the main coordinator is still too large. Consider extracting MFA logic, lockout logic, and test user handling into separate composables.

### Cart Store

The file stores slash cart slash index dot ts has one thousand forty lines. However, this one is actually well-designed. It coordinates six separate sub-modules: core, persistence, validation, analytics, security, and advanced features.

The coordinator pattern is good, but you could simplify by removing some of the cross-module watchers.

### Hybrid Checkout Component

The file components slash checkout slash HybridCheckout dot vue has nine hundred ninety lines. This component handles guest checkout, authenticated checkout, and express checkout all in one file.

Extract three separate components: GuestCheckout, AuthenticatedCheckout, and ExpressCheckout. Create a parent component that switches between them based on user state.

### Product Detail Page

The file pages slash products slash slug dot vue has one thousand thirty-three lines. It handles product display, reviews, recommendations, and multiple tabs.

Extract ProductGallery, ProductInfo, ProductReviews, and ProductRecommendations as separate components.

---

## Part 4: Magic Numbers and Hardcoded Values

The analysis found magic numbers scattered throughout the codebase. Magic numbers are literal values without explanation.

For example, in checkout validation, you have fifty for maximum name length, one hundred for address length, and various timeout values like two thousand and five thousand milliseconds.

### How to Fix

Create a constants file. Make a file called constants slash validation dot ts. Export named constants like MAX_NAME_LENGTH equals fifty, MAX_ADDRESS_LENGTH equals one hundred.

Create another file constants slash timeouts dot ts for timeout values. Then replace all magic numbers with these named constants.

This makes the code self-documenting and changes easier to manage.

---

## Part 5: Console Logging

The audit found eight hundred fifty-seven console log statements in the codebase. While useful for debugging, these should not be in production code.

The biggest offenders are the test user dev tools plugin with thirty-eight console logs, checkout review composable with eight, and various product composables with six each.

### How to Fix

Nuxt includes Consola, a proper logging library. Replace console dot log calls with consola dot info or consola dot debug. In production, these can be configured to be silent or sent to a logging service.

Create a simple wrapper if needed. A useLogger composable that internally uses Consola but provides a consistent interface.

---

## Part 6: TODO Comments

The analysis found fifty-two TODO and FIXME comments. These represent acknowledged but unaddressed issues.

### Critical TODOs

Five TODOs in carrier tracking dot ts are for implementing DHL, FedEx, UPS, USPS, and Moldova Post integrations. These are feature gaps.

Seven TODOs in admin product endpoints show performed by null. This means admin actions aren't tracking which admin user performed them. This is a security and compliance concern.

Eight TODOs in E2E auth tests indicate known flaky tests. These undermine confidence in your test suite.

Four TODOs in composables indicate mock data that should be replaced with real API calls.

### How to Handle

Don't just leave TODOs indefinitely. Either fix them, create GitHub issues for tracking, or delete them if no longer relevant.

---

## Part 7: Scattered Validation Logic

Validation logic is spread across twelve or more files. You have checkout validation dot ts, auth validation composable, cart validation store, address validation in types, and inline validation in components.

### The Problem

When validation rules change, you have to update multiple files. It's easy to miss one. Inconsistencies creep in.

### The Solution

You already have Zod as a dependency. Create a centralized validation schema file. Define all your validation schemas in one place. Use these schemas throughout the application.

For example, create schemas slash user dot ts with a nameSchema, emailSchema, phoneSchema. Then use these in checkout, auth, and profile forms.

---

## Part 8: Email Template Duplication

The email template system has duplication issues. Order status templates is six hundred thirty-five lines. Support ticket templates is four hundred seventy-two lines. Order confirmation is four hundred eighteen lines.

These files share common elements: headers, footers, styling, and layout structure.

### How to Fix

Create a base email template function. Extract shared HTML structure. Create a helper that takes content and returns a complete email. Then each template only needs to define its unique content.

---

## Part 9: Missing Environment Example

The project has no dot env dot example file. This means new developers don't know what environment variables are required. It's also a security risk because someone might commit a real dot env file.

Create a dot env dot example file listing all required variables with placeholder values. Add comments explaining each variable's purpose. This is a quick win with high value.

---

## Part 10: Audit Log Gap

Seven admin API endpoints have performed by set to null. When admin actions happen, there's no record of which admin did them.

This is a compliance and security issue. If something goes wrong, you can't trace who made the change.

Fix this by passing the authenticated admin user ID to these endpoints. This is a small effort change with high security value.

---

## Part 11: Prioritized Refactoring Plan

Here's your prioritized plan for addressing technical debt.

### Week One

Create dot env dot example. Fix the performed by null audit log issue. Create the constants files for magic numbers.

### Week Two to Three

Split profile dot vue into sub-components. Split HybridCheckout into guest, auth, and express versions.

### Month One

Consolidate validation logic using Zod schemas. Replace console logs with proper logging. Address critical TODO comments.

### Ongoing

When you touch a large file, extract one component. When you add validation, use the centralized schemas. When you see a TODO, create an issue or fix it.

---

## Conclusion

That's the end of lesson two. Technical debt is manageable when addressed incrementally. The key files to refactor are profile dot vue, HybridCheckout dot vue, and the product detail page.

Quick wins include creating dot env dot example, fixing audit logs, and extracting constants.

In the next lesson, we'll cover testing and create a concrete action plan.
