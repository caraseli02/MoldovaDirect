# Common Testing Patterns for Vue/Nuxt

## Query Patterns with Vue Test Utils

### Finding Elements

```typescript
// By data-testid (preferred for test-specific selectors)
wrapper.find('[data-testid="submit-button"]')

// By CSS selector
wrapper.find('.product-card')
wrapper.find('#main-content')

// By component
wrapper.findComponent(ProductCard)
wrapper.findAllComponents(ProductCard)

// By element type
wrapper.find('button')
wrapper.findAll('li')

// By attribute
wrapper.find('[disabled]')
wrapper.find('[aria-label="Close"]')
```

### Checking Existence

```typescript
// Element exists
expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

// Element doesn't exist
expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)

// Component exists
expect(wrapper.findComponent(Modal).exists()).toBe(true)
```

### Getting Text Content

```typescript
// Get all text
expect(wrapper.text()).toContain('Welcome')

// Get specific element text
expect(wrapper.find('h1').text()).toBe('Product List')

// Check HTML content
expect(wrapper.html()).toContain('<span class="badge">')
```

## Event Handling Patterns

### Triggering Events

```typescript
// Click
await wrapper.find('button').trigger('click')

// Input change
await wrapper.find('input').setValue('new value')

// Select change
await wrapper.find('select').setValue('option-2')

// Checkbox/Radio
await wrapper.find('input[type="checkbox"]').setValue(true)

// Form submit
await wrapper.find('form').trigger('submit')

// Keyboard events
await wrapper.find('input').trigger('keydown', { key: 'Enter' })
await wrapper.find('input').trigger('keyup.escape')

// Custom events
await wrapper.find('.draggable').trigger('dragstart')
```

### Testing Emitted Events

```typescript
it('should emit click event', async () => {
  const wrapper = mount(Button)
  
  await wrapper.trigger('click')
  
  expect(wrapper.emitted('click')).toBeTruthy()
  expect(wrapper.emitted('click')).toHaveLength(1)
})

it('should emit with payload', async () => {
  const wrapper = mount(ProductCard, {
    props: { product: { id: '1', name: 'Wine' } },
  })
  
  await wrapper.find('button').trigger('click')
  
  expect(wrapper.emitted('select')).toBeTruthy()
  expect(wrapper.emitted('select')![0]).toEqual([{ id: '1', name: 'Wine' }])
})

it('should emit update:modelValue for v-model', async () => {
  const wrapper = mount(TextInput, {
    props: { modelValue: '' },
  })
  
  await wrapper.find('input').setValue('new text')
  
  expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new text'])
})
```

## Component Mounting Patterns

### mount vs shallowMount

Vue Test Utils provides two mounting methods:

| Method | Behavior | Use When |
|--------|----------|----------|
| `mount()` | Renders full component tree | Testing component integration, slot behavior |
| `shallowMount()` | Stubs child components | Isolating component logic, faster tests |

```typescript
import { mount, shallowMount } from '@vue/test-utils'

// mount() - Full render (children are real components)
const wrapper = mount(ParentComponent)

// shallowMount() - Children are stubbed
const shallow = shallowMount(ParentComponent)
// Child components become stubs like <child-component-stub />
```

### When to Use shallowMount

```typescript
// ✅ Good: Testing ParentComponent in isolation
const wrapper = shallowMount(ParentComponent, {
  props: { items: mockItems },
})

// Verify parent logic without worrying about child behavior
expect(wrapper.vm.computedProperty).toBe(expectedValue)
```

### When to Use mount

```typescript
// ✅ Good: Testing slot content renders correctly
const wrapper = mount(Card, {
  slots: {
    default: '<p>Card content</p>',
  },
})

expect(wrapper.html()).toContain('<p>Card content</p>')

// ✅ Good: Testing component integration
const wrapper = mount(ProductList, {
  props: { products: mockProducts },
})

// Verify child ProductCard components render
expect(wrapper.findAllComponents(ProductCard)).toHaveLength(3)
```

### Selective Stubbing with mount

```typescript
// Best of both: mount with specific stubs
const wrapper = mount(ComplexComponent, {
  global: {
    stubs: {
      HeavyChart: true,        // Stub this one (expensive to render)
      // Other children render normally
    },
  },
})
```

### Basic Mount

```typescript
const wrapper = mount(Component)
```

### With Props

```typescript
const wrapper = mount(ProductCard, {
  props: {
    product: { id: '1', name: 'Wine', price: 15 },
    showActions: true,
  },
})
```

### With Slots

```typescript
const wrapper = mount(Card, {
  slots: {
    default: '<p>Card content</p>',
    header: '<h2>Card Title</h2>',
    footer: FooterComponent,
  },
})
```

### With Provide/Inject

```typescript
const wrapper = mount(ChildComponent, {
  global: {
    provide: {
      theme: 'dark',
      user: { id: '1', name: 'Test User' },
    },
  },
})
```

### With Stubs

```typescript
const wrapper = mount(ParentComponent, {
  global: {
    stubs: {
      // Stub as simple element
      HeavyComponent: true,
      
      // Stub with custom template
      ComplexModal: {
        template: '<div data-testid="modal-stub"><slot /></div>',
      },
      
      // Stub specific component
      'router-link': {
        template: '<a><slot /></a>',
      },
    },
  },
})
```

### With Plugins

```typescript
import { createTestingPinia } from '@pinia/testing'

const wrapper = mount(Component, {
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          products: { products: [] },
        },
      }),
    ],
  },
})
```

### With Directives

```typescript
const wrapper = mount(Component, {
  global: {
    directives: {
      focus: {
        mounted(el) {
          el.focus()
        },
      },
    },
  },
})
```

## State Testing Patterns

### Testing Reactive Data

```typescript
it('should toggle visibility', async () => {
  const wrapper = mount(Accordion)
  
  // Initially closed
  expect(wrapper.find('.content').isVisible()).toBe(false)
  
  // Open
  await wrapper.find('.toggle').trigger('click')
  expect(wrapper.find('.content').isVisible()).toBe(true)
  
  // Close
  await wrapper.find('.toggle').trigger('click')
  expect(wrapper.find('.content').isVisible()).toBe(false)
})
```

### Testing v-model

```typescript
it('should work with v-model', async () => {
  const wrapper = mount(TextInput, {
    props: {
      modelValue: 'initial',
      'onUpdate:modelValue': (value: string) => {
        wrapper.setProps({ modelValue: value })
      },
    },
  })
  
  expect(wrapper.find('input').element.value).toBe('initial')
  
  await wrapper.find('input').setValue('updated')
  
  expect(wrapper.props('modelValue')).toBe('updated')
})
```

### Testing Computed Properties

```typescript
it('should compute full name', async () => {
  const wrapper = mount(UserProfile, {
    props: { firstName: 'John', lastName: 'Doe' },
  })
  
  expect(wrapper.text()).toContain('John Doe')
  
  await wrapper.setProps({ firstName: 'Jane' })
  
  expect(wrapper.text()).toContain('Jane Doe')
})
```

## Conditional Rendering Testing

```typescript
describe('ConditionalComponent', () => {
  it('should show loading state', () => {
    const wrapper = mount(DataDisplay, {
      props: { loading: true, data: null },
    })
    
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="data"]').exists()).toBe(false)
  })

  it('should show error state', () => {
    const wrapper = mount(DataDisplay, {
      props: { loading: false, error: 'Failed to load' },
    })
    
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load')
  })

  it('should show data when loaded', () => {
    const wrapper = mount(DataDisplay, {
      props: { loading: false, data: { name: 'Test' } },
    })
    
    expect(wrapper.find('[data-testid="data"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test')
  })

  it('should show empty state', () => {
    const wrapper = mount(DataDisplay, {
      props: { loading: false, data: [] },
    })
    
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })
})
```

## List Rendering Testing

```typescript
describe('ProductList', () => {
  const products = [
    { id: '1', name: 'Wine' },
    { id: '2', name: 'Cheese' },
    { id: '3', name: 'Bread' },
  ]

  it('should render all items', () => {
    const wrapper = mount(ProductList, {
      props: { products },
    })
    
    expect(wrapper.findAll('.product-item')).toHaveLength(3)
  })

  it('should render item content correctly', () => {
    const wrapper = mount(ProductList, {
      props: { products },
    })
    
    const items = wrapper.findAll('.product-item')
    expect(items[0].text()).toContain('Wine')
    expect(items[1].text()).toContain('Cheese')
    expect(items[2].text()).toContain('Bread')
  })

  it('should handle item click', async () => {
    const wrapper = mount(ProductList, {
      props: { products },
    })
    
    await wrapper.findAll('.product-item')[1].trigger('click')
    
    expect(wrapper.emitted('select')![0]).toEqual([products[1]])
  })
})
```

## Form Testing Patterns

```typescript
describe('ContactForm', () => {
  it('should submit valid form', async () => {
    const wrapper = mount(ContactForm)
    
    await wrapper.find('input[name="name"]').setValue('John Doe')
    await wrapper.find('input[name="email"]').setValue('john@example.com')
    await wrapper.find('textarea[name="message"]').setValue('Hello!')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([{
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello!',
    }])
  })

  it('should show validation errors', async () => {
    const wrapper = mount(ContactForm)
    
    // Submit empty form
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="email-error"]').exists()).toBe(true)
  })

  it('should validate email format', async () => {
    const wrapper = mount(ContactForm)
    
    await wrapper.find('input[name="email"]').setValue('invalid-email')
    await wrapper.find('input[name="email"]').trigger('blur')
    
    expect(wrapper.find('[data-testid="email-error"]').text()).toContain('Invalid email')
  })

  it('should disable submit while submitting', async () => {
    const wrapper = mount(ContactForm)
    
    await wrapper.find('input[name="name"]').setValue('John')
    await wrapper.find('input[name="email"]').setValue('john@example.com')
    
    // Mock async submission
    const submitPromise = wrapper.find('form').trigger('submit')
    
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    
    await submitPromise
  })
})
```

## Data-Driven Tests

```typescript
describe('StatusBadge', () => {
  test.each([
    ['pending', 'bg-yellow-500', 'Pending'],
    ['active', 'bg-green-500', 'Active'],
    ['completed', 'bg-blue-500', 'Completed'],
    ['cancelled', 'bg-red-500', 'Cancelled'],
  ])('should render %s status correctly', (status, expectedClass, expectedText) => {
    const wrapper = mount(StatusBadge, {
      props: { status },
    })
    
    expect(wrapper.classes()).toContain(expectedClass)
    expect(wrapper.text()).toBe(expectedText)
  })
})

describe('formatPrice', () => {
  test.each([
    [0, '$0.00'],
    [9.99, '$9.99'],
    [100, '$100.00'],
    [1234.5, '$1,234.50'],
  ])('should format %s as %s', (input, expected) => {
    expect(formatPrice(input)).toBe(expected)
  })
})
```

## Testing with nextTick

```typescript
import { nextTick } from 'vue'

it('should update after state change', async () => {
  const wrapper = mount(Counter)
  
  wrapper.vm.count = 5
  await nextTick()
  
  expect(wrapper.text()).toContain('5')
})
```

## Debugging Tips

```typescript
// Print component HTML
console.log(wrapper.html())

// Print element HTML
console.log(wrapper.find('button').html())

// Print emitted events
console.log(wrapper.emitted())

// Access component instance
console.log(wrapper.vm.someData)
console.log(wrapper.vm.someMethod())

// Check props
console.log(wrapper.props())

// Check attributes
console.log(wrapper.find('button').attributes())
```

## Common Mistakes to Avoid

### ❌ Don't: Test Implementation Details

```typescript
// Bad - accessing internal state
expect(wrapper.vm.isOpen).toBe(true)

// Good - test observable behavior
expect(wrapper.find('.modal').isVisible()).toBe(true)
```

### ❌ Don't: Forget to Await

```typescript
// Bad - might cause flaky tests
wrapper.find('button').trigger('click')
expect(wrapper.emitted('click')).toBeTruthy()

// Good - await the trigger
await wrapper.find('button').trigger('click')
expect(wrapper.emitted('click')).toBeTruthy()
```

### ❌ Don't: Use Exact Text Matching

```typescript
// Bad - brittle to text changes
expect(wrapper.text()).toBe('Submit Form')

// Good - use contains or regex
expect(wrapper.text()).toContain('Submit')
expect(wrapper.text()).toMatch(/submit/i)
```

### ❌ Don't: Forget to Reset State

```typescript
// Bad - state leaks between tests
describe('Component', () => {
  const wrapper = mount(Component) // Shared!
  
  it('test 1', () => { /* ... */ })
  it('test 2', () => { /* ... */ }) // May fail due to state from test 1
})

// Good - fresh wrapper per test
describe('Component', () => {
  it('test 1', () => {
    const wrapper = mount(Component)
    // ...
  })
  
  it('test 2', () => {
    const wrapper = mount(Component)
    // ...
  })
})
```
