import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global store for tRPC mock data — set by renderWithProviders
(globalThis as any).__trpcMockData = {};

// Helper to create a mock hook that returns data from the global store
function createMockQueryHook(path: string[]) {
  return (input?: any, options?: any) => {
    // If explicitly disabled, return loading with no data
    if (options && options.enabled === false) {
      return { data: undefined, isLoading: false, error: null, isError: false, refetch: vi.fn() };
    }
    const mockData = (globalThis as any).__trpcMockData;
    let value: any = mockData;
    for (const key of path) {
      value = value?.[key];
    }
    if (value && typeof value === 'object' && 'error' in value) {
      return { data: undefined, isLoading: false, error: value.error, isError: true, refetch: vi.fn() };
    }
    return { data: value, isLoading: value === undefined, error: null, isError: false, refetch: vi.fn() };
  };
}

function createMockMutationHook(path: string[]) {
  return (options?: any) => {
    const mockData = (globalThis as any).__trpcMockData;
    let value: any = mockData;
    for (const key of path) {
      value = value?.[key];
    }
    // If value is a function, use it as the mutate function
    if (typeof value === 'function') {
      return {
        mutateAsync: value,
        mutate: value,
        isLoading: false,
        isPending: false,
        error: null,
      };
    }
    // If value has an error property, simulate error behavior
    if (value && typeof value === 'object' && 'error' in value) {
      const mutate = (...args: any[]) => {
        if (options?.onError) options.onError(value.error);
      };
      return {
        mutateAsync: mutate,
        mutate,
        isLoading: false,
        isPending: false,
        error: value.error,
      };
    }
    const noop = vi.fn();
    return {
      mutateAsync: noop,
      mutate: noop,
      isLoading: false,
      isPending: false,
      error: null,
    };
  };
}

// Create a proxy that maps trpc.X.Y.useQuery to createMockQueryHook(['X', 'Y'])
function createTrpcProxy(path: string[] = []): any {
  return new Proxy({}, {
    get(_, prop: string) {
      if (prop === 'useQuery') return createMockQueryHook(path);
      if (prop === 'useMutation') return createMockMutationHook(path);
      return createTrpcProxy([...path, prop]);
    },
  });
}

// Mock tRPC module
vi.mock('@/lib/trpc', () => ({
  trpc: createTrpcProxy(),
}));

// Mock Toast provider
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }: any) => children,
}));

// Mock brief components used in campaign detail page
vi.mock('@/components/briefs/BriefUploadModal', () => ({
  BriefUploadModal: () => null,
}));

vi.mock('@/components/briefs/BriefViewer', () => ({
  BriefViewer: () => null,
}));

// Mock Supabase browser client (used by auth-provider and trpc-provider)
vi.mock('@/lib/supabase-browser', () => ({
  supabaseBrowser: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock auth provider
vi.mock('@/lib/auth-provider', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
