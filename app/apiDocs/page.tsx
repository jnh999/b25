"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { endpoints, Endpoint } from "./endpoints";
import { ExpandableTextFullPage } from "@/lib/styleguide/expandableTextFull";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Spark API</h1>
          <p className="text-lg text-gray-600">
            Public API endpoints for integrating with Spark
          </p>
        </div>

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200 mb-8">
          {endpoints.map((endpoint: Endpoint, index: number) => (
            <div
              key={index}
              className="p-6"
              id={endpoint.path.slice(1).replace(/[^a-zA-Z0-9]/g, "-")}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      endpoint.method === "GET"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {endpoint.method}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {endpoint.path}
                  </h2>
                  <p className="text-gray-600 mb-4">{endpoint.description}</p>
                  {endpoint.queryParams && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Query Parameters
                      </h3>
                      <div className="space-y-2">
                        {endpoint.queryParams.map(
                          (param: { name: string; description: string }) => (
                            <div
                              key={param.name}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="font-mono text-primary">
                                {param.name}
                              </span>
                              <span className="text-gray-600">
                                - {param.description}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {endpoint.example && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          Example Request
                        </h3>
                        <ExpandableTextFullPage
                          text={endpoint.example.request}
                          label="Request URL"
                          type="text"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          Example Response
                        </h3>
                        <ExpandableTextFullPage
                          text={endpoint.example.response}
                          label="Response JSON"
                          type="text"
                          showCopyButton={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Merkle Tree Attestation Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Merkle Tree Attestations
          </h2>
          <p className="text-gray-600 mb-4">
            Spark regularly publishes Merkle tree attestations of our
            liabilities and reserves on Bitcoin testnet4. These attestations
            provide cryptographic proof of our solvency and can be independently
            verified.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Latest Attestation
              </h3>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs font-medium text-green-700">
                  Verified
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Transaction ID:{" "}
              <a
                href="https://mempool.space/testnet4/tx/6137554ca2c87793fb69e566fe6c2c92e45740218f47c923b958e5b4beaedc1a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                6137554ca2c87793fb69e566fe6c2c92e45740218f47c923b958e5b4beaedc1a
              </a>
            </p>
            <p className="text-sm text-gray-500">Published: May 19, 2025</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verification
            </h3>
            <p className="text-gray-600 mb-4">
              You can verify our attestations using our open-source verification
              script or through our API. The verification process checks:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Transaction confirmation on Bitcoin testnet4</li>
              <li>
                Merkle root matching between transaction and stored snapshot
              </li>
              <li>Validation of all leaves in the Merkle tree</li>
            </ul>
            <p className="text-gray-600">
              Source code:{" "}
              <a
                href="https://raw.githubusercontent.com/jacknhudson/sparkx/refs/heads/main/lib/services/proof/merkle.ts?token=GHSAT0AAAAAADDXTPNP2LTI4ZQC3ER4COHA2BLLTLQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                merkle.ts
              </a>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Token Circulation Stats
            </h3>
            <p className="text-gray-600 mb-4">
              For detailed information about token circulation and distribution,
              visit our{" "}
              <Link
                href="/issuers"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Issuers Directory
              </Link>
              . The directory provides:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Total supply and circulation for each token</li>
              <li>Token metadata and issuer verification status</li>
            </ul>
            <p className="text-gray-600">
              You can also access this data programmatically through our{" "}
              <a
                href="#api-issuers"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Issuers API endpoints
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
