"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterPage() {
  const session = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      if (errorRef.current) {
        errorRef.current.focus();
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        name,
        username,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        if (errorRef.current) {
          errorRef.current.focus();
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      if (errorRef.current) {
        errorRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during SSR and initial client render
  if (!isClient || session.status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (session.status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-center flex flex-col justify-top py-20 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">👋 Welcome!</h2>
        <p className="text-gray-600 mb-6">
          To streamline the hackathon demo, please use these test account
          credentials:
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="font-medium">
            Email: <span className="text-blue-600">derrick@me.com</span>
          </p>
          <p className="font-medium">
            Password: <span className="text-blue-600">testing</span>
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
