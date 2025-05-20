import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("AboutPage", () => {
  it("renders AboutPage component", () => {
    render(
      <SessionProvider>
        <AboutPage />
      </SessionProvider>
    );
    expect(
      screen.getByText("Building the Future of Global Finance")
    ).toBeInTheDocument();
  });
});
