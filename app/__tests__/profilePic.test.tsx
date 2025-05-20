import React from "react";
import { render, screen } from "@testing-library/react";
import { ProfilePic } from "../components/ProfilePic";

describe("ProfilePic", () => {
  it("renders Profile Pic component", () => {
    const user: any = { name: "Ben", profilePicUrl: "bitcoin-ben.png" };
    render(<ProfilePic user={user} />);
    expect(screen.getByAltText("Ben's profile picture")).toBeInTheDocument();
  });
});
