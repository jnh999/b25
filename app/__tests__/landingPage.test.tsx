import React from "react";
import { render, screen } from "@testing-library/react";
import LandingPage from "../page";
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

describe("LandingPage", () => {
  it("renders LandingPage component", () => {
    render(
      <SessionProvider>
        <LandingPage />
      </SessionProvider>
    );
    expect(screen.getByText("Global Finance, Reimagined.")).toBeInTheDocument();
    expect(
      screen.getByAltText("Colorful finance illustration")
    ).toBeInTheDocument();
  });
});
