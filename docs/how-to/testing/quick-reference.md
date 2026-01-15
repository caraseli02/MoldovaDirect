# Quick Reference: shadcn-vue Components Used

## Prerequisites

- [Add prerequisites here]

## Steps


## Import Patterns

### Select Component
```vue
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
</script>

<template>
  <Select v-model="value">
    <SelectTrigger>
      <SelectValue placeholder="Select option..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</template>
```

### Input Component
```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input'
</script>

<template>
  <Input
    v-model="value"
    type="text"
    placeholder="Enter text..."
  />
</template>
```

### Textarea Component
```vue
<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
</script>

<template>
  <Textarea
    v-model="value"
    placeholder="Enter notes..."
    rows="3"
  />
</template>
```

### Skeleton Component
```vue
<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Skeleton class="h-4 w-full" />
  <Skeleton class="h-3 w-3/4" />
</template>
```

### Card Component
```vue
<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      Content here
    </CardContent>
  </Card>
</template>
```

### Button Component
```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="default">Click me</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Delete</Button>
</template>
```

### Badge Component
```vue
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <Badge variant="default">Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Error</Badge>
  <Badge variant="outline">Outline</Badge>
</template>
```

### Dialog Component
```vue
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogHeader>
      <!-- Content -->
      <DialogFooter>
        <Button @click="isOpen = false">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Table Component
```vue
<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Column 1</TableHead>
        <TableHead>Column 2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Data 1</TableCell>
        <TableCell>Data 2</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

## Design System Tokens

### Colors
```vue
<!-- Instead of: text-gray-600 dark:text-gray-400 -->
<span class="text-muted-foreground">Text</span>

<!-- Instead of: text-gray-900 dark:text-white -->
<span class="text-foreground">Text</span>

<!-- Instead of: border-blue-500 -->
<div class="border-primary">Content</div>

<!-- Instead of: bg-gray-100 dark:bg-gray-800 -->
<div class="bg-muted">Content</div>
```

### Common Tokens
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary text color
- `bg-background` - Background color
- `bg-muted` - Muted background
- `border-border` - Border color
- `border-input` - Input border color
- `border-primary` - Primary border color
- `ring-ring` - Focus ring color

## Component Variants

### Button Variants
- `default` - Primary button (blue)
- `secondary` - Secondary button (gray)
- `outline` - Outlined button
- `ghost` - Transparent button
- `destructive` - Danger button (red)
- `link` - Link-styled button

### Button Sizes
- `default` - Normal size
- `sm` - Small
- `lg` - Large
- `icon` - Icon button (square)

### Badge Variants
- `default` - Primary badge (blue)
- `secondary` - Secondary badge (gray)
- `destructive` - Error badge (red)
- `outline` - Outlined badge

## Common Patterns

### Form Field with Label
```vue
<div class="space-y-2">
  <label class="text-sm font-medium text-foreground">
    Field Label
  </label>
  <Input v-model="value" placeholder="Enter value..." />
</div>
```

### Select with Label
```vue
<div class="space-y-2">
  <label class="text-sm font-medium text-foreground">
    Select Option
  </label>
  <Select v-model="value">
    <SelectTrigger>
      <SelectValue placeholder="Choose..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">Option 1</SelectItem>
      <SelectItem value="2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Loading State
```vue
<div v-if="loading" class="space-y-2">
  <Skeleton class="h-4 w-full" />
  <Skeleton class="h-4 w-3/4" />
  <Skeleton class="h-4 w-1/2" />
</div>
```

### Empty State
```vue
<div class="text-center py-12">
  <commonIcon name="lucide:inbox" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <h3 class="text-lg font-medium text-foreground mb-2">No items found</h3>
  <p class="text-muted-foreground mb-4">
    Try adjusting your filters
  </p>
  <Button @click="clearFilters">Clear Filters</Button>
</div>
```

### Card with Actions
```vue
<Card>
  <CardHeader>
    <div class="flex items-center justify-between">
      <CardTitle>Title</CardTitle>
      <Button variant="ghost" size="icon">
        <commonIcon name="lucide:more-vertical" class="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## Keyboard Navigation

### Select Component
- `Tab` - Focus trigger
- `Space/Enter` - Open dropdown
- `Arrow Up/Down` - Navigate options
- `Escape` - Close dropdown
- `Type` - Type-ahead search

### Dialog Component
- `Escape` - Close dialog
- `Tab` - Navigate focusable elements
- Focus trap - Keeps focus inside dialog

### Button Component
- `Tab` - Focus button
- `Space/Enter` - Activate button

## Accessibility Features

All shadcn-vue components include:
- ✅ Proper ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Semantic HTML
- ✅ Color contrast (WCAG AA)

## Mobile Considerations

- Touch targets are 44x44px minimum
- Select components use native mobile pickers
- Proper viewport handling
- Touch-friendly spacing
- Responsive by default

## Dark Mode

All components automatically support dark mode using CSS variables. No need for `dark:` classes!

```vue
<!-- ❌ Don't do this -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

<!-- ✅ Do this -->
<div class="bg-background text-foreground">
```

## Tips

1. **Always use design tokens** - `text-muted-foreground` instead of `text-gray-400`
2. **Import only what you need** - Tree-shakeable
3. **Check existing components** - Look in `components/ui/` first
4. **Follow patterns** - Look at existing usage in the codebase
5. **Test keyboard navigation** - Ensure Tab, Arrow keys work
6. **Test mobile** - Check touch targets and native pickers
7. **Test dark mode** - Should work automatically

## Resources

- [shadcn-vue Docs](https://www.shadcn-vue.com/)
- [Reka UI Docs](https://reka-ui.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Quick Tip:** When in doubt, check how existing components use shadcn-vue in the codebase!
