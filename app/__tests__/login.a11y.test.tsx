import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import LoginPage from "../login/page";
import { SessionProvider } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("LoginPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <SessionProvider>
        <LoginPage />
      </SessionProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
