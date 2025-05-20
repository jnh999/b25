"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCode } from "@/lib/styleguide/qr";
import { ProfilePic } from "@/app/components/ProfilePic";
import { User } from "@prisma/client";
import { amountToLargestUnit } from "@/app/utils";
import { ExpandableText } from "@/lib/styleguide/expandableText";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { ExpandableTextFullPage } from "@/lib/styleguide";

interface DecodedInvoice {
  hrp: string;
  timestamp: number;
  amount: string;
  asset: string;
  description: string;
}

interface DestinationUser extends User {
  sparkAddress: string;
  lightningInvoice?: string;
}

interface InvoiceData {
  invoice: string;
  decoded: DecodedInvoice;
  destinationUser: DestinationUser | null;
}

export default function RequestPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [showSparkQR, setShowSparkQR] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function loadInvoiceData() {
      try {
        const response = await fetch(`/api/invoices/${params.invoice}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to load invoice");
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }

    if (params.invoice) {
      loadInvoiceData();
    }
  }, [params.invoice]);

  // Show loading state during SSR and initial client render
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="animate-pulse space-y-4"
          role="status"
          aria-live="polite"
          aria-label="Loading invoice details"
        >
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="bg-white p-8 rounded-lg shadow-md"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-full space-y-6">
              {data.destinationUser && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <ProfilePic user={data.destinationUser} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {data.destinationUser.username}
                      </h3>
                      {data.destinationUser.isXVerified && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-label="Verified account"
                        >
                          <path
                            d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {data.destinationUser.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {data.decoded.asset === "USD" ? "$" : null}
                    {amountToLargestUnit(
                      parseInt(data.decoded.amount),
                      data.decoded.asset
                    )}{" "}
                    {data.decoded.asset === "BTC" ? "BTC" : null}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-lg font-medium text-gray-900">
                    {data.decoded.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(data.decoded.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowSparkQR(!showSparkQR)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={showSparkQR}
                  aria-controls="spark-qr-section"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    Spark Invoice
                  </h3>
                  {showSparkQR ? (
                    <ChevronUpIcon
                      className="w-5 h-5 text-gray-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDownIcon
                      className="w-5 h-5 text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </button>

                {showSparkQR && (
                  <div id="spark-qr-section" className="space-y-4 pl-4">
                    <ExpandableTextFullPage
                      text={data.invoice}
                      label="Spark Invoice"
                      type="invoice"
                    />
                    <QRCode
                      value={data.invoice}
                      label="Spark Invoice"
                      size={300}
                      description="Scan this QR code to pay with Spark"
                    />
                  </div>
                )}
              </div>

              {data.destinationUser?.lightningInvoice && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowFallback(!showFallback)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-expanded={showFallback}
                    aria-controls="lightning-invoice-section"
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      Lightning Invoice
                    </h3>
                    {showFallback ? (
                      <ChevronUpIcon
                        className="w-5 h-5 text-gray-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDownIcon
                        className="w-5 h-5 text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {showFallback && (
                    <div
                      id="lightning-invoice-section"
                      className="space-y-4 pl-4"
                    >
                      {data.destinationUser?.lightningInvoice && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            Lightning Invoice
                          </p>
                          <ExpandableTextFullPage
                            text={data.destinationUser?.lightningInvoice}
                            label="Lightning Invoice"
                            type="invoice"
                          />
                          <QRCode
                            value={data.destinationUser?.lightningInvoice}
                            label="Lightning Invoice"
                            size={300}
                            description="Scan to pay with Lightning"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
