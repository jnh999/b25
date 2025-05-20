import React from "react";
import { render, waitFor, screen, act } from "@testing-library/react";
import { axe } from "jest-axe";
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

describe("IssuerDetailsPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const paramsPromise = Promise.resolve({ tokenPubKey: "test-token-key" });
    let container: HTMLElement | null = null;

    await act(async () => {
      const { container: renderedContainer } = render(
        <IssuerDetailsPage params={paramsPromise} />
      );
      container = renderedContainer;
    });

    if (!container) {
      throw new Error("Container was not initialized");
    }

    // Wait for loading state to finish and content to be rendered
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: "Token Details" })
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
