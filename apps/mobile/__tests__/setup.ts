import { vi } from 'vitest';

// Mock expo-secure-store
vi.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    setItemAsync: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItemAsync: vi.fn(async (key: string) => {
      return store[key] || null;
    }),
    deleteItemAsync: vi.fn(async (key: string) => {
      delete store[key];
    }),
  };
});

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));
