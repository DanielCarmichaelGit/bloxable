# Bloxable Design System

## Overview

The Bloxable Design System is a comprehensive collection of reusable UI components, design tokens, and guidelines that ensure consistency, accessibility, and excellent user experience across the Bloxable marketplace platform.

## Design Principles

### 1. **Accessibility First**

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Semantic HTML structure

### 2. **Mobile-First Approach**

- Responsive design from mobile to desktop
- Touch-friendly interactions (44px minimum touch targets)
- Optimized for small screens
- Progressive enhancement

### 3. **Consistency**

- Unified visual language
- Consistent spacing and typography
- Standardized component patterns
- Predictable interactions

### 4. **Performance**

- Lightweight components
- Optimized animations
- Efficient rendering
- Minimal bundle impact

## Color System

### Primary Colors

```css
--primary: 240 5.9% 10%; /* Dark blue-gray */
--primary-foreground: 0 0% 98%; /* Near white */
```

### Secondary Colors

```css
--secondary: 240 4.8% 95.9%; /* Light gray */
--secondary-foreground: 240 5.9% 10%; /* Dark text */
```

### Semantic Colors

```css
--destructive: 0 84.2% 60.2%; /* Red for errors */
--muted: 240 4.8% 95.9%; /* Muted backgrounds */
--accent: 240 4.8% 95.9%; /* Accent highlights */
```

### Theme Support

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Reduced eye strain for low-light usage
- **System Theme**: Automatically follows OS preference

## Typography

### Font Stack

- **Primary**: Inter (system font fallback)
- **Monospace**: 'Fira Code', 'JetBrains Mono', monospace

### Scale

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)
- **6xl**: 3.75rem (60px)

## Spacing System

Based on 4px grid system:

- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

## Component Library

### Core Components

#### Button

```tsx
<Button variant="default" size="lg">
  Primary Action
</Button>
```

**Variants:**

- `default`: Primary action button
- `destructive`: Dangerous actions
- `outline`: Secondary actions
- `secondary`: Subtle actions
- `ghost`: Minimal actions
- `link`: Text-based actions

**Sizes:**

- `sm`: 36px height
- `default`: 40px height
- `lg`: 44px height
- `icon`: 40px square

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Input

```tsx
<Input type="email" placeholder="Enter email" className="w-full" />
```

#### Select

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Loading Components

#### Skeleton

```tsx
<Skeleton className="h-4 w-full" />
<SkeletonCard />
<SkeletonWorkflowCard />
<SkeletonText lines={3} />
```

#### Spinner

```tsx
<Spinner size="md" />
<LoadingButton loading={true}>
  Loading...
</LoadingButton>
```

### Feedback Components

#### Toast

```tsx
const { success, error, warning, info } = useToast();

success("Success!", "Operation completed successfully");
error("Error", "Something went wrong");
```

## Layout System

### Container

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">Content</div>
```

### Grid System

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  Grid items
</div>
```

### Flexbox Utilities

```tsx
<div className="flex items-center justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

## Responsive Design

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach

```tsx
// Mobile first, then enhance for larger screens
<div className="text-sm md:text-base lg:text-lg">Responsive text</div>
```

## Animation Guidelines

### Framer Motion

- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: `ease-out` for entrances, `ease-in` for exits
- **Scale**: Subtle scale effects (1.02x max) for hover states

### CSS Transitions

```css
transition-all duration-200 ease-out
```

## Accessibility Guidelines

### ARIA Labels

```tsx
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>
```

### Focus Management

- Visible focus indicators
- Logical tab order
- Skip links for keyboard users

### Color Contrast

- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Color is not the only indicator of meaning

## Usage Examples

### Form Layout

```tsx
<form className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter your email" />
  </div>
  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent>
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Loading State

```tsx
{
  loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonWorkflowCard key={i} />
      ))}
    </div>
  ) : (
    <WorkflowGrid workflows={workflows} />
  );
}
```

## Best Practices

### Component Composition

- Use composition over inheritance
- Keep components focused and single-purpose
- Accept className props for customization

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets

### Testing

- Test with keyboard navigation
- Verify screen reader compatibility
- Test on various screen sizes

## Future Enhancements

### Planned Components

- [ ] Data Table with sorting and filtering
- [ ] Pagination component
- [ ] Modal variants (confirmation, info)
- [ ] Progress indicators
- [ ] Tooltip component
- [ ] Dropdown menu component

### Design Tokens

- [ ] Motion tokens
- [ ] Shadow system
- [ ] Border radius scale
- [ ] Z-index scale

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

---

_This design system is continuously evolving. Please contribute improvements and report issues through the development team._
