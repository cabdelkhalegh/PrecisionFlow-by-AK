# Testing Guide for TiKiT OS

This document outlines what has been tested and what can be tested in the TiKiT OS project.

## 🧪 Testing Infrastructure

The project now includes comprehensive testing infrastructure:

### Unit Testing (Vitest)
- **Framework**: Vitest with React Testing Library
- **Coverage**: Component testing, integration testing
- **Location**: `src/**/__tests__/*.test.tsx` and `src/**/__tests__/*.test.ts`

### E2E Testing (Playwright)
- **Framework**: Playwright
- **Coverage**: Full user journeys, navigation, UI interactions
- **Location**: `e2e/*.spec.ts`

## ✅ What's Currently Tested

### Component Tests (15 tests passing)

#### Home Page (`src/app/__tests__/page.test.tsx`)
- ✅ Renders main heading "TiKiT OS"
- ✅ Displays tagline
- ✅ Shows description text
- ✅ Renders dashboard navigation link
- ✅ Has correct gradient background styling

#### Dashboard Page (`src/app/dashboard/__tests__/page.test.tsx`)
- ✅ Renders dashboard header with title
- ✅ Displays welcome message
- ✅ Shows all four stat cards (Campaigns, Approvals, Creators, Budget)
- ✅ Displays three quick action buttons
- ✅ Shows system status section
- ✅ Displays campaign manager role
- ✅ Shows correct initial stat values

#### Supabase Client (`src/lib/__tests__/supabase.test.ts`)
- ✅ Creates Supabase client
- ✅ Handles environment variables
- ✅ Exports client correctly

### E2E Tests (Playwright)

#### Dashboard E2E (`e2e/dashboard.spec.ts`)
- ✅ Full page render validation
- ✅ All UI elements visible
- ✅ Quick action buttons interaction
- ✅ System status display
- ✅ Responsive layout check

#### Home Page E2E (`e2e/home.spec.ts`)
- ✅ Home page display
- ✅ Navigation to dashboard
- ✅ Styling verification

## 🎯 What to Test Next

### 1. Authentication & Authorization
```bash
# Future tests to add
- User login flow
- User registration
- Role-based access control (Campaign Manager, Director, Finance, etc.)
- Session management
- Protected routes
```

### 2. Campaign Management
```bash
# Once campaign features are built
- Create new campaign
- Edit campaign details
- View campaign list
- Filter campaigns by status
- Campaign state transitions
- Campaign deletion
```

### 3. Database Integration
```bash
# Supabase integration tests
- CRUD operations for campaigns
- CRUD operations for clients
- CRUD operations for users
- Real-time subscriptions
- Row Level Security (RLS) policies
```

### 4. AI Features
```bash
# When AI features are implemented
- Brief parsing with Gemini API
- Strategy generation
- Learning extraction
- Error handling for API failures
```

### 5. Form Validation
```bash
# Form testing
- Campaign creation form
- Client creation form
- User profile form
- Input validation
- Error message display
```

### 6. API Routes
```bash
# tRPC API testing
- Campaign router endpoints
- Client router endpoints
- User router endpoints
- Error handling
- Authentication middleware
```

### 7. Mobile App (Future)
```bash
# React Native tests
- Component rendering
- Navigation
- Cross-platform compatibility
```

## 🚀 Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test:unit src/app/__tests__/page.test.tsx
```

### E2E Tests
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific E2E test
pnpm test:e2e e2e/dashboard.spec.ts
```

### All Tests
```bash
# Run all tests (unit + E2E)
pnpm test
```

## 📊 Test Coverage

Current coverage:
- **Unit Tests**: 15/15 passing ✅
- **E2E Tests**: Ready to run (requires dev server)

Target coverage goals:
- **Statement Coverage**: 80%+
- **Branch Coverage**: 75%+
- **Function Coverage**: 80%+
- **Line Coverage**: 80%+

## 🔧 Testing Best Practices

### 1. Write Tests First (TDD)
When adding new features:
1. Write the test first
2. Watch it fail
3. Implement the feature
4. Watch the test pass
5. Refactor if needed

### 2. Test Organization
- Keep tests close to the code (`__tests__` folder)
- One test file per component/module
- Use descriptive test names
- Group related tests with `describe` blocks

### 3. Test Naming
```typescript
// ✅ Good
it('should display error message when form is invalid')

// ❌ Bad
it('test1')
```

### 4. Arrange-Act-Assert Pattern
```typescript
it('should increment counter', () => {
  // Arrange
  render(<Counter initialValue={0} />)
  
  // Act
  fireEvent.click(screen.getByRole('button', { name: /increment/i }))
  
  // Assert
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### 5. Mock External Dependencies
- Mock Supabase calls
- Mock API requests
- Mock environment variables
- Use test data fixtures

## 📝 Example: Adding a New Test

When you add a new component, create a test file:

```typescript
// src/components/CampaignCard/__tests__/CampaignCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CampaignCard from '../CampaignCard'

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    const campaign = {
      id: '1',
      name: 'Summer Campaign',
      status: 'active'
    }
    
    render(<CampaignCard campaign={campaign} />)
    
    expect(screen.getByText('Summer Campaign')).toBeInTheDocument()
  })

  it('displays campaign status badge', () => {
    const campaign = {
      id: '1',
      name: 'Summer Campaign',
      status: 'active'
    }
    
    render(<CampaignCard campaign={campaign} />)
    
    expect(screen.getByText('active')).toBeInTheDocument()
  })
})
```

## 🐛 Debugging Tests

### Unit Tests
```bash
# Run tests with verbose output
pnpm test:unit --reporter=verbose

# Debug specific test
pnpm test:unit --grep "should display error message"

# Update snapshots
pnpm test:unit -u
```

### E2E Tests
```bash
# Run with headed browser (see what's happening)
pnpm test:e2e --headed

# Debug mode
pnpm test:e2e --debug

# Generate trace
pnpm test:e2e --trace on
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 Next Steps

1. **Run the existing tests** to verify everything works
2. **Add tests for new features** as you build them
3. **Increase test coverage** to 80%+
4. **Set up CI/CD** to run tests automatically
5. **Add visual regression tests** for UI components
6. **Implement integration tests** for database operations

---

**Last Updated**: February 2026  
**Test Status**: ✅ 15/15 unit tests passing  
**Coverage**: Basic foundation established
