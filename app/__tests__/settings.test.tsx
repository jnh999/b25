import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import SettingsPage from "../settings/page";
import * as nextNavigation from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("SettingsPage", () => {
  const mockUser = {
    id: "test-user-id",
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    xHandle: "testhandle",
    region: "US",
    registeredAt: new Date().toISOString(),
    sparkWallet: {
      address: "test-address",
    },
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    await act(async () => {
      render(<SettingsPage />);
    });

    expect(screen.getByText("Settings")).toBeInTheDocument();
    // Check for skeleton UI elements
    const skeletonItems = document.querySelectorAll(".animate-pulse");
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it("renders user data when loaded", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    await act(async () => {
      render(<SettingsPage />);
    });

    // Wait for all content to be loaded
    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Profile Details")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("@testuser")).toBeInTheDocument();
      expect(screen.getByText("@testhandle")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("redirects to login when unauthorized", async () => {
    const mockPush = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    (nextNavigation.useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }));

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(<SettingsPage />);
    });

    expect(await screen.findByText("Error: API Error")).toBeInTheDocument();
  });
});
