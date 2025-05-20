import React from "react";
import { render, screen } from "@testing-library/react";
import ApiDocsPage from "@/app/apiDocs/page";
import { endpoints } from "../apiDocs/endpoints";

describe("ApiDocsPage", () => {
  for (const endpoint of endpoints) {
    it(`renders with correct details for ${endpoint.path}`, () => {
      render(<ApiDocsPage />);
      expect(screen.getByText(endpoint.description)).toBeInTheDocument();
    });
  }
});
