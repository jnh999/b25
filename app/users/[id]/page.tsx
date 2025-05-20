"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ExpandableText } from "@/lib/styleguide";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";
import { ProfilePic } from "@/app/components/ProfilePic";
import { User as PrismaUser } from "@prisma/client";

type UserProfile = {
  id: string;
  name: string;
  username: string;
  profilePicUrl: string | null;
  isXVerified: boolean;
  xHandle: string;
  sparkWalletAddress?: string;
};

interface Transfer {
  id: string;
  requestingUserId: string;
  receivingUserId: string;
  requestingAmount: number;
  receivingAmount: number;
  requestingCurrency: string;
  receivingCurrency: string;
  status: string;
  memo?: string;
  createdAt: string;
  requestingUser: UserProfile;
  receivingUser: UserProfile;
}

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user: currentUser } = useCurrentUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle params Promise
  useEffect(() => {
    params.then(({ id }) => {
      setUserId(id);
    });
  }, [params]);

  // Fetch user data and transfers when userId is available
  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const [userResponse, transfersResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          currentUser ? fetch(`/api/users/${userId}/transfers`) : null,
        ]);

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch user");
        }

        const userData = await userResponse.json();
        setUser(userData);

        if (transfersResponse) {
          if (!transfersResponse.ok) {
            throw new Error("Failed to fetch transfers");
          }
          const transfersData = await transfersResponse.json();
          setTransfers(transfersData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, currentUser]);

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return currency === "BTC"
      ? amount / 100000000
      : formatter.format(amount / 100);
  };

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

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          {error || "Failed to load user details"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/users"
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
        Back to Users
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 relative">
          {user.profilePicUrl ? (
            <Image
              src={`/profile-pics/${user.profilePicUrl}`}
              alt={`${user.name}'s profile`}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-gray-500"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.isXVerified && (
              <svg
                className="w-6 h-6 text-primary"
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
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Profile Details Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-sm text-gray-500">X Profile</p>
                </div>
                <a
                  href={`https://x.com/${user.xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{user.xHandle}
                </a>
              </div>
              {user.sparkWalletAddress && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-gray-500">Address</p>
                  </div>
                  <ExpandableText
                    text={user.sparkWalletAddress}
                    label="Spark Wallet Address"
                    type="address"
                    hasBorder={false}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Transfers Section - Only show if logged in and not viewing own profile */}
        {currentUser && currentUser.id !== user.id && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Transfers</h2>
            {transfers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transfers yet</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {transfers.map((transfer) => {
                  const isRequesting =
                    transfer.requestingUserId === currentUser.id;
                  const otherUser = isRequesting
                    ? transfer.receivingUser
                    : transfer.requestingUser;

                  return (
                    <div
                      key={transfer.id}
                      className="py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <ProfilePic user={otherUser} size="md" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {isRequesting ? "You paid" : "You received from"}{" "}
                              {otherUser.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(
                                new Date(transfer.createdAt),
                                {
                                  addSuffix: true,
                                }
                              )}
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
                          <p className="text-md text-gray-600">
                            {transfer.memo}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
