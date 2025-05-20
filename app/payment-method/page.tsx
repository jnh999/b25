"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { createSetupIntent } from "@/lib/services/stripe";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useSession } from "next-auth/react";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51O5DRcKkDsSWJkFwcKYfixPfQ7eImsOzugXSHZ9wMqQldSM0nMNNK8pyQHE06gZ3U8lJFp7YklZIFr5Q8xKB0wem00HaTJMguG"
);

export default function AddPaymentMethod() {
  const { user, loading } = useCurrentUser();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a setup intent when the component mounts
    const setupPaymentMethod = async () => {
      if (loading || !user) return;
      if (!user.stripeCustomerId) {
        setError("No Stripe customer ID found. Please contact support.");
        return;
      }

      try {
        const setupIntent = await createSetupIntent({
          customerId: user.stripeCustomerId,
        });
        setClientSecret(setupIntent.client_secret);
      } catch (err) {
        setError("Failed to initialize payment form");
        console.error(err);
      }
    };

    setupPaymentMethod();
  }, [user, loading]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Add Payment Method
        </h2>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
}

function PaymentForm() {
  const session = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  if (!session.data?.user?.id) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe failed to initialize");
      return;
    }

    const { error: stripeError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "An error occurred");
      setIsProcessing(false);
    } else {
      if (setupIntent.payment_method) {
        try {
          const response = await fetch("/api/payment-method", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentMethodId: setupIntent.payment_method,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to save payment method");
          }

          // Payment method was successfully added
          window.location.href = "/payment-method/success";
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to save payment method"
          );
          setIsProcessing(false);
        }
      } else {
        setError("Failed to add payment method");
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Add Payment Method"}
      </button>
    </form>
  );
}
