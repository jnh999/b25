import React from "react";
import { render, screen, act } from "@testing-library/react";
import NotificationsPage from "../notifications/page";
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

// Mock fetch for notifications data
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: "1",
          type: "PAYMENT_RECEIVED",
          message: "Payment received",
          createdAt: new Date().toISOString(),
          read: false,
          amount: "100.00",
          currency: "USD",
          description: "Test payment request",
          status: "PENDING",
          receivingUser: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
          },
          requestingUser: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ]),
  })
);

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders NotificationsPage component", async () => {
    render(
      <SessionProvider>
        <NotificationsPage />
      </SessionProvider>
    );

    // Wait for the component to load and render
    const notificationsTitle = await screen.findByText(
      "Notifications",
      {},
      { timeout: 10000 }
    );
    expect(notificationsTitle).toBeInTheDocument();
  }, 15000); // Increased timeout for the entire test
});
