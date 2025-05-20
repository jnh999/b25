import "jest-axe/extend-expect";
import "@testing-library/jest-dom";
import { User } from "@prisma/client";

// Configure React testing environment
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "The current testing environment is not configured to support act(...)"
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock useCurrentUser hook
jest.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: {
      id: "test-user-id",
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      isXVerified: true,
      isPublic: true,
      role: "USER",
      registeredAt: new Date(),
      stripeCustomerId: "test-customer-id",
    } as User,
    loading: false,
    isAuthenticated: true,
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock requestIdleCallback
Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: (cb: () => void) => setTimeout(cb, 0),
});

// Mock cancelIdleCallback
Object.defineProperty(window, "cancelIdleCallback", {
  writable: true,
  value: (id: number) => clearTimeout(id),
});
