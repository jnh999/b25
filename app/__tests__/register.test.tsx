import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../register/page";
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

describe("RegisterPage", () => {
  it("renders RegisterPage component", () => {
    render(
      <SessionProvider>
        <RegisterPage />
      </SessionProvider>
    );
    expect(
      screen.getByText(
        "To streamline the hackathon demo, please use these test account credentials:"
      )
    ).toBeInTheDocument();
  });
});
