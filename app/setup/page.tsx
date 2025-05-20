"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [region, setRegion] = useState<"US" | "EU">("US");
  const [twitterProfile, setTwitterProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session?.user?.id) {
      router.push("/login");
    }
  }, [session, router, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region,
          twitterProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user settings");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating user settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Your Region
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRegion("US")}
                  className={`flex items-center justify-center p-4 border rounded-lg ${
                    region === "US"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="w-6 h-6 mr-2 relative">
                    <Image
                      src="/flags/us.svg"
                      alt="US Flag"
                      fill
                      sizes="24px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span>United States</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegion("EU")}
                  className={`flex items-center justify-center p-4 border rounded-lg ${
                    region === "EU"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="w-6 h-6 mr-2 relative">
                    <Image
                      src="/flags/eu.svg"
                      alt="EU Flag"
                      fill
                      sizes="24px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span>European Union</span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="x"
                className="block text-sm font-medium text-gray-700"
              >
                X Profile
              </label>
              <div className="mt-1">
                <input
                  id="x"
                  name="x"
                  type="text"
                  placeholder="https://x.com/username"
                  value={twitterProfile}
                  onChange={(e) => setTwitterProfile(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
