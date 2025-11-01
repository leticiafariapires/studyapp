# Design System - Dribbble Inspired

## Design Philosophy

This design system is inspired by modern, clean educational and productivity interfaces found on Dribbble. The goal is to create an intuitive, visually appealing experience that helps students stay focused and motivated while studying.

## Color Palette

### Primary Colors
- **Primary Blue**: `#4A90E2` - Main brand color, used for primary actions and highlights
- **Deep Blue**: `#2563EB` - Darker variant for emphasis and hover states
- **Light Blue**: `#E3F2FD` - Backgrounds and subtle highlights

### Secondary Colors
- **Purple Accent**: `#9C27B0` - Used for secondary actions and creative elements
- **Soft Purple**: `#F3E5F5` - Light backgrounds for special sections
- **Gradient**: Linear gradient from `#4A90E2` to `#9C27B0` - Hero sections and CTAs

### Neutral Colors
- **Dark Gray**: `#1F2937` - Primary text color
- **Medium Gray**: `#6B7280` - Secondary text and borders
- **Light Gray**: `#F9FAFB` - Backgrounds and dividers
- **White**: `#FFFFFF` - Card backgrounds and overlays

### Semantic Colors
- **Success Green**: `#10B981` - Success states and positive feedback
- **Warning Orange**: `#F59E0B` - Warnings and attention markers
- **Error Red**: `#EF4444` - Errors and critical alerts
- **Info Blue**: `#3B82F6` - Informational messages

## Typography

### Font Families
- **Primary Font**: Poppins - Used for headings and emphasis (weights: 400, 500, 600, 700)
- **Secondary Font**: Inter - Used for body text and UI elements (weights: 400, 500, 600)

### Type Scale
- **Display**: 48px / 3rem - Hero headings
- **H1**: 36px / 2.25rem - Page titles
- **H2**: 30px / 1.875rem - Section headers
- **H3**: 24px / 1.5rem - Card titles
- **H4**: 20px / 1.25rem - Subsection headers
- **Body**: 16px / 1rem - Main content
- **Small**: 14px / 0.875rem - Captions and meta information

## Spacing System

Following an 8px base unit for consistent spacing:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Components

### StudyCard
A flexible card component for displaying study materials, progress, or course information.

**Features:**
- Gradient background support
- Icon integration
- Progress indicators
- Action buttons
- Responsive design

**Use Cases:**
- Course cards
- Study session summaries
- Progress tracking
- Quick access to materials

### Dashboard Layout
A modern dashboard layout with sidebar navigation and content area.

**Features:**
- Flexible grid system
- Card-based content organization
- Charts and statistics
- Quick action buttons
- Responsive breakpoints

## Design Principles

1. **Clarity**: Information hierarchy is clear, with proper use of whitespace
2. **Consistency**: Reusable patterns and components across the application
3. **Feedback**: Visual feedback for all user interactions
4. **Accessibility**: WCAG 2.1 AA compliant color contrasts and keyboard navigation
5. **Responsiveness**: Mobile-first design that scales beautifully to desktop

## Animation & Transitions

- **Hover states**: 200ms ease-in-out transitions
- **Card elevations**: Subtle shadow changes on interaction
- **Loading states**: Smooth skeleton screens and spinners
- **Page transitions**: Fade in/out with 300ms duration

## Implementation Notes

- Using styled-components for component-level styling
- TailwindCSS classes can be combined with styled-components
- Fonts loaded via Google Fonts (Poppins and Inter)
- Icons from Lucide React library for consistency
- Responsive breakpoints: mobile (0-768px), tablet (768px-1024px), desktop (1024px+)

## Future Enhancements

- Dark mode support with adjusted color palette
- Customizable themes for different study types
- Animation library integration (Framer Motion)
- Advanced data visualization components
- Gamification elements (badges, achievements)
