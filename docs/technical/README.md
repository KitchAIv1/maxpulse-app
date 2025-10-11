# Technical Documentation

This directory contains technical documentation for the MaxPulse app, including system architecture, implementation details, and development guidelines.

## 📁 Contents

### 🔐 **Authentication & Security**
- **[Activation Code System](ACTIVATION_CODE_SYSTEM.md)** - Complete authentication flow documentation
- **[Database Schema](supabase_schema.sql)** - Supabase database structure and RLS policies
- **[RLS Development Setup](disable_rls_temp.sql)** - Temporary RLS disable for development

### 🤖 **AI & Intelligence Features**
- **[AI Coach & Wellbeing System](AI_COACH_WELLBEING_SYSTEM.md)** - AI Coach and dashboard implementation

### 🎨 **UI/UX Documentation**
- **[UI/UX Guidelines](ui/ux.md)** - Design system and component specifications

### 🛠️ **Development**
- **[Project Status](PROJECT_STATUS.md)** - Current development state and progress
- **[Cursor AI Rules](CURSOR_AI_RULES.md)** - Development guidelines and architectural constraints

## 🔧 For Developers

### Getting Started
1. Review the **[Project Status](PROJECT_STATUS.md)** to understand current implementation
2. Follow **[Cursor AI Rules](CURSOR_AI_RULES.md)** for code organization
3. Set up the database using **[Database Schema](supabase_schema.sql)**
4. Understand the authentication flow via **[Activation Code System](ACTIVATION_CODE_SYSTEM.md)**

### Implementation Guidelines
- Follow the architectural patterns documented in each system
- Maintain the file size and component limits specified in Cursor AI Rules
- Use the UI/UX guidelines for consistent design implementation
- Test authentication flows thoroughly using the activation code system

### Database Setup
1. Execute **[supabase_schema.sql](supabase_schema.sql)** in your Supabase project
2. For development, optionally run **[disable_rls_temp.sql](disable_rls_temp.sql)** to disable RLS temporarily
3. Configure environment variables as specified in the main README

## 📊 Architecture Overview

The MaxPulse app follows a clean architecture pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Service Layer  │    │  Data Layer     │
│                 │    │                 │    │                 │
│ • React Native  │◄──►│ • AI Coach      │◄──►│ • Supabase      │
│ • Components    │    │ • Health APIs   │    │ • Local Storage │
│ • Screens       │    │ • Auth Service  │    │ • Health APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Principles
- **Single Responsibility**: Each component/service has one clear purpose
- **Separation of Concerns**: UI, business logic, and data are clearly separated
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Scalability**: Modular design for easy feature additions

## 🔍 Quick Reference

### File Size Limits
- **Components**: Maximum 200 lines
- **Services**: Maximum 200 lines
- **Any File**: Maximum 500 lines (hard limit)
- **Functions**: Maximum 30-40 lines

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`, `HealthDashboard`)
- **Functions/Variables**: camelCase (e.g., `calculateScore`, `userMetrics`)
- **Files**: Match component names or use descriptive names
- **Directories**: lowercase with hyphens (e.g., `user-profile`, `health-tracking`)

### State Management
- **Global State**: Zustand stores in `src/stores/`
- **Component State**: React hooks for local state
- **Persistent Data**: AsyncStorage for local persistence
- **Server State**: Supabase for backend data

---

**Last Updated**: January 2025  
**Maintainer**: MaxPulse Development Team
