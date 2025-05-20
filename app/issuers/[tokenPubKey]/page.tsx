"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

interface Issuer {
  tokenPubKey: string;
  tokenName: string;
  tokenTicker: string;
  decimals: number;
  maxSupply: string;
  isFreezable: boolean;
  isWebsiteVerified: boolean;
  iconUrl: string | null;
  announcementTx?: string;
}

export default function IssuerDetailsPage({
  params,
}: {
  params: Promise<{ tokenPubKey: string }>;
}) {
  const [tokenPubKey, setTokenPubKey] = useState<string | null>(null);
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle params Promise
  useEffect(() => {
    params.then(({ tokenPubKey }) => {
      setTokenPubKey(tokenPubKey);
    });
  }, [params]);

  // Fetch issuer data when tokenPubKey is available
  useEffect(() => {
    if (!tokenPubKey) return;

    async function fetchIssuer() {
      try {
        const response = await fetch(`/api/issuers/${tokenPubKey}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch issuer");
        }
        const data = await response.json();
        setIssuer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchIssuer();
  }, [tokenPubKey]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !issuer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          {error || "Failed to load issuer details"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/issuers"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Issuers
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 relative">
          {issuer.iconUrl ? (
            <Image
              src={`/tokens/${issuer.iconUrl}`}
              alt={`${issuer.tokenName} icon`}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-2xl">
                {issuer.tokenTicker[0]}
              </span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{issuer.tokenName}</h1>
          <p className="text-gray-600">{issuer.tokenTicker}</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Token Details Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Token Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-3">Token Public Key</p>
                <p className="font-mono text-sm break-all">
                  {issuer.tokenPubKey}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Decimals</p>
                <p>{issuer.decimals}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 capitalize-first">
                  Max Supply
                </p>
                <p>
                  {issuer.maxSupply === "unlimited"
                    ? "Unlimited"
                    : issuer.maxSupply}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 capitalize-first">
                  Freezable
                </p>
                <p>{issuer.isFreezable ? "Yes" : "No"}</p>
              </div>
            </div>
            {issuer.announcementTx && (
              <div>
                <p className="text-sm text-gray-500">
                  Announcement Transaction
                </p>
                <p className="font-mono text-sm break-all">
                  {issuer.announcementTx}
                </p>
              </div>
            )}
            <div className="pt-4 flex items-center gap-4">
              <a
                href={`https://www.sparkscan.io/token/${issuer.tokenPubKey}?network=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Spark Explorer →
              </a>
              <a
                href={`/api/issuers/${issuer.tokenPubKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on public API →
              </a>
            </div>
          </div>
        </section>

        {/* Proof of Reserves Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Proof of Reserves</h2>

          {/* Balance Subsection */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium">Balance</h3>
                {issuer.isWebsiteVerified && (
                  <svg
                    className="w-5 h-5 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
              <a
                href={`https://www.sparkscan.io/token/${issuer.tokenPubKey}?network=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors min-w-[180px] inline-block text-center"
              >
                Verify Balance
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Reserves</p>
                <p className="text-2xl font-semibold">$0.00</p>
              </div>
            </div>
          </div>

          {/* Circulation Subsection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium">Circulation</h3>
                {issuer.isWebsiteVerified && (
                  <svg
                    className="w-5 h-5 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
              <a
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors min-w-[180px] inline-block text-center"
                href={`https://www.sparkscan.io/token/${issuer.tokenPubKey}?network=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify Circulation
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Supply</p>
                <p className="text-2xl font-semibold">0 {issuer.tokenTicker}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Proof of Bank Reserves Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Proof of Bank Reserves
          </h2>
          <p className="mb-4 text-gray-700">
            You can independently verify this issuer's bank reserves by querying
            their Stripe account balance using the public API. This provides
            transparency into the fiat reserves backing the token.
          </p>
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-900 mb-2">
              Example API Call
            </span>
            <pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto">
              {`curl https://api.stripe.com/v1/balance \\
  -u "rk_test_51O5DRcKkDsSWJkFw8dT5souNMbA5ZVJkqs68sjGKcFn2k6kt4XeLq91d0Uf3WJ8aFbKI2Dpw5IYr6rlvm5JIiHGg00W7N6tSl8:"`}
            </pre>
          </div>
          <p className="text-gray-600 text-sm">
            This command returns the current available and pending balances in
            the issuer's Stripe account. Look for the <code>available</code>{" "}
            field in the JSON response to see the up-to-date fiat reserves.
          </p>
        </section>
      </div>
    </div>
  );
}
