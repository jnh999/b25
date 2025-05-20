"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Transfer, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProfilePic } from "@/app/components/ProfilePic";
import { placeholderBitcoinPriceUsd } from "../utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type TransferWithUsers = Transfer & {
  requestingUser: User;
  receivingUser: User;
};

export default function DashboardPage() {
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const [transfers, setTransfers] = useState<TransferWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<
    Array<{ currency: string; amount: number; formattedAmount: string }>
  >([]);

  useEffect(() => {
    if (!currentUser && !currentUserLoading) {
      redirect("/login");
    }

    async function fetchData() {
      try {
        const [transfersResponse, balancesResponse] = await Promise.all([
          fetch("/api/transfers"),
          fetch("/api/user/balances"),
        ]);

        if (!transfersResponse.ok) {
          throw new Error("Failed to fetch transfers");
        }
        if (!balancesResponse.ok) {
          throw new Error("Failed to fetch balances");
        }

        const [transfersData, balancesData] = await Promise.all([
          transfersResponse.json(),
          balancesResponse.json(),
        ]);

        setTransfers(transfersData);
        setBalances(balancesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, currentUserLoading]);

  if (loading || currentUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-3xl mx-auto"
          role="status"
          aria-live="polite"
          aria-label="Loading your balances and transfers"
        >
          {/* Loading skeleton for title */}
          <Skeleton className="h-8 w-48 mb-8" />

          {/* Loading skeleton for balances section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loading skeleton for transfers */}
          <Card>
            <CardContent className="p-0 divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return currency === "BTC"
      ? amount / 100000000
      : formatter.format(amount / 100); // Convert cents to dollars
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Balances Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {balances.map((balance) => (
                <div
                  key={balance.currency}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-500">{balance.currency}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {balance.currency === "BTC"
                      ? `${balance.formattedAmount} BTC`
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: balance.currency,
                        }).format(balance.amount)}
                  </p>
                  {balance.currency === "BTC" && (
                    <p className="text-sm text-gray-500">
                      ≈
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(balance.amount * placeholderBitcoinPriceUsd)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {transfers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">No transfers yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-gray-200">
              {transfers.map((transfer) => {
                const isRequesting =
                  transfer.requestingUserId === currentUser?.id;
                const otherUser = isRequesting
                  ? transfer.receivingUser
                  : transfer.requestingUser;

                return (
                  <div
                    key={transfer.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <ProfilePic user={otherUser} size="md" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {isRequesting ? "You paid" : ""}{" "}
                            <Link
                              href={`/users/${otherUser.id}`}
                              className="text-gray-900 font-semibold hover:text-primary transition"
                            >
                              {otherUser.name}
                            </Link>
                            {!isRequesting ? " paid you" : ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(transfer.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-medium ${
                            isRequesting ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isRequesting ? "-" : "+"}
                          {formatAmount(
                            transfer.receivingAmount,
                            transfer.receivingCurrency
                          )}
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              transfer.status === "COMPLETED"
                                ? "bg-green-500"
                                : transfer.status === "FAILED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <p className="text-sm text-gray-500">
                            {transfer.status.charAt(0) +
                              transfer.status.slice(1).toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {transfer.memo && (
                      <div className="mt-2 pl-14">
                        <p className="text-md text-gray-600">{transfer.memo}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
