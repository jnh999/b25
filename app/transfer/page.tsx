"use client";

import { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/lib/styleguide/currencyInput";
import Image from "next/image";
import { amountToSmallestUnit } from "@/app/utils";

type TransferMode = "send" | "receive";
type TransferMethod = "user" | "sparkAddress" | "invoice";
type TransferCurrency = "USD" | "BTC";

export default function TransferPage() {
  const router = useRouter();
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const [mode, setMode] = useState<TransferMode>("send");
  const [method, setMethod] = useState<TransferMethod>("user");
  const [currency, setCurrency] = useState<TransferCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sparkAddress, setSparkAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users?internal=true");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (!currentUser && !currentUserLoading) {
    router.push("/login");
    return null;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredUsers.length) {
          const user = filteredUsers[selectedIndex];
          setSelectedUser(user);
          setSearchQuery(user.name);
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "send" ? "/api/transfers/send" : "/api/transfers/receive";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(mode === "send"
            ? { destinationUserId: selectedUser?.id }
            : { sourceUserId: selectedUser?.id }),
          currency,
          amount: amountToSmallestUnit(
            parseFloat(amount.replace(/[^0-9.-]+/g, "")),
            currency
          ), // Convert to cents, removing any formatting
          ...(method === "sparkAddress" && {
            ...(mode === "send"
              ? { destinationSparkAddress: sparkAddress }
              : { sourceSparkAddress: sparkAddress }),
          }),
          ...(mode === "send" && method === "invoice" && { source: "invoice" }),
          memo,
          sparkAddress: selectedUser?.id ? "" : sparkAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process transfer");
      }

      if (mode === "send") {
        router.push("/dashboard");
      } else {
        const invoiceResponse = await response.json();
        router.push(`/request/${invoiceResponse.invoice}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Mode Toggle */}
            <div className="flex justify-center items-center gap-6 border-b pb-6">
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-gray-700">
                  Send
                </span>
                <Switch
                  checked={mode === "receive"}
                  onCheckedChange={() =>
                    setMode(mode === "send" ? "receive" : "send")
                  }
                  className={`${
                    mode === "receive" ? "bg-blue-700" : "bg-gray-500"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                  aria-label={`Transfer mode: ${
                    mode === "send" ? "Send" : "Receive"
                  } selected`}
                >
                  <span
                    className={`${
                      mode === "receive" ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    aria-hidden="true"
                  />
                </Switch>
                <span className="ml-4 text-sm font-medium text-gray-700">
                  Receive
                </span>
              </div>
            </div>

            {/* Recipient Section */}
            <div>
              <Label
                htmlFor="recipient-input"
                className="text-lg font-semibold mb-2"
              >
                Recipient
              </Label>
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="relative">
                  <Input
                    id="recipient-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      setSparkAddress(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowDropdown(false);
                        setSelectedIndex(-1);
                      }, 200);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      mode === "send"
                        ? "Add recipient, Spark address, or invoice..."
                        : "Add payer or Spark address..."
                    }
                    className="w-full text-lg border-2 border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                    aria-label="Recipient search"
                    aria-expanded={showDropdown}
                    aria-controls="recipient-dropdown"
                    aria-autocomplete="list"
                    role="combobox"
                  />
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      id="recipient-dropdown"
                      className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto"
                      role="listbox"
                    >
                      {filteredUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 ${
                            index === selectedIndex ? "bg-gray-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchQuery(user.name);
                            setShowDropdown(false);
                            setSelectedIndex(-1);
                          }}
                          role="option"
                          aria-selected={
                            selectedUser?.id === user.id ||
                            index === selectedIndex
                          }
                          tabIndex={-1}
                        >
                          <div
                            className="relative w-10 h-10 rounded-full overflow-hidden"
                            aria-hidden="true"
                          >
                            {user.profilePicUrl ? (
                              <Image
                                src={`/profile-pics/${user.profilePicUrl}`}
                                alt={`${user.name}'s profile`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <svg
                                  width="24"
                                  height="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="8" r="4" />
                                  <path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {user.name}
                              {user.isXVerified && (
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  aria-label="Verified user"
                                >
                                  <path
                                    d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.username}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="amount-input" className="text-lg font-semibold">
                  Amount
                </Label>
                <div className="flex items-center">
                  <span className="mr-4 text-sm font-medium text-gray-700">
                    USD
                  </span>
                  <Switch
                    checked={currency === "BTC"}
                    onCheckedChange={() =>
                      setCurrency(currency === "USD" ? "BTC" : "USD")
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                    aria-label={`Currency: ${currency} selected`}
                  >
                    <span
                      className={`${
                        currency === "BTC" ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      aria-hidden="true"
                    />
                  </Switch>
                  <span className="ml-4 text-sm font-medium text-gray-700">
                    BTC
                  </span>
                </div>
              </div>
              <CurrencyInput
                id="amount-input"
                currency={currency}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                locale="US"
                autoFocus={false}
                required
                aria-label={`Amount in ${currency}`}
                aria-required="true"
              />
              {currency === "BTC" && (
                <p className="mt-2 text-sm text-gray-600" role="note">
                  Bitcoin amounts are displayed in BTC. Make sure to
                  double-check the amount before sending.
                </p>
              )}
            </div>

            {/* Memo Section */}
            <div>
              <Label
                htmlFor="memo-input"
                className="text-lg font-semibold mb-2"
              >
                Memo (optional)
              </Label>
              <Input
                id="memo-input"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full text-4xl font-bold border-2 border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                placeholder="What's it for?"
                aria-label="Transaction memo"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-lg font-bold"
              disabled={loading}
              onClick={handleSubmit}
              aria-busy={loading}
            >
              {loading ? "Submitting..." : mode === "send" ? "Send" : "Request"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
