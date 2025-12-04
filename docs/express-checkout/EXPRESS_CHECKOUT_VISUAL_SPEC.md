# Express Checkout - Visual Specifications

## UI/UX Design Specifications

---

## 1. Collapsible Step Summary Component

### States

#### State 1: Collapsed (Complete)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                                        Edit ⌄ ┃
┃     123 Main Street, Madrid                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Components:
- Green circle badge with white checkmark (✓)
- Bold title "Shipping Information"
- Gray summary text "123 Main Street, Madrid"
- Blue "Edit" link on right
- Down chevron (⌄) indicating collapsible
- Green border (#10b981)
```

#### State 2: Expanded (Complete)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                                             ⌃ ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃
┃  Delivery Address                                                       ┃
┃  John Doe                                                              ┃
┃  123 Main Street                                                       ┃
┃  Madrid, 28001                                                         ┃
┃  Spain                                                                 ┃
┃                                                                         ┃
┃  Shipping Method                                                        ┃
┃  Standard Shipping - €5.99                                             ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Components:
- Header same as collapsed
- Up chevron (⌃) indicating expanded
- Horizontal divider below header
- Content area with full details
- Padding: 16px (p-4)
```

#### State 3: Collapsed (Incomplete)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  1  Shipping Information                                             ⌄ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Components:
- Gray circle badge with step number (1)
- Gray border (#d1d5db)
- No "Edit" button (not complete)
- No summary text
```

---

## 2. Page Layouts

### Payment Page (with Shipping Summary)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT METHOD                                │
│                    Select your payment method                           │
└─────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                                        Edit ⌄ ┃ ← COLLAPSED
┃     123 Main Street, Madrid                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  2  Payment Method                                                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃ ← ACTIVE STEP
┃  ○ Credit Card                                                          ┃   (highlighted)
┃  ○ Cash on Delivery                                                     ┃
┃  ○ PayPal                                                              ┃
┃                                                                         ┃
┃  [Card details form...]                                                ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Cart               Continue to Review →                     │
└─────────────────────────────────────────────────────────────────────────┘

Visual Cues:
- Shipping summary: Green border, collapsed
- Payment form: Indigo border, light indigo background, expanded
```

### Review Page (with Shipping + Payment Summaries)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          REVIEW YOUR ORDER                              │
│                  Please review all details before placing order         │
└─────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                                        Edit ⌄ ┃ ← COLLAPSED
┃     123 Main Street, Madrid                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Payment Method                                              Edit ⌄ ┃ ← COLLAPSED
┃     Credit Card ending in 4242                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  3  Order Review                                                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                         ┃ ← ACTIVE STEP
┃  [Cart Items]                                                          ┃
┃  [Order Summary]                                                       ┃
┃  [Terms & Conditions]                                                  ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Payment              Place Order →                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Interaction Flows

### Flow 1: Edit Shipping from Payment Page

```
Step 1: User on Payment Page
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                  [Edit] ⌄         ┃
┃     123 Main Street, Madrid                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                              ↑
                                         User clicks

Step 2: Navigate to Shipping Page
→ navigateTo('/checkout?skipAutoRoute=true')

Result: User sees shipping form with pre-filled data
```

### Flow 2: Expand Summary to View Details

```
Step 1: Collapsed State
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                  Edit  [⌄]        ┃ ← Click anywhere
┃     123 Main Street, Madrid                                ┃    on header
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        Animation: 200ms ease-out
        Height: 0 → auto
        Opacity: 0 → 1

Step 2: Expanded State
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                       [⌃]         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                            ┃
┃  Delivery Address                                          ┃
┃  John Doe                                                  ┃
┃  123 Main Street                                           ┃
┃  Madrid, 28001                                             ┃
┃  Spain                                                     ┃
┃                                                            ┃
┃  Shipping Method                                           ┃
┃  Standard Shipping - €5.99                                 ┃
┃                                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 4. Color Palette

### Light Mode
```css
/* Completed Step */
--border-complete: #10b981 (green-500)
--badge-complete-bg: #10b981 (green-500)
--badge-complete-text: #ffffff (white)

/* Incomplete Step */
--border-incomplete: #d1d5db (gray-300)
--badge-incomplete-bg: #d1d5db (gray-300)
--badge-incomplete-text: #374151 (gray-700)

/* Active Step */
--border-active: #6366f1 (indigo-500)
--bg-active: rgba(99, 102, 241, 0.05) (indigo-50/30)

/* Text */
--text-title: #111827 (gray-900)
--text-summary: #6b7280 (gray-600)
--text-content: #374151 (gray-700)

/* Interactive */
--link-color: #6366f1 (indigo-600)
--link-hover: #4f46e5 (indigo-700)
```

### Dark Mode
```css
/* Completed Step */
--border-complete: #34d399 (green-400)
--badge-complete-bg: #34d399 (green-400)
--badge-complete-text: #064e3b (green-900)

/* Incomplete Step */
--border-incomplete: #4b5563 (gray-600)
--badge-incomplete-bg: #4b5563 (gray-600)
--badge-incomplete-text: #f3f4f6 (gray-100)

/* Active Step */
--border-active: #818cf8 (indigo-400)
--bg-active: rgba(129, 140, 248, 0.1) (indigo-900/10)

/* Text */
--text-title: #f9fafb (white)
--text-summary: #d1d5db (gray-300)
--text-content: #e5e7eb (gray-200)

/* Interactive */
--link-color: #818cf8 (indigo-400)
--link-hover: #6366f1 (indigo-500)
```

---

## 5. Typography

```css
/* Step Title */
.step-title {
  font-size: 1.125rem;      /* 18px */
  font-weight: 600;         /* semibold */
  line-height: 1.75rem;     /* 28px */
  letter-spacing: -0.01em;
}

/* Summary Text (collapsed) */
.summary-text {
  font-size: 0.875rem;      /* 14px */
  font-weight: 400;         /* normal */
  line-height: 1.25rem;     /* 20px */
  color: var(--text-summary);
}

/* Content Label */
.content-label {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;         /* medium */
  line-height: 1.25rem;     /* 20px */
  color: var(--text-content);
  margin-bottom: 0.25rem;   /* 4px */
}

/* Content Value */
.content-value {
  font-size: 0.875rem;      /* 14px */
  font-weight: 400;         /* normal */
  line-height: 1.25rem;     /* 20px */
  color: var(--text-summary);
}

/* Edit Button */
.edit-button {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;         /* medium */
  color: var(--link-color);
  text-decoration: none;
}

.edit-button:hover {
  color: var(--link-hover);
  text-decoration: underline;
}
```

---

## 6. Spacing & Layout

```css
/* Container */
.step-summary {
  margin-bottom: 1.5rem;    /* 24px */
  border-radius: 0.5rem;    /* 8px */
  border-width: 1px;
}

/* Header */
.step-header {
  padding: 1rem;            /* 16px */
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 150ms ease-in-out;
}

.step-header:hover {
  background-color: rgba(243, 244, 246, 0.5); /* gray-100/50 */
}

/* Badge */
.step-badge {
  width: 1.5rem;            /* 24px */
  height: 1.5rem;           /* 24px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.75rem;    /* 12px */
}

/* Content */
.step-content {
  padding: 1rem;            /* 16px */
  border-top: 1px solid var(--border-incomplete);
}

.content-section {
  margin-bottom: 0.75rem;   /* 12px */
}

.content-section:last-child {
  margin-bottom: 0;
}
```

---

## 7. Responsive Breakpoints

### Mobile (<640px)
```css
.step-summary {
  margin-left: 0.5rem;      /* 8px */
  margin-right: 0.5rem;     /* 8px */
}

.step-header {
  padding: 0.75rem;         /* 12px */
}

.step-content {
  padding: 0.75rem;         /* 12px */
}

.step-title {
  font-size: 1rem;          /* 16px */
}

.edit-button {
  font-size: 0.75rem;       /* 12px */
}
```

### Tablet (640px - 1024px)
```css
/* Same as desktop */
```

### Desktop (>1024px)
```css
.step-summary {
  max-width: 48rem;         /* 768px */
  margin-left: auto;
  margin-right: auto;
}
```

---

## 8. Animation Specifications

### Expand Animation
```css
@keyframes expand {
  from {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
  to {
    max-height: 100vh;
    opacity: 1;
    overflow: visible;
  }
}

.step-content.expanding {
  animation: expand 200ms ease-out forwards;
}
```

### Collapse Animation
```css
@keyframes collapse {
  from {
    max-height: 100vh;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
}

.step-content.collapsing {
  animation: collapse 200ms ease-in forwards;
}
```

### Chevron Rotation
```css
.chevron-icon {
  transition: transform 200ms ease-in-out;
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}
```

---

## 9. Accessibility

### ARIA Attributes
```html
<div
  class="step-summary"
  role="region"
  aria-labelledby="step-1-title"
>
  <button
    class="step-header"
    aria-expanded="false"
    aria-controls="step-1-content"
    @click="toggleExpanded"
  >
    <div class="flex items-center">
      <div class="step-badge" aria-hidden="true">
        <!-- Visual indicator only -->
      </div>
      <h3 id="step-1-title" class="step-title">
        Shipping Information
      </h3>
    </div>
    <div class="flex items-center gap-2">
      <button
        v-if="isComplete"
        @click.stop="handleEdit"
        aria-label="Edit shipping information"
      >
        Edit
      </button>
      <svg aria-hidden="true" class="chevron-icon">
        <!-- Chevron icon -->
      </svg>
    </div>
  </button>

  <div
    id="step-1-content"
    class="step-content"
    :hidden="!expanded"
  >
    <!-- Content -->
  </div>
</div>
```

### Keyboard Navigation
```
Tab       → Focus on header button
Enter     → Toggle expand/collapse
Tab       → Focus on Edit button (if visible)
Enter     → Navigate to edit page
Shift+Tab → Focus previous element
```

### Screen Reader Announcements
```
On Expand:  "Shipping information expanded"
On Collapse: "Shipping information collapsed"
On Complete: "Shipping information completed"
On Edit:     "Navigating to edit shipping information"
```

---

## 10. Loading States

### Initial Load (Skeleton)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ▢  ████████████████                                  ⌄   ┃ ← Pulsing
┃     ████████████                                          ┃    animation
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Animation: Pulse (1.5s infinite)
Background: Gray gradient moving left to right
```

### Expanding (Transition)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✓  Shipping Information                       ⌃          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  [Content fading in...]                                   ┃ ← 200ms
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Height: Animating from 0 to auto
Opacity: Animating from 0 to 1
```

---

## 11. Error States

### Validation Error in Collapsed Summary
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚠  Shipping Information                  Edit  ⌄         ┃ ← Warning badge
┃     Invalid postal code                                   ┃    (yellow)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Border: #f59e0b (amber-500)
Badge: Yellow triangle with exclamation mark
Auto-expand: Yes (show error details)
```

---

## 12. Mobile Optimizations

### Stacked Layout (Mobile)
```
┌────────────────────────────┐
│  ✓  Shipping               │
│     Edit ⌄                 │ ← Smaller padding
│  123 Main St, Madrid       │    Larger tap targets
└────────────────────────────┘

Tap target minimum: 44x44px
Spacing: 12px (reduced from 16px)
Font size: Slightly smaller
```

### Swipe Gestures (Optional Enhancement)
```
Swipe right → Expand summary
Swipe left  → Collapse summary
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Design Specification Complete
