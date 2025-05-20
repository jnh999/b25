import React from "react";
import { render, waitFor, screen, act } from "@testing-library/react";
import { axe } from "jest-axe";
import UserDetailsPage from "../users/[id]/page";

// Mock fetch
const mockUser = {
  id: "test-user-id",
  name: "Test User",
  username: "testuser",
  profilePicUrl: null,
  isXVerified: true,
  xHandle: "testuser",
  sparkWallet: {
    address: "test-address",
  },
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockUser),
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

describe("UserDetailsPage accessibility", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("should have no a11y violations", async () => {
    const paramsPromise = Promise.resolve({ id: "test-user-id" });
    let container: HTMLElement | null = null;

    await act(async () => {
      const { container: renderedContainer } = render(
        <UserDetailsPage params={paramsPromise} />
      );
      container = renderedContainer;
    });

    if (!container) {
      throw new Error("Container was not initialized");
    }

    // Wait for loading state to finish and content to be rendered
    await waitFor(
      () => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));
    const paramsPromise = Promise.resolve({ id: "test-user-id" });

    await act(async () => {
      render(<UserDetailsPage params={paramsPromise} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
