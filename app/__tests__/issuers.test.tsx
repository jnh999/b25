import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import IssuersPage from "../issuers/page";

// Mock the fetch function
global.fetch = jest.fn();

describe("IssuersPage", () => {
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
  });

  it("renders loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<IssuersPage />);
    expect(screen.getByText("Spark Issuers")).toBeInTheDocument();
    // Check for skeleton UI elements
    const skeletonItems = document.querySelectorAll(".animate-pulse");
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it("renders issuers when data is loaded", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockIssuers,
    });

    render(<IssuersPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Token")).toBeInTheDocument();
      expect(screen.getByText("TEST")).toBeInTheDocument();
      expect(screen.getByText("Supported")).toBeInTheDocument();
    });
  });

  it("renders error state when API call fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<IssuersPage />);

    await waitFor(() => {
      expect(screen.getByText("Error: API Error")).toBeInTheDocument();
    });
  });
});
