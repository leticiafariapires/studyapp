# Design System - StudyApp

## Design Inspiration
This design follows Dribbble-style modern aesthetics with a focus on clean, minimalist interfaces that promote productivity and focus for students.

## Design Decisions

### Visual Philosophy
- **Minimalism First**: Clean layouts with generous white space to reduce cognitive load
- **Focus on Content**: Design elements support the content, never overshadow it
- **Accessibility**: High contrast ratios and clear typography for extended study sessions

### Layout Principles
- Card-based interface for modular content organization
- Responsive grid system that adapts from mobile to desktop
- Consistent spacing using 8px baseline grid
- Clear visual hierarchy through typography and spacing

### Interaction Design
- Smooth micro-interactions for user feedback
- Hover states that indicate interactivity
- Loading states to manage user expectations
- Progressive disclosure to avoid overwhelming users

## Color Palette

### Primary Colors
- **Primary Blue**: `#4F46E5` (Indigo-600) - Main brand color, used for primary actions
- **Primary Blue Hover**: `#4338CA` (Indigo-700) - Interactive states
- **Primary Blue Light**: `#818CF8` (Indigo-400) - Accents and highlights

### Neutral Colors
- **Background**: `#FFFFFF` (White) - Main background
- **Surface**: `#F9FAFB` (Gray-50) - Card backgrounds
- **Border**: `#E5E7EB` (Gray-200) - Borders and dividers
- **Text Primary**: `#111827` (Gray-900) - Main text
- **Text Secondary**: `#6B7280` (Gray-500) - Secondary text
- **Text Tertiary**: `#9CA3AF` (Gray-400) - Tertiary text

### Semantic Colors
- **Success Green**: `#10B981` (Emerald-500) - Success states, completed tasks
- **Warning Yellow**: `#F59E0B` (Amber-500) - Warning states, attention needed
- **Error Red**: `#EF4444` (Red-500) - Error states, destructive actions
- **Info Blue**: `#3B82F6` (Blue-500) - Information, tips

### Gradients
- **Hero Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Card Gradient**: `linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0) 100%)`

## Typography

### Font Families
- **Headings**: Poppins (Semi-Bold 600, Bold 700)
- **Body**: Inter (Regular 400, Medium 500, Semi-Bold 600)

### Type Scale
- **H1**: 48px / 3rem - Hero headings
- **H2**: 36px / 2.25rem - Section headings
- **H3**: 24px / 1.5rem - Card headings
- **H4**: 20px / 1.25rem - Subsection headings
- **Body Large**: 18px / 1.125rem - Emphasized body text
- **Body**: 16px / 1rem - Default body text
- **Body Small**: 14px / 0.875rem - Secondary text
- **Caption**: 12px / 0.75rem - Labels, captions

### Line Heights
- **Tight**: 1.2 - For headings
- **Normal**: 1.5 - For body text
- **Relaxed**: 1.7 - For long-form content

## Spacing System
Based on 8px baseline grid:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Specifications

### StudyCard
- **Size**: Variable width, minimum 280px
- **Padding**: 24px (lg)
- **Border Radius**: 12px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
- **Hover Shadow**: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
- **Transition**: all 0.3s ease

### Dashboard
- **Container**: Max-width 1280px, centered
- **Grid**: 3 columns on desktop, 2 on tablet, 1 on mobile
- **Gap**: 24px (lg)

## Animation Guidelines
- **Duration**: 200-300ms for micro-interactions
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - smooth ease-in-out
- **Hover Scale**: 1.02 - subtle lift effect
- **Focus Ring**: 2px offset, primary color

## Accessibility Considerations
- Minimum text size: 14px
- Contrast ratio: 4.5:1 for body text, 7:1 for headings
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly labels

## Implementation Notes
- Using CSS-in-JS with styled-components for component-scoped styles
- Leveraging CSS custom properties for theme values
- Mobile-first responsive approach
- Support for dark mode (future phase)

## Design Files
- Mockup preview: See assets/design/mockup-hero.txt
- High-fidelity designs: To be added in follow-up commits
