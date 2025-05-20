import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import IssuerDetailsPage from "../issuers/[tokenPubKey]/page";

// Mock fetch
const mockIssuer = {
  tokenPubKey: "test-token-key",
  tokenName: "Test Token",
  tokenTicker: "TEST",
  decimals: 6,
  maxSupply: "1000000",
  isFreezable: true,
  isWebsiteVerified: true,
  iconUrl: null,
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockIssuer),
  })
) as jest.Mock;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe("IssuerDetailsPage", () => {
  it("renders IssuerDetailsPage component", async () => {
    const paramsPromise = Promise.resolve({ tokenPubKey: "test-token-key" });

    await act(async () => {
      render(<IssuerDetailsPage params={paramsPromise} />);
    });

    // Wait for loading state to finish and content to be rendered
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: "Token Details" })
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Now that we know the component has rendered, we can check other elements
    expect(screen.getByText("Token Public Key")).toBeInTheDocument();
    expect(screen.getByText("Decimals")).toBeInTheDocument();
    expect(screen.getByText("Max Supply")).toBeInTheDocument();
  });
});
