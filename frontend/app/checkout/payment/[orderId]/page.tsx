import { redirect } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RazorpayCheckout from "@/components/RazorpayCheckout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function PaymentPage({ params }: PageProps) {
  const { orderId } = await params;

  // Call backend to create a Razorpay order
  let paymentData: {
    order_id: string;
    payment_id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    razorpay_key_id: string;
  } | null = null;

  try {
    const res = await fetch(`${API_BASE}/api/orders/razorpay/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
      cache: "no-store",
    });

    if (res.status === 503) {
      // Razorpay keys not configured — skip payment, go to order page
      redirect(`/order/${orderId}`);
    }

    if (res.ok) {
      paymentData = await res.json();
    }
  } catch {
    // Backend unavailable — fall through to order page
  }

  // If we couldn't create a Razorpay order, redirect to order confirmation
  if (!paymentData) {
    redirect(`/order/${orderId}`);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/cart" className="hover:text-blue-600">
              Cart
            </Link>
            <span className="mx-1">/</span>
            <Link href="/checkout" className="hover:text-blue-600">
              Checkout
            </Link>
            <span className="mx-1">/</span>
            <span>Payment</span>
          </p>
        </div>

        {/* Order total */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Amount to pay
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{(paymentData.amount / 100).toLocaleString("en-IN")}{" "}
            <span className="text-base font-normal text-gray-400">
              {paymentData.currency}
            </span>
          </p>
        </div>

        {/* Razorpay checkout component */}
        <RazorpayCheckout data={paymentData} />
      </main>

      <Footer />
    </div>
  );
}
