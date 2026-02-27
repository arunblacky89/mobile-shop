"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type RazorpayPaymentData = {
  order_id: string;
  payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string;
};

export default function RazorpayCheckout({
  data,
}: {
  data: RazorpayPaymentData;
}) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "open" | "success" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const openedRef = useRef(false);

  function openRazorpay() {
    if (openedRef.current) return;
    openedRef.current = true;
    setState("open");

    const options = {
      key: data.razorpay_key_id,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpay_order_id,
      name: "MobileShop",
      description: `Order #${data.order_id.slice(0, 8)}`,
      handler: function () {
        setState("success");
        router.push(`/order/${data.order_id}`);
      },
      modal: {
        ondismiss: function () {
          setState("error");
          setErrorMsg("Payment was cancelled.");
          openedRef.current = false;
        },
      },
      theme: {
        color: "#2563eb",
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(options);

    rzp.on(
      "payment.failed",
      function (response: { error?: { description?: string } }) {
        setState("error");
        setErrorMsg(
          response?.error?.description || "Payment failed. Please try again.",
        );
        openedRef.current = false;
      },
    );

    rzp.open();
  }

  useEffect(() => {
    // Load Razorpay Checkout script
    if (document.querySelector('script[src*="razorpay"]')) {
      openRazorpay();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => openRazorpay();
    script.onerror = () => {
      setState("error");
      setErrorMsg("Failed to load Razorpay. Please check your connection.");
    };
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      {/* Loading */}
      {state === "loading" && (
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading payment gateway…
          </p>
        </div>
      )}

      {/* Razorpay modal is open */}
      {state === "open" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Complete Your Payment
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Razorpay payment window is open. Complete the payment to confirm your
            order.
          </p>
        </div>
      )}

      {/* Success */}
      {state === "success" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
            Payment Successful!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to your order…
          </p>
        </div>
      )}

      {/* Error / Cancelled */}
      {state === "error" && (
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
            Payment Not Completed
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{errorMsg}</p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={() => openRazorpay()}
              className="inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Retry Payment
            </button>
            <Link
              href={`/order/${data.order_id}`}
              className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              View order (pay later)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
