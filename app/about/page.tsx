"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between mx-20 mt-10 px-20 py-20 pt-8 gap-5">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-primary">
            Building the Future of Global Finance
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            SparkX is revolutionizing cross-border payments by combining
            Bitcoin's security with Spark's innovative technology to create a
            truly global payment network.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Image
            src="/landing-v32.png"
            alt="Global finance illustration"
            width={600}
            height={600}
            className="rounded-xl w-full max-w-xs md:max-w-md"
            priority
          />
        </div>
      </section>

      {/* Mission */}
      <section className="px-20 mx-20 py-16 bg-gray-50 rounded-3xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-8">
            We've built a global peer-to-peer payment network that makes sending
            money worldwide as easy as sending a text message. By leveraging
            Spark, cross-border USD and Bitcoin payments are instant,
            ultra-cheap, and cryptographically transparent.
          </p>
          <div className="flex justify-center">
            <Image
              src="/landing-v5-gray2.png"
              alt="Mission illustration"
              width={400}
              height={400}
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Key Innovations */}
      <section className="px-20 mx-20 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-primary">
          Key Innovations
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-primary">
              Global Payment Network
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Instant peer-to-peer payments in Bitcoin and USD</li>
              <li>• Near-zero fees compared to traditional networks</li>
              <li>• Works for both banked and unbanked users</li>
              <li>• Built on Bitcoin's secure and trusted network</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-primary">
              Transparent Reserves
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Real-time balance verification via Stripe</li>
              <li>• Cryptographic audit trail with merkle trees</li>
              <li>• Licensed trust entity for added security</li>
              <li>• Complete transparency in operations</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-primary">
              Open Directory Layer
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Global User Directory for identity verification</li>
              <li>• Issuer Directory for transparent token registry</li>
              <li>• Open APIs for third-party integration</li>
              <li>• Network-wide interoperability</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-primary">
              Accessibility First
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Semantic HTML & ARIA compliance</li>
              <li>• Full keyboard navigation support</li>
              <li>• Screen reader optimization</li>
              <li>• High contrast visual design</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="px-20 mx-20 py-16 bg-primary text-white rounded-3xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Real-World Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold mb-2">7% → 1%</div>
              <p className="text-lg">Reduced payment fees</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-lg">Accessibility compliance</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">∞</div>
              <p className="text-lg">Global reach</p>
            </div>
          </div>
          <Image
            src="/landing-v2.png"
            alt="Impact illustration"
            width={400}
            height={400}
            className="rounded-xl mx-auto"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-20 mx-20 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-primary">
          Join the Revolution
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Be part of the future of global finance. Experience instant, secure,
          and accessible payments that work for everyone, everywhere.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}
