# Frontend Project Structure

This document describes the organized structure of the frontend codebase.

## Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Tabs, ThemeToggle)
│   ├── layout/          # Layout components (AppBar, Drawer)
│   └── ui/              # Base UI components (Button, Input, DatePicker, etc.)
│
├── features/            # Feature-based modules
│   ├── todos/          # Todo management feature
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoDetail.tsx
│   │   ├── AddTaskModal.tsx
│   │   └── *.scss (co-located styles)
│   │
│   └── calendar/       # Calendar view feature
│       ├── CalendarView.tsx
│       ├── CalendarHeader.tsx
│       └── *.scss (co-located styles)
│
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── contexts/           # React context providers
├── utils/              # Utility functions
├── styles/             # Global styles
│   ├── _variables.scss
│   ├── index.scss
│   └── ui/            # UI component styles
│
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Design Principles

### 1. **Feature-Based Organization**
- Related components are grouped by feature (todos, calendar)
- Each feature is self-contained with its components, styles, and tests
- Makes it easy to find and maintain feature-specific code

### 2. **Component Hierarchy**
- **ui/**: Primitive, reusable UI components (Button, Input, Select, etc.)
- **common/**: Shared business components (Tabs, ThemeToggle)
- **layout/**: App structure components (AppBar, Drawer)
- **features/**: Domain-specific feature modules

### 3. **Co-located Styles**
- Styles are placed next to their components
- Makes it easier to find and update component styles
- Reduces cognitive load when working on a feature

### 4. **Barrel Exports**
- Each directory has an `index.ts` file for clean imports
- Example: `import { TodoList, AddTaskModal } from './features/todos'`

## Import Patterns

### Good ✅
```typescript
// Feature imports
import { TodoList, AddTaskModal } from './features/todos';
import { CalendarView } from './features/calendar';

// Layout imports
import { AppBar, Drawer } from './components/layout';

// UI imports
import { Button, DatePicker } from './components/ui';
```

### Avoid ❌
```typescript
// Don't use deep imports
import TodoList from './features/todos/TodoList';
import Button from './components/ui/Button';
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `TodoItem.tsx`, `AddTaskModal.tsx`)
- **Styles**: Match component name (e.g., `TodoItem.scss`)
- **Tests**: Match component with `.test` suffix (e.g., `TodoItem.test.tsx`)
- **Types**: camelCase (e.g., `todo.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)

## Adding New Features

1. Create a new directory in `features/`
2. Add components and their co-located styles
3. Create an `index.ts` barrel export
4. Update imports in consuming components

Example:
```
features/
└── myFeature/
    ├── MyComponent.tsx
    ├── MyComponent.scss
    ├── MyComponent.test.tsx
    └── index.ts
```

## Testing

- Tests are co-located with their components
- Use descriptive test names following the pattern: `describe` → `it` → `expect`
- Mock external dependencies appropriately

## Styling

- Uses SCSS with BEM naming convention
- Global variables in `styles/_variables.scss`
- Component-specific styles are co-located
- Glassmorphism design system with:
  - 15% opacity backgrounds
  - Backdrop blur effects
  - Consistent spacing and border radius

## Type Safety

- All components have TypeScript interfaces
- Types are defined in `types/` directory
- Shared types are exported from barrel files
