"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ExpandableText } from "@/lib/styleguide";
import { Secret } from "@/lib/styleguide";

interface UserWithWallet extends User {
  sparkWallet: {
    address: string;
    mnemonic: string;
  } | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserWithWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user settings");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Show loading state during SSR and initial client render
  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div
          className="grid gap-8"
          role="status"
          aria-live="polite"
          aria-label="Loading settings content"
        >
          {/* Profile Details Section Skeleton */}
          <section className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-semibold mb-4">Profile Details</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Spark Wallet Section Skeleton */}
          <section className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-semibold mb-4">Spark Wallet</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500" role="alert" aria-live="assertive">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-8">
        {/* Profile Details Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p>@{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">X Profile</p>
                <a
                  href={`https://x.com/${user.xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{user.xHandle}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <p>{user.region || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p>{new Date(user.registeredAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings Section */}
        {/* <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Sweep Settings</h2>
          <SettingsForm user={user} />
        </section> */}

        {/* Spark Wallet Section */}
        {user.sparkWallet && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Spark Wallet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-sm text-gray-500">Address</p>
                </div>
                <ExpandableText
                  text={user.sparkWallet.address}
                  label="Your Spark Wallet Address"
                  type="address"
                  hasBorder={false}
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-sm text-gray-500">Mnemonic</p>
                </div>
                <Secret
                  secret={user.sparkWallet.mnemonic}
                  label="Your Spark Wallet Mnemonic"
                  hasBorder={false}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
