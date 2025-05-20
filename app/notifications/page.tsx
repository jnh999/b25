"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { PaymentRequest, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProfilePic } from "@/app/components/ProfilePic";
import { amountToLargestUnit } from "@/app/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type PaymentRequestWithUsers = PaymentRequest & {
  requestingUser: User;
  receivingUser: User;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const [paymentRequests, setPaymentRequests] = useState<
    PaymentRequestWithUsers[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser && !currentUserLoading) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const response = await fetch("/api/payment-requests");
        if (!response.ok) {
          throw new Error("Failed to fetch payment requests");
        }
        const data = await response.json();
        setPaymentRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, currentUserLoading, router]);

  if (loading || currentUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    const amountInLargestUnit = amountToLargestUnit(amount, currency);
    if (currency === "BTC") {
      return `${amountInLargestUnit} BTC`;
    }
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amountInLargestUnit);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 text-lg">
                No pending payment requests
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paymentRequests.map((request) => {
              const isPaying = request.receivingUserId === currentUser?.id;
              console.log({
                isPaying,
                currentUserId: currentUser?.id,
                requestUserId: request.requestingUserId,
              });
              const otherUser = isPaying
                ? request.requestingUser
                : request.receivingUser;

              return (
                <Card key={request.id}>
                  <CardContent className="pt-3">
                    {/* Memo and Actions as columns if both are present */}

                    <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4 mt-4">
                      {/* Left: Details (user info, time, memo) */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <div className="flex-shrink-0">
                            <ProfilePic user={otherUser} size="md" />
                          </div>
                          <p className="text-sm font-medium text-gray-500 ml-2">
                            {!isPaying
                              ? "You requested payment from"
                              : "Payment requested from"}{" "}
                            <Link
                              href={`/users/${otherUser.id}`}
                              className="text-gray-900 font-semibold hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                            >
                              {otherUser.name}
                            </Link>
                            <br />
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {request.memo && request.status === "PENDING" && (
                          <div className="mt-4 ml-14">
                            <p className="text-md text-gray-600 break-words max-w-xl mt-1">
                              {request.memo}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Divider and Actions */}
                      <div className="flex flex-row sm:flex-col items-end sm:items-center gap-0 sm:gap-2 sm:pl-6">
                        {/* Amount */}
                        <div className="mb-2 sm:mb-4 text-right w-full">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatAmount(request.amount, request.currency)}
                          </span>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-right">
                              {!isPaying && (
                                <div className="flex items-center justify-end gap-2 mt-1">
                                  <div
                                    role="status"
                                    aria-label={`Payment request status: ${request.status.toLowerCase()}`}
                                    className={`w-2 h-2 rounded-full ${
                                      request.status === "APPROVED"
                                        ? "bg-green-500"
                                        : request.status === "DENIED"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                    }`}
                                  />
                                  <p className="text-sm font-medium text-gray-600">
                                    {request.status.charAt(0) +
                                      request.status.slice(1).toLowerCase()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Buttons */}
                        {isPaying && (
                          <div className="flex gap-2 w-full justify-end">
                            <Button
                              onClick={async () => {
                                try {
                                  setPayLoading(request.id);
                                  const response = await fetch(
                                    `/api/payment-requests/${request.id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: "APPROVED",
                                      }),
                                    }
                                  );
                                  if (!response.ok) {
                                    throw new Error("Failed to update request");
                                  }
                                  // Refresh the page to show updated status
                                  window.location.reload();
                                } catch (error) {
                                  console.error(
                                    "Error updating request:",
                                    error
                                  );
                                  setPayLoading(null);
                                }
                              }}
                              disabled={payLoading === request.id}
                              className="w-32 py-2 text-sm rounded-md shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-105"
                            >
                              {payLoading === request.id ? "Paying..." : "Pay"}
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  setRejectLoading(request.id);
                                  const response = await fetch(
                                    `/api/payment-requests/${request.id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: "DENIED",
                                      }),
                                    }
                                  );
                                  if (!response.ok) {
                                    throw new Error("Failed to update request");
                                  }
                                  // Refresh the page to show updated status
                                  window.location.reload();
                                } catch (error) {
                                  console.error(
                                    "Error updating request:",
                                    error
                                  );
                                  setRejectLoading(null);
                                }
                              }}
                              disabled={rejectLoading === request.id}
                              variant="destructive"
                              className="w-32 py-2 text-sm rounded-md shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-105"
                            >
                              {rejectLoading === request.id
                                ? "Rejecting..."
                                : "Reject"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
