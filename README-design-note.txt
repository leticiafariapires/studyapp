# Design Branch - README

## Overview
This branch (`design/dribbble-style`) contains the initial design system and component implementation for StudyApp, following modern Dribbble-style aesthetics with a focus on clean, minimalist interfaces.

## What's New in This Branch

### Design System (DESIGN.md)
A comprehensive design system document that includes:
- Visual philosophy and layout principles
- Complete color palette with semantic colors
- Typography system using Poppins and Inter fonts
- Spacing system based on 8px baseline grid
- Component specifications
- Animation guidelines
- Accessibility considerations

### New Components

#### StudyCard (src/components/StudyCard.jsx)
A reusable card component built with styled-components featuring:
- Clean, modern card design with hover effects
- Progress bar visualization
- Flexible stat display
- Badge support for status indicators
- Full accessibility support (keyboard navigation, ARIA labels)

#### Dashboard (src/pages/Dashboard.jsx)
A complete dashboard page demonstrating:
- Responsive grid layout
- Statistics overview section
- Subject cards showcasing different study areas
- Hero header with gradient background
- Mobile-first responsive design

### Design Assets
- **mockup-hero.txt**: Text-based mockup placeholder showing the dashboard layout
  - Note: High-fidelity PNG/SVG mockups will be added in follow-up commits

## Design Decisions

### Why styled-components?
- Component-scoped styles prevent CSS conflicts
- Dynamic styling based on props
- Better developer experience with syntax highlighting
- Easy theme implementation for future dark mode support

### Why Poppins + Inter?
- Poppins: Modern, geometric sans-serif perfect for headings
- Inter: Highly readable, designed for screens, ideal for body text
- Both fonts are optimized for digital interfaces

### Color Palette Rationale
- **Primary Indigo**: Professional yet friendly, associated with focus and learning
- **High Contrast Neutrals**: Ensures readability during extended study sessions
- **Semantic Colors**: Clear visual feedback for different states
- **Gradient Accents**: Adds visual interest without overwhelming the interface

## Technical Requirements

### Dependencies
This design implementation requires:
```json
{
  "styled-components": "^6.0.0"
}
```

### Font Setup
The design uses Google Fonts that need to be imported in your `index.html` or CSS:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
```

## Implementation Status

### Completed ✅
- [x] Design system documentation (DESIGN.md)
- [x] StudyCard component with full functionality
- [x] Dashboard page with sample data
- [x] Mockup placeholder for preview
- [x] Responsive design implementation
- [x] Accessibility features (ARIA labels, keyboard navigation)

### Pending 🚧
- [ ] High-fidelity mockup images (PNG/SVG)
- [ ] Integration with actual data/state management
- [ ] Additional page designs (login, settings, etc.)
- [ ] Dark mode theme
- [ ] Unit tests for components
- [ ] Storybook documentation

## How to Preview

### Local Development Setup

1. **Switch to the design branch:**
   ```bash
   git fetch
   git checkout design/dribbble-style
   ```

2. **Install base dependencies:**
   ```bash
   npm install
   ```

3. **Install styled-components:**
   ```bash
   npm install styled-components
   ```

4. **Add fonts to your project:**
   
   Add this to your `index.html` (in the `<head>` section):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
   ```
   
   Or add to your global CSS:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap');
   ```

5. **Import Dashboard into your app:**
   
   In your `App.jsx` or routing configuration:
   ```jsx
   import Dashboard from './src/pages/Dashboard';
   
   // Add to your routes or render directly
   <Dashboard />
   ```

6. **Start the development server:**
   ```bash
   npm start
   ```

7. **View the dashboard:**
   Open your browser to `http://localhost:3000` (or the port shown in terminal)

### Expected Result
You should see:
- A purple gradient hero section with title
- Four statistics cards showing study metrics
- Three subject cards (Mathematics, Computer Science, Physics)
- Hover effects on cards (lift and shadow)
- Responsive layout that adapts to screen size

## Notes for Reviewers

### Design Review Checklist
- [ ] Color palette matches brand guidelines
- [ ] Typography is readable and hierarchical
- [ ] Spacing is consistent throughout
- [ ] Hover states provide clear feedback
- [ ] Mobile responsiveness works correctly
- [ ] Accessibility features are properly implemented

### Code Review Checklist
- [ ] Components follow React best practices
- [ ] Styled-components are properly scoped
- [ ] Props are properly typed/validated
- [ ] Code is maintainable and well-commented

### Future Enhancements to Consider
- Animation library integration (Framer Motion)
- Loading skeleton states
- Empty states for zero data
- Error boundaries
- Performance optimizations

## Questions or Feedback?
Please leave comments on the PR or reach out to the design team for any questions about the design decisions or implementation approach.

---

**Branch**: design/dribbble-style  
**Target**: main  
**Status**: Ready for Review  
**Last Updated**: 2025-11-01
