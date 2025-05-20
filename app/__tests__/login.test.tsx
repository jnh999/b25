import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("LoginPage", () => {
  it("renders LoginPage component", () => {
    render(
      <SessionProvider>
        <LoginPage />
      </SessionProvider>
    );
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });
});
