# Mobile App Testing Guide

Complete guide for testing the PrecisionFlow mobile application.

## Testing Stack

- **Framework:** Jest
- **Component Testing:** React Native Testing Library
- **API Mocking:** MSW (Mock Service Worker) / Manual mocks
- **E2E Testing:** Detox (planned)
- **Coverage Tool:** Jest coverage

## Setup

### Install Dependencies

```bash
cd apps/mobile
pnpm install --dev @testing-library/react-native @testing-library/jest-native jest-expo
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

### Test Setup File

```javascript
// jest-setup.js
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock expo modules
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

## Test Types

### 1. Unit Tests

Test individual components in isolation.

**Example: Testing a component**
```tsx
// __tests__/components/CampaignCard.test.tsx
import { render, screen } from '@testing-library/react-native';
import { CampaignCard } from '../CampaignCard';

describe('CampaignCard', () => {
  const mockCampaign = {
    id: '1',
    name: 'Test Campaign',
    client: { name: 'Test Client' },
    status: 'active',
  };

  it('renders campaign information', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText('Test Campaign')).toBeTruthy();
    expect(screen.getByText('Test Client')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<CampaignCard campaign={mockCampaign} onPress={onPress} />);
    
    fireEvent.press(screen.getByTestId('campaign-card'));
    expect(onPress).toHaveBeenCalledWith(mockCampaign);
  });
});
```

### 2. Screen Tests

Test complete screens with mocked data.

**Example: Testing a screen**
```tsx
// __tests__/screens/CampaignsList.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native';
import { TRPCProvider } from '@/lib/trpc';
import CampaignsScreen from '@/app/(tabs)/campaigns';

const mockCampaigns = [
  { id: '1', name: 'Campaign 1', status: 'active' },
  { id: '2', name: 'Campaign 2', status: 'draft' },
];

jest.mock('@/lib/trpc', () => ({
  trpc: {
    campaigns: {
      list: {
        useQuery: () => ({
          data: { campaigns: mockCampaigns },
          isLoading: false,
          refetch: jest.fn(),
        }),
      },
    },
  },
}));

describe('CampaignsScreen', () => {
  it('displays list of campaigns', async () => {
    render(<CampaignsScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeTruthy();
      expect(screen.getByText('Campaign 2')).toBeTruthy();
    });
  });

  it('shows empty state when no campaigns', async () => {
    jest.mock('@/lib/trpc', () => ({
      trpc: {
        campaigns: {
          list: {
            useQuery: () => ({
              data: { campaigns: [] },
              isLoading: false,
            }),
          },
        },
      },
    }));

    render(<CampaignsScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('No campaigns found')).toBeTruthy();
    });
  });
});
```

### 3. Integration Tests

Test workflows across multiple components/screens.

**Example: Login flow**
```tsx
// __tests__/integration/auth-flow.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/lib/auth';
import LoginScreen from '@/app/(auth)/login';

describe('Authentication Flow', () => {
  it('logs in user and redirects to dashboard', async () => {
    const { getByPlaceholder, getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    // Enter credentials
    fireEvent.changeText(getByPlaceholder('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholder('Password'), 'password123');

    // Submit form
    fireEvent.press(getByText('Login'));

    // Wait for redirect
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows error on invalid credentials', async () => {
    // Mock failed login
    jest.mock('@/lib/trpc', () => ({
      trpc: {
        auth: {
          login: {
            useMutation: () => ({
              mutateAsync: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
            }),
          },
        },
      },
    }));

    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

### 4. Navigation Tests

Test navigation flows.

**Example:**
```tsx
// __tests__/navigation.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

describe('Navigation', () => {
  it('navigates from campaigns list to campaign detail', () => {
    const { getByTestId } = render(<CampaignsScreen />);
    
    fireEvent.press(getByTestId('campaign-1'));
    
    expect(router.push).toHaveBeenCalledWith('/campaigns/1');
  });

  it('navigates back from campaign detail', () => {
    const { getByText } = render(<CampaignDetail />);
    
    fireEvent.press(getByText('Back'));
    
    expect(router.back).toHaveBeenCalled();
  });
});
```

## Mocking Utilities

### Mock tRPC Queries

```tsx
// __tests__/utils/mock-trpc.ts
export const mockTRPCQuery = (data: any, options = {}) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  ...options,
});

export const mockTRPCMutation = (options = {}) => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  error: null,
  ...options,
});
```

### Mock Auth Context

```tsx
// __tests__/utils/mock-auth.tsx
export const MockAuthProvider = ({ children, user = null }) => {
  const value = {
    user,
    token: user ? 'mock-token' : null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run in watch mode
pnpm test --watch

# Run specific test file
pnpm test CampaignCard.test.tsx

# Update snapshots
pnpm test -u
```

## Coverage Requirements

- **Statements:** >80%
- **Branches:** >80%
- **Functions:** >80%
- **Lines:** >80%

## Best Practices

1. **Test user behavior, not implementation**
2. **Use accessible queries** (getByText, getByRole)
3. **Mock external dependencies**
4. **Test error states**
5. **Test loading states**
6. **Use waitFor for async operations**
7. **Keep tests focused and simple**
8. **Use descriptive test names**

## Common Patterns

### Testing Async Data Loading

```tsx
it('shows loading state', () => {
  render(<CampaignsScreen />);
  expect(screen.getByTestId('loading')).toBeTruthy();
});

it('displays data after loading', async () => {
  render(<CampaignsScreen />);
  await waitFor(() => {
    expect(screen.getByText('Campaign 1')).toBeTruthy();
  });
});
```

### Testing Forms

```tsx
it('validates form inputs', async () => {
  const { getByPlaceholder, getByText } = render(<CreateCampaignForm />);
  
  fireEvent.press(getByText('Submit'));
  
  await waitFor(() => {
    expect(getByText('Name is required')).toBeTruthy();
  });
});
```

### Testing Pull-to-Refresh

```tsx
it('refreshes data on pull-to-refresh', async () => {
  const refetch = jest.fn();
  const { getByTestId } = render(<CampaignsScreen />);
  
  const scrollView = getByTestId('campaigns-scroll');
  fireEvent(scrollView, 'refresh');
  
  await waitFor(() => {
    expect(refetch).toHaveBeenCalled();
  });
});
```

---

**Last Updated:** February 8, 2026  
**Status:** Testing infrastructure defined, ready for implementation
