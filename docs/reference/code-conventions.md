# Code Conventions

This document defines naming conventions, file organization, and code style rules for the Moldova Direct project.

## Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **Files** | `kebab-case` | `product-list.vue`, `use-cart.ts` |
| **Components** | `PascalCase` | `ProductList`, `CartItem` |
| **Composables** | `camelCase` with `use` prefix | `useCart`, `useAuth` |
| **Types/Interfaces** | `PascalCase` | `Product`, `CartItem` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_ITEMS`, `API_URL` |

## TypeScript Standards

### Code Style
- Use **double quotes** for strings consistently
- Always use **semicolons** to terminate statements
- Use consistent indentation (2 spaces)
- Add trailing commas in multi-line objects and arrays

### Type Definitions
- Use `interface` for object types that may be extended
- Use `type` for unions, intersections, and computed types
- Prefer explicit return types for public functions
- Use `unknown` instead of `any` when type is uncertain

```typescript
// Preferred - Note the consistent use of double quotes and semicolons
interface User {
  id: number;
  email: string;
  preferences: UserPreferences;
}

type Status = "pending" | "approved" | "rejected";

// Function with explicit return type
function getUser(id: number): Promise<User | null> {
  // implementation
}
```

### Import/Export Conventions
- Use named imports for utilities and specific functions
- Use default exports for Vue components and main module exports
- Group imports: external libraries first, then internal modules
- Use `import type` for type-only imports

```typescript
// External libraries
import { ref, computed } from "vue";
import { z } from "zod";

// Internal utilities
import { formatPrice } from "~/utils/currency";
import { useCart } from "~/composables/useCart";

// Type imports
import type { Product, CartItem } from "~/types";
```

## Vue Component Standards

### Component Structure
Follow this order in `<script setup>`:

1. Type imports
2. Library imports (Vue, Nuxt, etc.)
3. Component imports
4. Utility imports
5. Props definition
6. Emits definition
7. Composables
8. Reactive state
9. Computed properties
10. Methods/functions
11. Lifecycle hooks

```vue
<script setup lang="ts">
// 1. Type imports
import type { Product } from "~/types";

// 2. Library imports
import { ref, computed, onMounted } from "vue";

// 3. Component imports
import ProductCard from "~/components/ProductCard.vue";

// 4. Utility imports
import { formatPrice } from "~/utils/currency";

// 5. Props
interface Props {
  product: Product;
  showDetails?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
});

// 6. Emits
interface Emits {
  addToCart: [product: Product, quantity: number];
}
const emit = defineEmits<Emits>();

// 7. Composables
const { addItem } = useCart();

// 8. Reactive state
const quantity = ref(1);
const isLoading = ref(false);

// 9. Computed properties
const formattedPrice = computed(() => formatPrice(props.product.price));

// 10. Methods
const handleAddToCart = async () => {
  isLoading.value = true;
  await addItem(props.product, quantity.value);
  emit("addToCart", props.product, quantity.value);
  isLoading.value = false;
};

// 11. Lifecycle hooks
onMounted(() => {
  // initialization logic
});
</script>
```

### Props and Emits
- Always use TypeScript interfaces for props
- Provide default values for optional props using `withDefaults`
- Use descriptive emit names that indicate the action
- Include payload types in emit definitions

### Template Conventions
- Use semantic HTML elements
- Prefer `v-show` for frequently toggled elements
- Prefer `v-if` for conditional rendering
- Use `data-testid` attributes for testing selectors
- Avoid inline styles; use Tailwind classes

```vue
<template>
  <article class="product-card" data-testid="product-card">
    <header class="product-header">
      <h2 class="text-xl font-semibold">{{ product.name }}</h2>
    </header>
    
    <main class="product-content">
      <p v-if="showDescription" class="text-gray-600">
        {{ product.description }}
      </p>
    </main>
    
    <footer class="product-actions">
      <button 
        type="button"
        :disabled="isLoading"
        class="btn btn-primary"
        data-testid="add-to-cart-btn"
        @click="handleAddToCart"
      >
        {{ $t('products.addToCart') }}
      </button>
    </footer>
  </article>
</template>
```

## API Route Standards

### File Organization
- Group related endpoints in folders
- Use HTTP method suffixes in filenames
- Implement consistent error handling
- Use Zod for request validation

```typescript
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const productId = z.string().parse(id);
    
    const product = await getProductById(parseInt(productId));
    
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }
    
    return product;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid product ID",
      });
    }
    throw error;
  }
});
```

### Request/Response Patterns
- Validate input with Zod schemas
- Return consistent response formats
- Use appropriate HTTP status codes
- Include error details in development only

```typescript
// Response format
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiError {
  statusCode: number;
  statusMessage: string;
  details?: any; // Only in development
}
```

## Database Conventions

### Schema Design
- Use singular table names (`user`, `product`, not `users`, `products`)
- Primary keys should be `id` (integer, auto-increment)
- Foreign keys use descriptive names (`userId`, `categoryId`)
- Use `createdAt` and `updatedAt` for timestamps
- Use JSON columns for translations and flexible data

```typescript
// schema/products.ts
export const product = sqliteTable("product", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameTranslations: text("name_translations", { mode: "json" })
    .$type<Record<string, string>>()
    .notNull(),
  price: integer("price").notNull(), // Store as cents
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").references(() => category.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### Query Patterns
- Use Drizzle ORM for type safety
- Implement proper error handling
- Use transactions for related operations
- Index frequently queried columns

```typescript
// Good: Type-safe query with error handling
async function getProductWithCategory(productId: number): Promise<ProductWithCategory | null> {
  try {
    const result = await db
      .select()
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.id, productId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    return {
      ...result[0].product,
      category: result[0].category,
    };
  } catch (error) {
    console.error("Failed to get product:", error);
    throw new Error("Database query failed");
  }
}
```

## Testing Standards

### Test Organization
- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Use Page Object Model for E2E tests

```typescript
// tests/e2e/shopping-cart.spec.ts
test.describe("Shopping Cart", () => {
  test("should add product to cart and update count", async ({ page }) => {
    // Arrange
    await page.goto("/products/test-product");
    
    // Act
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Assert
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
    await expect(page.locator(".toast")).toContainText("Product added to cart");
  });
});
```

### Data Attributes
- Use `data-testid` for test selectors
- Make selectors stable and meaningful
- Avoid coupling tests to styling classes

```vue
<!-- Good: Stable test selectors -->
<button data-testid="add-to-cart-btn" class="btn btn-primary">
  Add to Cart
</button>

<div data-testid="cart-item" data-product-id="{{ product.id }}">
  <!-- cart item content -->
</div>
```

## Error Handling

### Client-Side Errors
- Use composables for error state management
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms for network errors

```typescript
// composables/useErrorHandler.ts
export const useErrorHandler = () => {
  const handleApiError = (error: any) => {
    if (error.statusCode >= 500) {
      // Server error - show generic message
      showToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } else if (error.statusCode >= 400) {
      // Client error - show specific message
      showToast({
        type: "error",
        message: error.statusMessage || "Invalid request",
      });
    }
    
    // Log for debugging
    console.error("API Error:", error);
  };
  
  return { handleApiError };
};
```

### Server-Side Errors
- Use consistent error response format
- Log errors with context
- Don't expose sensitive information
- Use appropriate HTTP status codes

```typescript
// server/utils/errorHandler.ts
export function handleDatabaseError(error: any) {
  console.error('Database error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error'
  })
}
```

## Performance Guidelines

### Component Performance
- Use `computed` for derived data
- Implement `v-memo` for expensive list items
- Lazy load heavy components
- Optimize image loading with Nuxt Image

```vue
<script setup>
// Use computed for expensive calculations
const expensiveCalculation = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// Memoize list items that don't change often
const memoizedItems = computed(() => {
  return props.items.map(item => ({
    ...item,
    formattedPrice: formatPrice(item.price)
  }))
})
</script>

<template>
  <!-- Use v-memo for expensive list rendering -->
  <div
    v-for="item in memoizedItems"
    v-memo="[item.id, item.quantity, item.price]"
    :key="item.id"
  >
    <!-- item content -->
  </div>
</template>
```

### API Performance
- Implement response caching
- Use database indexes
- Batch related queries
- Implement pagination for large datasets

```typescript
// Cache responses appropriately
export default defineEventHandler(async (event) => {
  // Cache product list for 5 minutes
  return await cachedFunction(async () => {
    return await getProducts()
  }, {
    maxAge: 300, // 5 minutes
    name: 'products-list'
  })()
})
```

## Security Guidelines

### Input Validation
- Validate all user inputs with Zod
- Sanitize data before database operations
- Use parameterized queries (Drizzle handles this)
- Validate file uploads

### Authentication
- Use JWT with appropriate expiration
- Implement refresh token rotation
- Store tokens securely (httpOnly cookies)
- Validate permissions on every request

### Data Protection
- Never log sensitive information
- Use environment variables for secrets
- Implement rate limiting
- Validate CORS settings

```typescript
// Secure JWT handling
export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => {
    const { accessToken, refreshToken } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    
    // Store refresh token in httpOnly cookie
    const refreshCookie = useCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    refreshCookie.value = refreshToken
    
    // Store access token in memory/state
    authStore.setAccessToken(accessToken)
  }
}
```
