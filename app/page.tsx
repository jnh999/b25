"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between mx-20 mt-10 px-20 py-20 pt-8 gap-5">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-primary">
            Global Finance, Reimagined.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Send, receive, and manage money worldwide.
          </p>
          <div className="flex gap-4">
            <Link
              href="/register"
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-md"
              aria-label="Get started"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-md"
              aria-label="Learn more"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Image
            src="/landing3.png"
            alt="Colorful finance illustration"
            width={600}
            height={600}
            className="rounded-xl w-full max-w-xs md:max-w-md"
            priority
          />
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="flex flex-col md:flex-row justify-between gap-6 px-8 py-16 bg-primary"
      >
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">
          <div className="h-1 w-16 mx-auto mb-4 rounded" />
          <Image
            src="/icons/send.png"
            alt="Send & Receive Icon"
            width={150}
            height={150}
            className="mx-auto mb-3"
          />
          <h2 className="font-bold text-lg mb-2">Send & Receive Instantly</h2>
          <p className="text-gray-600">
            Transfer money globally in seconds, with no hidden fees.
          </p>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">
          <div className="h-1 w-16 mx-auto mb-4 rounded" />
          <Image
            src="/icons/multi-currency.png"
            alt="Multi-Currency Icon"
            width={150}
            height={150}
            className="mx-auto mb-3"
          />
          <h2 className="font-bold text-lg mb-2">Multi-Currency</h2>
          <p className="text-gray-600">
            USD and BTC (and EUR, coming soon) seamlessly managed in one place.
          </p>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">
          <div className="h-1 w-16 mx-auto mb-4 rounded" />
          <Image
            src="/icons/open.png"
            alt="Security Icon"
            width={150}
            height={150}
            className="mx-auto mb-3"
          />
          <h2 className="font-bold text-lg mb-2">Open Access</h2>
          <p className="text-gray-600">
            Transfer money globally, within SparkX and across other platforms.
          </p>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">
          <div className="h-1 w-16 mx-auto mb-4 rounded" />
          <Image
            src="/icons/proof.png"
            alt="Proof-of-Reserves Icon"
            width={150}
            height={150}
            className="mx-auto mb-3"
          />
          <h2 className="font-bold text-lg mb-2">Proof-of-Reserves</h2>
          <p className="text-gray-600">
            Transparent, verifiable token backing for total peace of mind.
          </p>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="px-8 py-16 bg-gray-50 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
          Trust & Security
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Built on Spark technology, with industry-leading encryption,
          compliance, and transparency.
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="font-semibold text-lg">Powered by</span>
          <Link href="https://spark.money" target="_blank" aria-label="Spark">
            <Image
              src="/logos/spark.svg"
              alt="Spark Badge"
              width={60}
              height={60}
              className="rounded"
            />
          </Link>
          <span className="font-semibold text-lg">+</span>
          <Link href="https://stripe.com" target="_blank" aria-label="Stripe">
            <Image
              src="/logos/stripe.png"
              alt="Stripe Badge"
              width={60}
              height={60}
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-8 py-8 border-t border-gray-100 text-gray-600 text-sm mt-auto">
        <div className="flex gap-6 mb-4 md:mb-0">
          <Link href="#privacy" className="hover:text-black">
            Privacy
          </Link>
          <Link href="#terms" className="hover:text-black">
            Terms
          </Link>
          <Link href="#support" className="hover:text-black">
            Support
          </Link>
        </div>
        <div className="flex gap-4">
          <a
            href="#x"
            aria-label="X"
            className="hover:text-black font-bold text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hover:text-black font-bold text-lg"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
            </svg>
          </a>
          <a
            href="#linkedin"
            aria-label="LinkedIn"
            className="hover:text-black font-bold text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              className="hover:text-black font-bold text-lg"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M8 11v5" />
              <path d="M8 8v.01" />
              <path d="M12 16v-5" />
              <path d="M16 16v-3a2 2 0 1 0 -4 0" />
              <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}
