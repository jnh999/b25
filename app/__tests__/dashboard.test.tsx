import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("DashboardPage", () => {
  it("renders DashboardPage component", async () => {
    render(
      <SessionProvider>
        <DashboardPage />
      </SessionProvider>
    );

    await screen.findByText("Your Balances");
  });
});
