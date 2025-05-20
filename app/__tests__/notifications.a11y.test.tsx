import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
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
const mockNotifications = [
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
];

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockNotifications),
  })
);

describe("NotificationsPage accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have no a11y violations", async () => {
    // Render the component
    const { container } = render(
      <SessionProvider>
        <NotificationsPage />
      </SessionProvider>
    );

    // Wait for the component to load and render
    await screen.findByText("Notifications", {}, { timeout: 10000 });

    // Run accessibility checks
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  }, 15000);
});
