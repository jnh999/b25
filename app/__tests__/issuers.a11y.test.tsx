import React from "react";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import IssuersPage from "../issuers/page";

// Mock the fetch function
global.fetch = jest.fn();

describe("IssuersPage accessibility", () => {
  const mockIssuers = [
    {
      id: "1",
      tokenName: "Test Token",
      tokenTicker: "TEST",
      iconUrl: null,
      isWebsiteVerified: true,
      isFreezable: true,
      websiteUrl: "https://test.com",
      tokenPubKey: "test123",
    },
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIssuers,
    });
  });

  it("should have no a11y violations", async () => {
    const { container } = render(<IssuersPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(container.querySelector("h1")).toHaveTextContent("Spark Issuers");
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
