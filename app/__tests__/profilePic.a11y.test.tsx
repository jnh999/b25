import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProfilePic } from "../components/ProfilePic";

describe("ProfilePic accessibility", () => {
  it("should have no a11y violations", async () => {
    const user: any = { name: "Ben", profilePicUrl: "bitcoin-ben.png" };
    const { container } = render(<ProfilePic user={user} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
