"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { CurrencyInput } from "@/lib/styleguide/currencyInput";

interface SettingsFormProps {
  user: User & {
    sparkWallet: {
      address: string;
    } | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [threshold, setThreshold] = useState<string>(
    (user.notificationThreshold && user.notificationThreshold > 0
      ? user.notificationThreshold.toString()
      : "") || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currency = user.region === "EU" ? "EUR" : "USD";
  const locale = user.region === "EU" ? "EU" : "US";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threshold: parseFloat(threshold),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({
        type: "success",
        text: "Settings saved successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="threshold"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {currency} Threshold
        </label>
        <CurrencyInput
          id="threshold"
          name="threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          currency={currency}
          locale={locale}
          label={`${currency} Threshold`}
          className="text-2xl"
          autoFocus={false}
        />
        <p className="mt-2 text-sm text-gray-500">
          Set the minimum {currency} amount for fund sweeps. Set to 0 to disable
          sweeps.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success" ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
