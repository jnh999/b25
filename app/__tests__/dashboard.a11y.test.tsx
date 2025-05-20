import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import DashboardPage from "../dashboard/page";
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

// Mock fetch for dashboard data
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes("/api/balances")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            asset: "USD",
            amount: "1000.00",
            type: "fiat",
          },
          {
            asset: "BTC",
            amount: "0.1",
            type: "crypto",
          },
        ]),
    });
  }

  if (url.includes("/api/transactions")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "1",
            type: "DEPOSIT",
            amount: "100.00",
            asset: "USD",
            createdAt: new Date().toISOString(),
          },
        ]),
    });
  }

  return Promise.reject(new Error("Not found"));
});

describe("DashboardPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <SessionProvider>
        <DashboardPage />
      </SessionProvider>
    );

    // Wait for the data to load before running accessibility checks
    await screen.findByText("Your Balances");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
