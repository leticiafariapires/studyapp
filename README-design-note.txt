# Design System Preview Instructions

## Overview
This PR introduces a new design system inspired by modern Dribbble aesthetics, featuring clean card-based layouts, gradient accents, and a professional color palette optimized for educational applications.

## What's Included

### Documentation
- **DESIGN.md** - Complete design system documentation including color palette, typography, spacing system, and component guidelines

### Components
- **StudyCard.jsx** - A flexible, reusable card component built with styled-components
  - Features gradient backgrounds, progress indicators, and action buttons
  - Fully responsive with hover animations
  - Customizable icons and content

### Pages
- **Dashboard** - Example implementation at `/dashboard-design`
  - Showcases StudyCard components in action
  - Includes stats overview with quick metrics
  - Demonstrates the design system's visual hierarchy
  - Responsive grid layout for all screen sizes

### Assets
- **mockup-hero.png** - Placeholder for design mockup visualization

## Prerequisites

The following dependencies have been added to package.json:
- `styled-components` - For component-level CSS-in-JS styling
- `@types/styled-components` - TypeScript definitions

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Google Fonts
The design system uses two font families. Add these to your app layout or HTML head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Or in your layout.tsx:
```typescript
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Preview the Design System

Navigate to: **http://localhost:3000/dashboard-design**

You should see:
- A gradient header with welcome message
- Statistics cards showing study metrics
- Study cards displaying active sessions
- Today's goals section
- Quick action buttons

## Using the Components

### Import StudyCard
```javascript
import { StudyCard } from '@/components/StudyCard';
```

### Basic Usage
```jsx
<StudyCard
  title="Mathematics"
  description="Linear Algebra fundamentals"
  progress={65}
  timeSpent="3.5h"
  totalItems={45}
  gradient={true}
  icon="book"
  onAction={() => console.log('Continue clicked')}
  actionText="Continue"
/>
```

### Available Props
- `title` (string) - Card title
- `description` (string) - Card description text
- `progress` (number 0-100) - Progress percentage
- `timeSpent` (string) - Time spent (e.g., "3.5h")
- `totalItems` (number) - Total number of items
- `gradient` (boolean) - Use gradient background
- `icon` (string) - Icon type: "book", "clock", or "trending"
- `onAction` (function) - Click handler for action button
- `actionText` (string) - Text for action button

## Integration with Existing App

### Option 1: Add to Main Navigation
Update your navigation to include the new dashboard:

```typescript
// In your navigation component
<Link href="/dashboard-design">
  Design Preview
</Link>
```

### Option 2: Replace Existing Dashboard
If you want to use this as your main dashboard:

1. Back up your current dashboard
2. Copy content from `app/dashboard-design/page.tsx`
3. Paste into your existing dashboard file
4. Adjust imports and paths as needed

### Option 3: Use Components Separately
Import and use StudyCard in any existing page:

```typescript
import { StudyCard } from '@/components/StudyCard';

// Use in your component
<StudyCard {...props} />
```

## Styled Components Configuration

If you encounter SSR hydration issues with styled-components, add this configuration:

### Create `.babelrc`:
```json
{
  "presets": ["next/babel"],
  "plugins": [["styled-components", { "ssr": true }]]
}
```

### Or add to `next.config.mjs`:
```javascript
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
};
```

## Customization

### Colors
Edit the color values in StudyCard.jsx or create theme variables:
- Primary: `#4A90E2`
- Secondary: `#9C27B0`
- Background: `#F9FAFB`

### Typography
Modify font imports in layout to use different Google Fonts or system fonts.

### Spacing
The design follows an 8px grid system. Adjust padding/margin values in multiples of 8.

## Browser Compatibility
- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Responsive design

## Performance Notes
- Components use CSS transitions for smooth animations
- Hover effects use GPU-accelerated transforms
- Fonts should be preloaded for optimal performance
- Images should be optimized before production

## Next Steps

1. **Review Design System** - Read DESIGN.md for complete guidelines
2. **Test Components** - Visit /dashboard-design to see components in action
3. **Customize** - Adjust colors, fonts, and spacing to match your brand
4. **Integrate** - Add StudyCard to your existing pages
5. **Extend** - Create additional components following the same patterns

## Troubleshooting

### Fonts not loading?
- Check internet connection (Google Fonts requires external access)
- Verify font imports in layout file
- Clear browser cache

### Styled-components errors?
- Ensure dependencies are installed: `npm install`
- Add babel configuration for SSR
- Restart development server

### Component not displaying?
- Check console for JavaScript errors
- Verify import paths are correct
- Ensure 'use client' directive is present in client components

## Support

For questions or issues:
1. Review DESIGN.md documentation
2. Check component prop types in StudyCard.jsx
3. Inspect browser console for errors
4. Review Next.js 14 documentation for app router specifics

## Future Enhancements
- Dark mode support
- More card variants (list view, compact view)
- Animation library integration (Framer Motion)
- Additional chart components
- Accessibility improvements (ARIA labels, keyboard navigation)
- Storybook integration for component showcase
