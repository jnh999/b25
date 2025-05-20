"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Issuer {
  id: string;
  tokenName: string;
  tokenTicker: string;
  iconUrl: string | null;
  isWebsiteVerified: boolean;
  isFreezable: boolean;
  websiteUrl: string | null;
  tokenPubKey: string | null;
}

export default function IssuersPage() {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const response = await fetch("/api/issuers");
        if (!response.ok) {
          throw new Error("Failed to fetch issuers");
        }
        const data = await response.json();
        setIssuers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssuers();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Spark Issuers</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center p-4">
                <Skeleton className="w-12 h-12 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24 mt-2" />
                  <Skeleton className="h-3 w-40 mt-2" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Spark Issuers</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Spark Issuers</h1>
      </div>
      <div className="grid gap-6">
        {issuers.map((issuer) =>
          issuer.isWebsiteVerified ? (
            <Link
              key={`${issuer.tokenName}-${issuer.id}`}
              href={`/issuers/${issuer.tokenPubKey}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-4">
                  <div className="w-12 h-12 relative mr-4">
                    {issuer.iconUrl ? (
                      <Image
                        src={`/tokens/${issuer.iconUrl}`}
                        alt={`${issuer.tokenName} icon`}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-lg">
                          {issuer.tokenTicker[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {issuer.tokenName}
                      </h2>
                      <div className="flex items-center gap-1 text-green-600">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="text-sm font-medium">Supported</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{issuer.tokenTicker}</p>
                    {issuer.tokenPubKey && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {issuer.tokenPubKey.slice(0, 8)}...
                        {issuer.tokenPubKey.slice(-8)}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-4">
                    {issuer.websiteUrl && (
                      <Button
                        variant="link"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (issuer.websiteUrl) {
                            window.open(
                              issuer.websiteUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Website
                      </Button>
                    )}
                    {issuer.isWebsiteVerified && (
                      <svg
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.29 6.71C8.9 7.1 8.9 7.73 9.29 8.12L13.17 12L9.29 15.88C8.9 16.27 8.9 16.9 9.29 17.29C9.68 17.68 10.31 17.68 10.7 17.29L15.29 12.7C15.68 12.31 15.68 11.68 15.29 11.29L10.7 6.7C10.31 6.31 9.68 6.31 9.29 6.71Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card
              key={`${issuer.tokenName}-${issuer.id}`}
              className="opacity-60"
            >
              <CardContent className="flex items-center p-4">
                <div className="w-12 h-12 relative mr-4">
                  {issuer.iconUrl ? (
                    <Image
                      src={`/tokens/${issuer.iconUrl}`}
                      alt={`${issuer.tokenName} icon`}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {issuer.tokenTicker[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {issuer.tokenName}
                    </h2>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-sm font-medium">
                        Unverified / Not Supported
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{issuer.tokenTicker}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Verify website to view details
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  {issuer.websiteUrl && (
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (issuer.websiteUrl) {
                          window.open(
                            issuer.websiteUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
