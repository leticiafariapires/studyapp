# Design System - Dribbble-Inspired Study App

## Design Philosophy

This design iteration focuses on creating a modern, clean, and engaging interface inspired by contemporary Dribbble trends. The goal is to make studying feel less overwhelming and more motivating through thoughtful use of color, typography, and spacing.

## Color Palette

### Primary Colors
- **Primary Blue**: `#4F46E5` - Used for primary actions and key interactive elements
- **Primary Indigo**: `#6366F1` - Accent color for hover states and highlights
- **Deep Purple**: `#7C3AED` - Used for special features and premium elements

### Neutral Colors
- **Background**: `#FAFAFA` - Soft white for main background
- **Surface**: `#FFFFFF` - Pure white for cards and elevated surfaces
- **Text Primary**: `#1F2937` - Dark gray for primary text
- **Text Secondary**: `#6B7280` - Medium gray for secondary text
- **Border**: `#E5E7EB` - Light gray for borders and dividers

### Accent Colors
- **Success Green**: `#10B981` - For completed tasks and positive feedback
- **Warning Amber**: `#F59E0B` - For warnings and pending items
- **Error Red**: `#EF4444` - For errors and urgent items
- **Info Cyan**: `#06B6D4` - For informational elements

## Typography

### Font Families
- **Primary Font**: Poppins - Used for headings and important UI elements
  - Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Secondary Font**: Inter - Used for body text and general content
  - Weights: 400 (Regular), 500 (Medium), 600 (Semibold)

### Type Scale
- **Heading 1**: 2.5rem (40px) - Poppins Bold
- **Heading 2**: 2rem (32px) - Poppins Semibold
- **Heading 3**: 1.5rem (24px) - Poppins Semibold
- **Body Large**: 1.125rem (18px) - Inter Regular
- **Body**: 1rem (16px) - Inter Regular
- **Body Small**: 0.875rem (14px) - Inter Regular
- **Caption**: 0.75rem (12px) - Inter Medium

## Spacing System

Following an 8px base grid system:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Design Principles

### Cards
- Soft shadows for depth (shadow-sm to shadow-md)
- Rounded corners (8px - 12px border radius)
- Generous padding (16px - 24px)
- Clear visual hierarchy within cards

### Buttons
- Primary: Solid fill with primary color
- Secondary: Outlined style
- Text: Minimal style for tertiary actions
- All with smooth hover transitions (200ms)

### Interactions
- Smooth transitions on all interactive elements
- Hover states with slight color shifts
- Active states with subtle scale transforms
- Focus states with visible outline for accessibility

## Dashboard Layout

The main dashboard features:
- Clean header with navigation
- Grid-based layout for study cards
- Responsive design (mobile-first approach)
- Clear visual separation between sections
- Progress indicators and statistics prominently displayed

## Accessibility Considerations

- WCAG 2.1 AA compliant color contrast ratios
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators on all interactive elements
- Sufficient touch target sizes (minimum 44x44px)

## Design Tools & Resources

- Figma for design mockups
- Styled-components for component styling
- Tailwind CSS for utility classes (where applicable)
- React for component architecture
