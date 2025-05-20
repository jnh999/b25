"use client";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Success! 🎉</h2>
        <p className="text-gray-600 mb-6">
          Your payment method has been added successfully.
        </p>
        <a
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
