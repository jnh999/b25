import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import SettingsPage from "../settings/page";
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

// Mock fetch for user data
const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
  xHandle: "@testuser",
  region: "US",
  registeredAt: new Date().toISOString(),
};

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockUser),
  })
);

describe("SettingsPage accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have no a11y violations", async () => {
    // Render the component
    const { container } = render(
      <SessionProvider>
        <SettingsPage />
      </SessionProvider>
    );

    // Wait for data fetching and state updates to complete
    await act(async () => {
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /settings/i })
        ).toBeInTheDocument();
      });
    });

    // Run accessibility checks
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  }, 30000);
});
