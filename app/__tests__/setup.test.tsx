import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("SetupPage", () => {
  it("renders SetupPage component", () => {
    render(
      <SessionProvider>
        <SetupPage />
      </SessionProvider>
    );
    expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
  });
});
