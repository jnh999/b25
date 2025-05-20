import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
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

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    // Mock fetch to never resolve to keep loading state
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(
        <SessionProvider>
          <UsersPage />
        </SessionProvider>
      );
    });

    // Check for skeleton elements
    expect(
      screen.queryByRole("heading", { name: /users/i })
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton")).toHaveLength(8); // 1 title + 1 search + 6 user cards
  });

  it("renders users when data is loaded", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
    );

    await act(async () => {
      render(
        <SessionProvider>
          <UsersPage />
        </SessionProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test User 1")).toBeInTheDocument();
      expect(screen.getByText("Test User 2")).toBeInTheDocument();
    });
  });

  it("renders error state when API call fails", async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("API Error")));

    await act(async () => {
      render(
        <SessionProvider>
          <UsersPage />
        </SessionProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });
});
