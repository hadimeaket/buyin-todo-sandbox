# BuyIn Brand Design System Implementation

## Overview

This document outlines the implementation of the BuyIn brand design tokens across the Todo application frontend.

## Color System

### Primary Brand Colors

- **BuyIn Red** (`#FD3059`): Primary actions, highlights, active states, checkboxes, primary buttons
- **Burgundy** (`#B2232F`): Hover states, selected states, secondary accents
- **Dark Red** (`#66172A`): Deep brand shade for dark surfaces and shadows

### Secondary Accent Colors

- **Beige** (`#FD9C79`): Soft accent for medium priority badges, tags, status indicators
- **Light Red** (`#FF6758`): Subtle hovers, secondary buttons (available for future use)

### Neutrals

- **White** (`#FFFFFF`): Primary text on dark backgrounds, headings
- **Off-White** (`#F9FAFB`): Default body text for improved readability
- **Dark Background** (`#05070A`): Global page background
- **Dark Surface Levels**:
  - `#0C0F14` (Surface 1): Primary cards, form containers
  - `#10131A` (Surface 2): Secondary surfaces, input fields
  - `#181C24` (Surface 3): Borders, subtle backgrounds

### Optional Secondary Palette

- **Orange** (`#F28C4D`): Available for charts
- **Lemon** (`#F6D48E`): Available for charts
- **Yellow** (`#FAB561`): Available for charts
- **Duck Green** (`#377F71`): Low priority badges, success states
- **Dark Blue** (`#223959`): Available for charts

## Typography System

### Font Family

- **Geologica** (Google Fonts) in weights: 300, 400, 600, 800
- Fallbacks: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Typography Hierarchy

#### Headings

- **H1**: 44px, Geologica Black (800) - Large page headlines
- **H2**: 40px, Geologica Black (800) - Page sections
- **H3**: 24px, Geologica SemiBold (600) - Card headings, dialog titles
- **H4/H5**: 20px, Geologica SemiBold (600) - Section subheadings, labels

#### Body Text

- **Default**: 14px, Geologica Regular (400) - Main content
- **Secondary**: 16px, Geologica Regular (400) - Larger body text

#### Tags & Meta

- **Size**: 12px
- **Weight**: Geologica Light (300)
- **Style**: Uppercase, letter-spacing 0.03em
- **Usage**: Badges, labels, metadata

## Component Implementation

### Buttons

- **Primary**: BuyIn Red background, hover to Burgundy
- **Secondary**: Dark surface with Burgundy border, hover fills with Burgundy
- **Ghost**: Transparent, hover to dark surface
- **States**: Soft shadows that elevate on hover

### Badges & Tags

- **High Priority**: BuyIn Red with 15% opacity background
- **Medium Priority**: Beige with 15% opacity background
- **Low Priority**: Duck Green with 15% opacity background
- **Default**: Dark surface with subtle borders
- **Typography**: 12px, Geologica Light 300, uppercase

### Cards & Surfaces

- **Main Cards**: Dark Surface 1 (`#0C0F14`) with subtle borders
- **Secondary Surfaces**: Dark Surface 2 (`#10131A`)
- **Shadows**: Layered soft shadows for depth (0.3-0.6 alpha blacks)

### Form Elements

- **Inputs**: Dark Surface 2 background, BuyIn Red focus ring
- **Labels**: 12px, Geologica Light 300, uppercase, off-white
- **Placeholders**: Muted gray (`#9ca3af`)
- **Disabled**: 40% opacity

### Checkboxes

- **Default**: Dark Surface 2 background with subtle border
- **Checked**: BuyIn Red background and border
- **Focus**: BuyIn Red ring with 20% opacity outer glow

### Tabs

- **Active**: BuyIn Red border and 15% opacity tint, white text
- **Inactive**: Transparent, off-white text, hover shows dark surface
- **Spacing**: Compact with clear visual hierarchy

### Todo Items

- **Background**: Dark Surface 2 (`#10131A`)
- **Border**: Subtle dark surface 3 border
- **Hover**: Burgundy border tint, elevated shadow
- **Completed**: 60% opacity with darker background
- **Actions**: Edit always visible (Burgundy tint on hover), Delete hidden until hover (BuyIn Red on hover)

## Design Principles

### Dark UI Approach

- Multiple surface layers for visual hierarchy
- Subtle borders using rgba for transparency
- Soft shadows with higher opacity blacks (0.3-0.6 alpha)
- Clear contrast between text and backgrounds

### Visual Hierarchy

1. **Primary actions**: BuyIn Red with bold weight
2. **Secondary elements**: Burgundy and Beige accents
3. **Tertiary info**: Light weight typography, muted colors
4. **Backgrounds**: Layered dark surfaces create depth

### Accessibility

- White text (#FFFFFF) for headings ensures maximum contrast
- Off-white (#F9FAFB) for body text reduces eye strain
- Brand colors meet WCAG AA standards on dark backgrounds
- Focus states use visible BuyIn Red rings
- Disabled states clearly indicated with reduced opacity

### Consistency

- All primary actions use BuyIn Red
- All hover states transition to Burgundy
- All badges/tags use consistent sizing and light weight
- Form elements share uniform styling and behavior
- Spacing follows consistent 4px grid system

## Files Updated

- `_variables.scss`: Complete brand token system
- `index.scss`: Global typography and base styles
- `App.scss`: Main container and section styling
- `Button.scss`: Primary, secondary, ghost variants
- `Badge.scss`: Priority badges with brand colors
- `Card.scss`: Surface layering
- `Input.scss`: Form fields with brand focus states
- `Checkbox.scss`: Custom checkbox with BuyIn Red
- `Tabs.scss`: Tab navigation with active states
- `TodoForm.scss`: Complete form styling
- `TodoItem.scss`: Todo card with metadata and actions
- All other component SCSS files updated for brand consistency

## Testing

- Application accessible at: `http://localhost:5173/`
- Backend API accessible at: `http://localhost:4000/api/todos`
- All styles compile successfully with HMR
- No blocking errors or warnings
