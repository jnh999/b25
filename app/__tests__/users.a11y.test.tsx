import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import UsersPage from "../users/page";
import { SessionProvider } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
      },
    },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock fetch for users data
const mockUsers = [
  {
    id: "user-1",
    name: "Test User 1",
    email: "test1@example.com",
    username: "testuser1",
    isXVerified: true,
    sparkWallet: {
      address: "test-address-1",
    },
  },
  {
    id: "user-2",
    name: "Test User 2",
    email: "test2@example.com",
    username: "testuser2",
    isXVerified: false,
    sparkWallet: {
      address: "test-address-2",
    },
  },
];

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockUsers),
  })
);

describe("UsersPage accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have no a11y violations", async () => {
    const { container } = render(
      <SessionProvider>
        <UsersPage />
      </SessionProvider>
    );

    // Wait for the component to load and render
    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
    });

    // Run accessibility checks
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
