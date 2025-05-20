import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import UserDetailsPage from "../users/[id]/page";

// Mock fetch
const mockUser = {
  id: "test-user-id",
  name: "Test User",
  username: "testuser",
  profilePicUrl: null,
  isXVerified: true,
  xHandle: "testhandle",
  sparkWalletAddress: "test-address",
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

describe("UserDetailsPage", () => {
  it("renders UserDetailsPage component", async () => {
    const paramsPromise = Promise.resolve({ id: "test-user-id" });

    await act(async () => {
      render(<UserDetailsPage params={paramsPromise} />);
    });

    // Wait for loading state to finish and content to be rendered
    await waitFor(
      () => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Now that we know the component has rendered, we can check other elements
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("Profile Details")).toBeInTheDocument();
    expect(screen.getByText("X Profile")).toBeInTheDocument();
    expect(screen.getByText("@testhandle")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("test-address")).toBeInTheDocument();
  });
});
