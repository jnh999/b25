"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import React, { useState, useEffect } from "react";
import { ProfilePic } from "./components/ProfilePic";

export default function Header() {
  const { data: session, status } = useSession();
  const { user } = useCurrentUser();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    const menuItems = ["settings", "api", "signout"];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < menuItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < menuItems.length) {
          const action = menuItems[selectedIndex];
          if (action === "signout") {
            signOut();
          } else if (action === "settings") {
            window.location.href = "/settings";
          } else if (action === "api") {
            window.location.href = "/apiDocs";
          }
          setDropdownOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Fetch pending requests count
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/payment-requests")
        .then((res) => res.json())
        .then((data) => setPendingRequests(data.length))
        .catch((err) => console.error("Error fetching pending requests:", err));
    }
  }, [session?.user?.id]);

  return (
    <header className="flex justify-between items-center px-20 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Link aria-label="Home" href="/">
          <Image
            src="/logos/sparkx.png"
            alt="SparkX Logo"
            width={130}
            height={35.88}
            className="rounded w-[130px] h-auto"
          />
        </Link>
      </div>
      <nav className="flex items-center gap-8 text-base font-medium">
        {session?.user?.id && (
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="text-gray-600 hover:text-primary-hover transition"
          >
            Dashboard
          </Link>
        )}
        <Link
          href="/users"
          aria-label="Users"
          className="text-gray-600 hover:text-primary-hover transition"
        >
          Users
        </Link>
        <Link
          href="/issuers"
          aria-label="Issuers"
          className="text-gray-600 hover:text-primary-hover transition"
        >
          Issuers
        </Link>

        {session && (
          <>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative text-gray-600 hover:text-primary-hover transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </Link>

            <Link
              href="/transfer"
              aria-label="Transfer"
              className="bg-primary text-white px-5 py-2 rounded-full transition-all duration-200 hover:bg-primary-hover hover:scale-105 shadow-md"
            >
              Transfer
            </Link>
          </>
        )}

        {status === "loading" ? (
          <div
            className="w-10 h-10 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Loading your user profile"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          </div>
        ) : session ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setDropdownOpen((open) => !open)}
              onKeyDown={handleKeyDown}
              aria-label="Open profile menu"
              aria-expanded={dropdownOpen}
              aria-controls="profile-menu"
            >
              <ProfilePic user={user} size="md" />
            </button>
            {dropdownOpen && (
              <div
                id="profile-menu"
                className="absolute right-0 mt-2 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[180px]"
                role="menu"
              >
                <div className="mb-2">
                  <Link
                    href="/settings"
                    aria-label="Settings"
                    className={`ml-2 text-gray-600 hover:text-primary transition ${
                      selectedIndex === 0 ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    Settings
                  </Link>
                </div>
                <div className="mb-2">
                  <Link
                    href="/apiDocs"
                    aria-label="API"
                    className={`ml-2 text-gray-600 hover:text-primary transition ${
                      selectedIndex === 1 ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    Public API
                  </Link>
                </div>
                <div>
                  <button
                    onClick={() => signOut()}
                    aria-label="Sign Out"
                    className={`ml-2 text-gray-600 hover:text-primary transition ${
                      selectedIndex === 2 ? "bg-gray-100" : ""
                    }`}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="border-2 border-primary text-primary px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-md"
              aria-label="Log In"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-5 py-2 rounded-full transition-all duration-200 hover:bg-primary-hover hover:scale-105 shadow-md"
              aria-label="Sign Up"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
