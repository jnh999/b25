import React from "react";
import { render, screen } from "@testing-library/react";
import RequestPage from "../request/[invoice]/page";
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

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: () => ({
    invoice: "test-invoice-id",
  }),
}));

// Mock fetch for invoice data
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        invoice: "abc",
        destinationUser: {
          username: "a",
          isXVerified: true,
          name: "abc",
          email: "b",
          password: "c",
          role: "USER",
          isPublic: true,
          registeredAt: new Date(),
          region: "US",
          isWebsiteVerified: false,
          id: "123",
          stripeCustomerId: "abc",
          stripePaymentId: "abc",
          stripePaymentType: "US_BANK_ACCOUNT",
          profilePicUrl: "abc",
          xHandle: "jack",
          websiteUrl: "jack.com",
          notificationThreshold: 0,
          sparkIssuerId: "abc",

          lightningInvoice: "abc",
          sparkAddress: "abc",
        },
        decoded: {
          asset: "BTC",
          description: "abc",
          timestamp: 1919191,
          hrp: "abc",
          amount: "123",
        },
      }),
  })
);

describe("RequestPage", () => {
  it("renders RequestPage component", async () => {
    render(
      <SessionProvider>
        <RequestPage />
      </SessionProvider>
    );
    expect(await screen.findByText("Amount")).toBeInTheDocument();
    expect(await screen.findByText("Description")).toBeInTheDocument();
    expect(await screen.findByText("Created")).toBeInTheDocument();
    expect(await screen.findByText("Lightning Invoice")).toBeInTheDocument();
  });
});
