import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import SetupPage from "../setup/page";
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

describe("SetupPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <SessionProvider>
        <SetupPage />
      </SessionProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
