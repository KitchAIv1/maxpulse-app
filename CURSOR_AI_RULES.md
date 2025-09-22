# MAXPULSE Platform - Cursor AI Rules

## 🚨 MANDATORY RULES - NO EXCEPTIONS

### File Length and Structure
- NEVER allow a file to exceed 500 lines
- If a file approaches 400 lines, break it up IMMEDIATELY
- Treat 1000 lines as UNACCEPTABLE, even temporarily
- Use folders and naming conventions to keep small files logically grouped

### React/TypeScript Specific Rules
- Every functionality should be in a dedicated component, custom hook, or service
- Favor composition over inheritance, always use modular thinking
- Code must be built for REUSE, not just to "make it work"
- Use TypeScript interfaces and classes for all data structures

### Single Responsibility Principle
- EVERY file, component, and function should do ONE thing only
- If it has multiple responsibilities, SPLIT IT IMMEDIATELY
- Each component, hook, or utility should be laser-focused on one concern

### Component and Function Size Limits
- Keep React components under 200 lines - SPLIT if larger
- Keep functions under 30-40 lines - EXTRACT if larger
- Keep custom hooks under 100 lines
- Keep service classes under 200 lines

### Naming and Architecture
- Use PascalCase for components (ProductManagement, EarningsOverview)
- Use camelCase for functions and variables (calculateCommission, userBalance)
- Use descriptive, intention-revealing names - NO vague names like 'data', 'info', 'helper'
- Apply Manager/Service pattern:
  - UI logic → Custom Hooks (useCommissions, useProducts)
  - Business logic → Services/Managers (CommissionManager, ProductManager)
  - State management → Context Providers (CommissionProvider)

### Modular Design Requirements
- Components should be reusable across different screens/projects
- Reduce tight coupling - favor props, context, dependency injection
- Ask: "Can I reuse this elsewhere?" If not, refactor it
- Create extension points from day one

### Code Quality Standards
- NEVER mix UI components and business logic directly
- Always separate concerns: UI, State, Business Logic, Services
- Include proper TypeScript types for everything
- Write code as if someone else will scale it to 10x usage

## 🚨 IMMEDIATE VIOLATIONS TO PREVENT

### Critical File Size Violations
- assessment/src/App.tsx is 935 lines - MUST be split into smaller components
- assessment/src/components/QuestionCard.tsx is 549 lines - MUST be refactored
- Any new component approaching 200 lines must be split immediately

### Architecture Patterns to Follow
```typescript
// ✅ CORRECT Structure
const ProductManagement = () => {
  const { products, loading } = useProducts(); // Custom hook
  const productManager = new ProductManager(); // Business logic
  // UI only - under 200 lines
};

// ❌ WRONG - Don't create monolithic components
const MassiveComponent = () => {
  // 500+ lines of mixed UI, logic, state management
};
```

### Required File Organization
```
src/
├── services/           # Business logic classes (<200 lines each)
├── hooks/             # Custom hooks (<100 lines each)  
├── components/        # UI components (<200 lines each)
├── providers/         # Context providers
└── utils/            # Pure utility functions
```

## 🎯 ENFORCEMENT INSTRUCTIONS

- Before generating ANY code, check these rules
- If a component will exceed 200 lines, split it into smaller parts
- Always use proper separation of concerns
- Create focused, single-responsibility components
- Use descriptive naming throughout
- Apply Manager/Service pattern for business logic

## 📊 SUCCESS CRITERIA

- No files >500 lines (components should be <200 lines)
- No functions >40 lines  
- Clear separation of concerns
- High component reusability
- Maintainable, scalable codebase

**THESE RULES ARE NON-NEGOTIABLE AND MUST BE FOLLOWED FOR ALL CODE GENERATION**
