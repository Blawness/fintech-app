# Styling Guide

## 🎨 **UI System Overview**

### **Framework Stack**
- **Tailwind CSS 3.4.17**: Utility-first CSS
- **shadcn/ui**: Component library
- **Radix UI**: Accessible primitives
- **Tailwind Animate**: Animation utilities

### **Design Tokens**
Located in `app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more tokens */
}
```

## 🧩 **Component Architecture**

### **shadcn/ui Components**
All components in `components/ui/` are:
- ✅ Fully typed with TypeScript
- ✅ Accessible with Radix UI
- ✅ Customizable with Tailwind
- ✅ Consistent API patterns

### **Key Components Used**

#### `Button`
```tsx
<Button variant="default|destructive|outline|secondary|ghost|link" size="default|sm|lg|icon">
  Content
</Button>
```

#### `Card`
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

#### `Progress`
```tsx
<Progress value={75} className="h-2" />
```

#### `RadioGroup`
```tsx
<RadioGroup value={selected} onValueChange={setSelected}>
  <div>
    <RadioGroupItem value="option1" id="opt1" />
    <Label htmlFor="opt1">Option 1</Label>
  </div>
</RadioGroup>
```

## 🎯 **Styling Patterns**

### **Layout System**
- Container: `container mx-auto px-4`
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-6`
- Flex: `flex items-center justify-between`

### **Color System**
- Primary: Blue (`--primary`)
- Secondary: Gray (`--secondary`)
- Success: Green (`--destructive` with green)
- Error: Red (`--destructive`)

### **Spacing Scale**
- `p-4` (16px), `p-6` (24px), `p-8` (32px)
- `m-4`, `m-6`, `m-8` for margins
- `gap-4`, `gap-6` for grid/flex gaps

### **Typography**
- Headings: `text-2xl`, `text-3xl`, `text-4xl`
- Body: `text-sm`, `text-base`, `text-lg`
- Font weight: `font-medium`, `font-semibold`, `font-bold`

## 🔧 **Utility Classes**

### **Responsive Design**
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Example: `text-sm md:text-base lg:text-lg`

### **Interactive States**
- Hover: `hover:bg-primary/90`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`

### **Animation**
- `animate-spin` for loading
- `transition-colors` for smooth color changes
- Custom keyframes in `tailwind.config.js`

## 🎭 **Theming**

### **Light/Dark Mode Support**
- CSS variables for both themes
- `.dark` class for dark mode
- Automatic theme switching via system preference

### **Custom Variants**
- `buttonVariants` in `Button.tsx`
- `cn()` utility for class merging
- Consistent variant API across components

## 📱 **Responsive Design**

### **Breakpoint Strategy**
```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### **Mobile-First Components**
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly button sizes

## 🚀 **Performance**

### **CSS Optimization**
- Tailwind purges unused styles
- Component-level CSS isolation
- Minimal bundle size impact

### **Loading States**
- Skeleton loaders for better UX
- Conditional rendering patterns
- Progressive loading for heavy components

## 🛠️ **Customization**

### **Adding New Components**
1. Use `npx shadcn-ui@latest add [component]`
2. Customize in `components/ui/`
3. Update design tokens if needed

### **Modifying Theme**
1. Edit CSS variables in `globals.css`
2. Update Tailwind config if needed
3. Test across all components

### **Component Variants**
```tsx
const variants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-styles",
      custom: "custom-styles"
    }
  }
})
```

## 🔍 **Debugging Styles**

### **Common Issues**
- CSS not applying: Check Tailwind config
- Component styles conflicting: Use `cn()` utility
- Responsive not working: Verify breakpoint order

### **DevTools Tips**
- Use Tailwind's responsive preview
- Check computed styles for overrides
- Use CSS custom properties for debugging

