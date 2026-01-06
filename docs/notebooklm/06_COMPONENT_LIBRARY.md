# Moldova Direct - Component Library

## Overview

The project uses a custom component library located in `components/ui/`. These are lightweight, accessible components with TypeScript support and dark mode.

## Core Components

### Button
Primary action button with variants.

```vue
<template>
  <Button variant="default" size="lg" @click="handleClick">
    Click me
  </Button>
</template>

<script setup>
import { Button } from '@/components/ui/button'
</script>
```

**Variants**: `default`, `secondary`, `outline`, `ghost`, `destructive`
**Sizes**: `sm`, `default`, `lg`

### Card
Content container with header/body/footer sections.

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description text</CardDescription>
    </CardHeader>
    <CardContent>
      Main content goes here
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
</template>

<script setup>
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
</script>
```

### Dialog
Modal dialogs and overlays.

```vue
<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog description</DialogDescription>
      </DialogHeader>
      <div>Dialog content</div>
      <DialogFooter>
        <Button @click="isOpen = false">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const isOpen = ref(false)
</script>
```

### Input
Text input field with label support.

```vue
<template>
  <div class="space-y-2">
    <Label for="email">Email</Label>
    <Input
      id="email"
      v-model="email"
      type="email"
      placeholder="Enter email"
    />
  </div>
</template>

<script setup>
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const email = ref('')
</script>
```

### Select
Dropdown selection component.

```vue
<template>
  <Select v-model="selected">
    <SelectTrigger>
      <SelectValue placeholder="Select option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup>
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

const selected = ref('')
</script>
```

## Form Components

### Checkbox
```vue
<template>
  <div class="flex items-center space-x-2">
    <Checkbox id="terms" v-model:checked="accepted" />
    <Label for="terms">Accept terms</Label>
  </div>
</template>

<script setup>
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const accepted = ref(false)
</script>
```

### Switch
Toggle switch for boolean values.

```vue
<template>
  <div class="flex items-center space-x-2">
    <Switch id="notifications" v-model:checked="enabled" />
    <Label for="notifications">Enable notifications</Label>
  </div>
</template>

<script setup>
import { Switch } from '@/components/ui/switch'
</script>
```

### RadioGroup
```vue
<template>
  <RadioGroup v-model="selected">
    <div class="flex items-center space-x-2">
      <RadioGroupItem value="option1" id="r1" />
      <Label for="r1">Option 1</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroupItem value="option2" id="r2" />
      <Label for="r2">Option 2</Label>
    </div>
  </RadioGroup>
</template>

<script setup>
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
</script>
```

### Textarea
Multi-line text input.

```vue
<template>
  <Textarea
    v-model="message"
    placeholder="Enter message"
    rows="4"
  />
</template>

<script setup>
import { Textarea } from '@/components/ui/textarea'
</script>
```

## Feedback Components

### Alert
Alert messages and notifications.

```vue
<template>
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Something went wrong.</AlertDescription>
  </Alert>
</template>

<script setup>
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
</script>
```

**Variants**: `default`, `destructive`

### Badge
Status badges and labels.

```vue
<template>
  <Badge variant="secondary">New</Badge>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'
</script>
```

**Variants**: `default`, `secondary`, `destructive`, `outline`

### Tooltip
Hover tooltips for additional information.

```vue
<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup>
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'
</script>
```

### Skeleton
Loading placeholders.

```vue
<template>
  <div class="space-y-2">
    <Skeleton class="h-4 w-[250px]" />
    <Skeleton class="h-4 w-[200px]" />
  </div>
</template>

<script setup>
import { Skeleton } from '@/components/ui/skeleton'
</script>
```

## Layout Components

### Tabs
Tabbed content sections.

```vue
<template>
  <Tabs default-value="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </Tabs>
</template>

<script setup>
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
</script>
```

### Table
Data tables with header, body, footer.

```vue
<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in items" :key="item.id">
        <TableCell>{{ item.name }}</TableCell>
        <TableCell>{{ item.price }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup>
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
</script>
```

### Avatar
User avatar with image and fallback.

```vue
<template>
  <Avatar>
    <AvatarImage :src="user.avatar" :alt="user.name" />
    <AvatarFallback>{{ user.initials }}</AvatarFallback>
  </Avatar>
</template>

<script setup>
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
</script>
```

## Feature-Specific Components

### Product Components (`components/product/`)
- `Card.vue` - Product card with image, price, add to cart
- `Gallery.vue` - Product image gallery
- `Details.vue` - Full product details
- `Reviews.vue` - Customer reviews

### Cart Components (`components/cart/`)
- `Item.vue` - Cart line item
- `Summary.vue` - Cart totals
- `Drawer.vue` - Slide-out cart

### Checkout Components (`components/checkout/`)
- `ShippingForm.vue` - Shipping address form
- `PaymentForm.vue` - Stripe payment form
- `OrderSummary.vue` - Order review

### Admin Components (`components/admin/`)
- `Dashboard/` - Dashboard widgets
- `Products/` - Product CRUD
- `Orders/` - Order management
- `Users/` - User management

## Styling Guidelines

### Dark Mode
All components support dark mode:
```vue
<div class="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
```

### Focus States
Always include visible focus states:
```vue
<button class="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
```

### Spacing
Use Tailwind's spacing scale:
- `p-4` / `px-4 py-2` for padding
- `gap-4` for flex/grid gaps
- `space-y-4` for vertical stacking
