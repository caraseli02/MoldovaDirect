# Moldova Direct - Code Conventions

## TypeScript Standards

### Code Style
- Double quotes for strings
- Semicolons to terminate statements
- 2-space indentation
- Trailing commas in multi-line objects/arrays

### Type Definitions
- `interface` for extendable object types
- `type` for unions, intersections, computed types
- Explicit return types for public functions
- `unknown` instead of `any` when type is uncertain

```typescript
interface User {
  id: number;
  email: string;
  preferences: UserPreferences;
}

type Status = "pending" | "approved" | "rejected";

function getUser(id: number): Promise<User | null> {
  // implementation
}
```

### Import Conventions
- Named imports for utilities
- Default exports for Vue components
- Group imports: external → internal → types
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

### Component Structure Order
1. Type imports
2. Library imports (Vue, Nuxt)
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

// 9. Computed properties
const formattedPrice = computed(() => formatPrice(props.product.price));

// 10. Methods
const handleAddToCart = async () => {
  await addItem(props.product, quantity.value);
  emit("addToCart", props.product, quantity.value);
};

// 11. Lifecycle hooks
onMounted(() => {
  // initialization
});
</script>
```

### Template Conventions
- Semantic HTML elements
- `v-show` for frequently toggled elements
- `v-if` for conditional rendering
- `data-testid` attributes for testing
- Tailwind classes instead of inline styles

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

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (`ProductCard.vue`)
- **Pages**: kebab-case (`track-order.vue`)
- **API Routes**: RESTful with method suffix (`products.get.ts`)
- **Stores**: camelCase (`cart.ts`)
- **Composables**: camelCase with `use` prefix (`useCart.ts`)
- **Types**: PascalCase interfaces (`ProductWithRelations`)

### Code
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: Tailwind utilities
- **Database**: snake_case for tables/columns

## API Route Standards

### File Organization
```
server/api/
├── auth/              # Authentication endpoints
├── products/          # Product-related endpoints
├── categories/        # Category endpoints
├── admin/             # Admin-only endpoints
└── upload/            # File upload endpoints
```

### Route Naming
- `index.get.ts` → GET /api/resource
- `[id].get.ts` → GET /api/resource/:id
- `create.post.ts` → POST /api/resource
- `[id].patch.ts` → PATCH /api/resource/:id
- `[id].delete.ts` → DELETE /api/resource/:id

### Request Handling
```typescript
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

## Testing Standards

### Test Organization
- Group tests by feature/component
- Descriptive test names starting with "should"
- AAA pattern (Arrange, Act, Assert)
- Page Object Model for E2E

```typescript
test.describe("Shopping Cart", () => {
  test("should add product to cart and update count", async ({ page }) => {
    // Arrange
    await page.goto("/products/test-product");

    // Act
    await page.click('[data-testid="add-to-cart-btn"]');

    // Assert
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
  });
});
```

### Data Attributes
```vue
<!-- Use stable test selectors -->
<button data-testid="add-to-cart-btn">Add to Cart</button>
<div data-testid="cart-item" :data-product-id="product.id">
```

## Error Handling

### Client-Side
- Use composables for error state
- User-friendly messages
- Log errors for debugging
- Retry for network errors

### Server-Side
- Consistent error format
- Log with context
- Don't expose sensitive info
- Appropriate HTTP status codes

## Critical Rules

### Admin Panel
1. **Static imports only** - Dynamic imports cause 500 errors
2. **Both middlewares required** - `auth` and `admin`
3. **Clear cache after changes** - `rm -rf .nuxt node_modules/.vite`

### Internationalization
- All UI text must have translations in ALL 4 locales
- Use `$t('key')` in templates
- Use `t('key')` in script

### Git
- Never skip git hooks (`--no-verify`)
- Fix failing hooks instead of bypassing
- Descriptive commit messages
