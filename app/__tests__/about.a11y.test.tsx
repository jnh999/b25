import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { SessionProvider } from "next-auth/react";
import AboutPage from "../about/page";

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

describe("AboutPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <SessionProvider>
        <AboutPage />
      </SessionProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
